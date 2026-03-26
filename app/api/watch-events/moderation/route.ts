import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { logModerationCase } from "@/lib/moderation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  buildWatchEventHref,
  finalizeWatchEventActivity,
  getWatchEventModeratorContext,
  logWatchEventModerationAction,
  type WatchAttendeeType,
} from "@/lib/watch-events";

export const dynamic = "force-dynamic";

type MessageRecord = {
  id: string;
  author_type: WatchAttendeeType;
  body: string;
  display_name: string;
  profile_id: string | null;
};

type HighlightRecord = {
  id: string;
  event_id: string;
  source_message_id: string | null;
  source_author_type: WatchAttendeeType | null;
  source_display_name: string | null;
  source_body: string | null;
  title: string;
  note: string;
  created_by_profile_id: string | null;
  created_by_display_name: string;
  highlighted_at: string;
};

function buildHighlightTitle(message: MessageRecord) {
  const prefix = message.author_type === "agent" ? "Agent marker" : "Human marker";
  const excerpt = message.body.replace(/\s+/g, " ").trim().slice(0, 64);
  return `${prefix}: ${excerpt}${message.body.length > 64 ? "..." : ""}`;
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const action = String(payload.action ?? "").trim();
  const eventId = String(payload.eventId ?? "").trim();

  if (!action || !eventId) {
    return NextResponse.json({ error: "Invalid moderation payload." }, { status: 400 });
  }

  const { profile, event } = await getWatchEventModeratorContext(eventId);

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!event) {
    return NextResponse.json({ error: "Watch event not found." }, { status: 404 });
  }

  const supabase = createSupabaseAdminClient();

  if (action === "remove-message") {
    const messageId = String(payload.messageId ?? "").trim();
    const reason = String(payload.reason ?? "").trim() || "Removed from the live human rail.";

    if (!messageId) {
      return NextResponse.json({ error: "Message id is required." }, { status: 400 });
    }

    const { data: message, error: messageError } = await supabase
      .from("watch_event_messages")
      .select("id, author_type, body, display_name, profile_id")
      .eq("id", messageId)
      .eq("event_id", eventId)
      .maybeSingle();

    if (messageError || !message) {
      return NextResponse.json({ error: "Message could not be found." }, { status: 404 });
    }

    const { error } = await supabase
      .from("watch_event_messages")
      .delete()
      .eq("id", messageId)
      .eq("event_id", eventId);

    if (error) {
      return NextResponse.json({ error: "Message could not be removed." }, { status: 500 });
    }

    const [, moderationEntry] = await Promise.all([
      logModerationCase({
        actorProfileId: profile.id,
        reason: "Watch lounge message removed.",
        caseType: "watch-event-message-removed",
        metadata: {
          watchEventId: eventId,
          watchEventMessageId: messageId,
        },
      }),
      logWatchEventModerationAction({
        eventId,
        actorProfileId: profile.id,
        actorDisplayName: profile.displayName,
        action: "remove-message",
        targetMessageId: messageId,
        targetProfileId: message.profile_id,
        targetDisplayName: message.display_name,
        reason,
        metadata: {
          authorType: message.author_type,
          excerpt: message.body.slice(0, 180),
        },
      }),
    ]);

    await finalizeWatchEventActivity(eventId, { captureSnapshot: true, refreshPeaks: false });
    revalidatePath(buildWatchEventHref({ slug: event.slug }));
    return NextResponse.json({ ok: true, moderationEntry });
  }

  if (action === "mute-attendee" || action === "unmute-attendee") {
    const attendeeId = String(payload.attendeeId ?? "").trim();

    if (!attendeeId) {
      return NextResponse.json({ error: "Attendee id is required." }, { status: 400 });
    }

    const { data: attendee, error: attendeeError } = await supabase
      .from("watch_event_attendees")
      .select("id, profile_id, display_name")
      .eq("id", attendeeId)
      .eq("event_id", eventId)
      .maybeSingle();

    if (attendeeError || !attendee || !attendee.profile_id) {
      return NextResponse.json({ error: "That attendee cannot be moderated." }, { status: 400 });
    }

    let reason: string | null = null;
    let metadata: Record<string, unknown> = {};

    if (action === "mute-attendee") {
      const durationMinutes = Math.max(5, Number.parseInt(String(payload.durationMinutes ?? "30"), 10) || 30);
      reason = String(payload.reason ?? "").trim() || "Host moderation";
      const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
      const { error } = await supabase.from("watch_event_mutes").upsert(
        {
          event_id: eventId,
          profile_id: attendee.profile_id,
          muted_by_profile_id: profile.id,
          reason,
          expires_at: expiresAt,
        },
        {
          onConflict: "event_id,profile_id",
        },
      );

      if (error) {
        return NextResponse.json({ error: "Mute could not be applied." }, { status: 500 });
      }

      metadata = {
        durationMinutes,
        expiresAt,
      };
    } else {
      reason = "Mute removed";
      const { error } = await supabase
        .from("watch_event_mutes")
        .delete()
        .eq("event_id", eventId)
        .eq("profile_id", attendee.profile_id);

      if (error) {
        return NextResponse.json({ error: "Mute could not be removed." }, { status: 500 });
      }
    }

    const [, moderationEntry] = await Promise.all([
      logModerationCase({
        actorProfileId: profile.id,
        reason: action === "mute-attendee" ? "Watch lounge attendee muted." : "Watch lounge attendee unmuted.",
        caseType: action === "mute-attendee" ? "watch-event-attendee-muted" : "watch-event-attendee-unmuted",
        metadata: {
          watchEventId: eventId,
          mutedProfileId: attendee.profile_id,
          attendeeName: attendee.display_name,
          ...metadata,
        },
      }),
      logWatchEventModerationAction({
        eventId,
        actorProfileId: profile.id,
        actorDisplayName: profile.displayName,
        action,
        targetProfileId: attendee.profile_id,
        targetDisplayName: attendee.display_name,
        reason,
        metadata,
      }),
    ]);

    await finalizeWatchEventActivity(eventId, { captureSnapshot: true, refreshPeaks: false });
    revalidatePath(buildWatchEventHref({ slug: event.slug }));
    return NextResponse.json({ ok: true, moderationEntry });
  }

  if (action === "highlight-message") {
    const messageId = String(payload.messageId ?? "").trim();
    const customTitle = String(payload.title ?? "").trim();
    const customNote = String(payload.note ?? "").trim();

    if (!messageId) {
      return NextResponse.json({ error: "Message id is required." }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("watch_event_replay_highlights")
      .select("id, event_id, source_message_id, source_author_type, source_display_name, source_body, title, note, created_by_profile_id, created_by_display_name, highlighted_at")
      .eq("event_id", eventId)
      .eq("source_message_id", messageId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: true, highlight: existing });
    }

    const { data: message, error: messageError } = await supabase
      .from("watch_event_messages")
      .select("id, author_type, body, display_name, profile_id")
      .eq("id", messageId)
      .eq("event_id", eventId)
      .maybeSingle();

    if (messageError || !message) {
      return NextResponse.json({ error: "Message could not be found." }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("watch_event_replay_highlights")
      .insert({
        event_id: eventId,
        source_message_id: message.id,
        source_author_type: message.author_type,
        source_display_name: message.display_name,
        source_body: message.body,
        title: customTitle || buildHighlightTitle(message),
        note:
          customNote ||
          (message.author_type === "agent"
            ? "Pinned from the companion rail for replay context."
            : "Pinned from the human rail for replay."),
        created_by_profile_id: profile.id,
        created_by_display_name: profile.displayName,
      })
      .select("id, event_id, source_message_id, source_author_type, source_display_name, source_body, title, note, created_by_profile_id, created_by_display_name, highlighted_at")
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: "Replay marker could not be pinned." }, { status: 500 });
    }

    const moderationEntry = await logWatchEventModerationAction({
      eventId,
      actorProfileId: profile.id,
      actorDisplayName: profile.displayName,
      action: "highlight-message",
      targetMessageId: message.id,
      targetProfileId: message.profile_id,
      targetDisplayName: message.display_name,
      reason: "Pinned into the replay dossier.",
      metadata: {
        authorType: message.author_type,
        excerpt: message.body.slice(0, 180),
        title: customTitle || null,
        note: customNote || null,
      },
    });

    revalidatePath(buildWatchEventHref({ slug: event.slug }));
    return NextResponse.json({ ok: true, highlight: data as HighlightRecord, moderationEntry });
  }

  if (action === "remove-highlight") {
    const highlightId = String(payload.highlightId ?? "").trim();

    if (!highlightId) {
      return NextResponse.json({ error: "Highlight id is required." }, { status: 400 });
    }

    const { data: highlight, error: highlightError } = await supabase
      .from("watch_event_replay_highlights")
      .select("id, source_message_id, source_display_name, title")
      .eq("id", highlightId)
      .eq("event_id", eventId)
      .maybeSingle();

    if (highlightError || !highlight) {
      return NextResponse.json({ error: "Replay marker not found." }, { status: 404 });
    }

    const { error } = await supabase
      .from("watch_event_replay_highlights")
      .delete()
      .eq("id", highlightId)
      .eq("event_id", eventId);

    if (error) {
      return NextResponse.json({ error: "Replay marker could not be removed." }, { status: 500 });
    }

    const moderationEntry = await logWatchEventModerationAction({
      eventId,
      actorProfileId: profile.id,
      actorDisplayName: profile.displayName,
      action: "remove-highlight",
      targetMessageId: highlight.source_message_id,
      targetDisplayName: highlight.source_display_name ?? highlight.title,
      reason: "Removed from the replay dossier.",
    });

    revalidatePath(buildWatchEventHref({ slug: event.slug }));
    return NextResponse.json({ ok: true, moderationEntry });
  }

  return NextResponse.json({ error: "Unsupported moderation action." }, { status: 400 });
}

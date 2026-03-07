import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentSessionProfile } from "@/lib/auth";
import { logModerationCase } from "@/lib/moderation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildWatchEventHref } from "@/lib/watch-events";

export const dynamic = "force-dynamic";

async function requireModeratorForEvent(eventId: string) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    return { profile: null, event: null } as const;
  }

  const supabase = createSupabaseAdminClient();
  const { data: event, error } = await supabase
    .from("watch_events")
    .select("id, slug, host_profile_id")
    .eq("id", eventId)
    .maybeSingle();

  if (error || !event) {
    return { profile, event: null } as const;
  }

  if (profile.role !== "admin" && event.host_profile_id !== profile.id) {
    return { profile: null, event: null } as const;
  }

  return {
    profile,
    event: event as { id: string; slug: string; host_profile_id: string | null },
  } as const;
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

  const { profile, event } = await requireModeratorForEvent(eventId);

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!event) {
    return NextResponse.json({ error: "Watch event not found." }, { status: 404 });
  }

  const supabase = createSupabaseAdminClient();

  if (action === "remove-message") {
    const messageId = String(payload.messageId ?? "").trim();

    if (!messageId) {
      return NextResponse.json({ error: "Message id is required." }, { status: 400 });
    }

    const { error } = await supabase
      .from("watch_event_messages")
      .delete()
      .eq("id", messageId)
      .eq("event_id", eventId);

    if (error) {
      return NextResponse.json({ error: "Message could not be removed." }, { status: 500 });
    }

    await logModerationCase({
      actorProfileId: profile.id,
      reason: "Watch lounge message removed.",
      caseType: "watch-event-message-removed",
      metadata: {
        watchEventId: eventId,
        watchEventMessageId: messageId,
      },
    });

    revalidatePath(buildWatchEventHref({ slug: event.slug }));
    return NextResponse.json({ ok: true });
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

    if (action === "mute-attendee") {
      const durationMinutes = Math.max(5, Number.parseInt(String(payload.durationMinutes ?? "30"), 10) || 30);
      const reason = String(payload.reason ?? "").trim() || null;
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

      await logModerationCase({
        actorProfileId: profile.id,
        reason: "Watch lounge attendee muted.",
        caseType: "watch-event-attendee-muted",
        metadata: {
          watchEventId: eventId,
          mutedProfileId: attendee.profile_id,
          attendeeName: attendee.display_name,
          durationMinutes,
        },
      });
    } else {
      const { error } = await supabase
        .from("watch_event_mutes")
        .delete()
        .eq("event_id", eventId)
        .eq("profile_id", attendee.profile_id);

      if (error) {
        return NextResponse.json({ error: "Mute could not be removed." }, { status: 500 });
      }

      await logModerationCase({
        actorProfileId: profile.id,
        reason: "Watch lounge attendee unmuted.",
        caseType: "watch-event-attendee-unmuted",
        metadata: {
          watchEventId: eventId,
          mutedProfileId: attendee.profile_id,
          attendeeName: attendee.display_name,
        },
      });
    }

    revalidatePath(buildWatchEventHref({ slug: event.slug }));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unsupported moderation action." }, { status: 400 });
}

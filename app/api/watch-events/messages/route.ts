import { NextResponse } from "next/server";
import { getCurrentSessionProfile } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  finalizeWatchEventActivity,
  getActiveWatchEventMute,
  getWatchEventInteractionError,
  resolveWatchEventRecord,
  upsertHumanWatchEventAttendee,
} from "@/lib/watch-events";

export const dynamic = "force-dynamic";

const MAX_MESSAGE_LENGTH = 600;
const RECENT_WINDOW_MS = 1000 * 60 * 2;
const DUPLICATE_WINDOW_MS = 1000 * 60 * 10;
const MAX_MESSAGES_PER_WINDOW = 4;

export async function POST(request: Request) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: Record<string, unknown>;

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const eventId = String(payload.eventId ?? "").trim();
  const body = String(payload.body ?? "").trim();

  if (!eventId || !body || body.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Invalid message payload." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const mute = await getActiveWatchEventMute(eventId, profile.id);

  if (mute) {
    return NextResponse.json({ error: "You are muted in this lounge." }, { status: 403 });
  }

  const now = Date.now();
  const recentWindowIso = new Date(now - RECENT_WINDOW_MS).toISOString();
  const duplicateWindowIso = new Date(now - DUPLICATE_WINDOW_MS).toISOString();
  const [{ data: recentMessages, error: recentError }, { data: duplicateMessage, error: duplicateError }] = await Promise.all([
    supabase
      .from("watch_event_messages")
      .select("id")
      .eq("event_id", eventId)
      .eq("profile_id", profile.id)
      .gte("created_at", recentWindowIso),
    supabase
      .from("watch_event_messages")
      .select("id")
      .eq("event_id", eventId)
      .eq("profile_id", profile.id)
      .eq("body", body)
      .gte("created_at", duplicateWindowIso)
      .maybeSingle(),
  ]);

  if (recentError || duplicateError) {
    return NextResponse.json({ error: "Message checks could not be completed." }, { status: 500 });
  }

  if ((recentMessages ?? []).length >= MAX_MESSAGES_PER_WINDOW) {
    return NextResponse.json({ error: "Slow down a bit before posting again." }, { status: 429 });
  }

  if (duplicateMessage) {
    return NextResponse.json({ error: "That message was already posted recently." }, { status: 429 });
  }

  const event = await resolveWatchEventRecord({ eventId });

  if (!event) {
    return NextResponse.json({ error: "Watch event not found." }, { status: 404 });
  }

  const interactionError = getWatchEventInteractionError(event, {
    actorType: "human",
    kind: "message",
  });

  if (interactionError) {
    return NextResponse.json({ error: interactionError.error }, { status: interactionError.statusCode });
  }

  try {
    await upsertHumanWatchEventAttendee({
      event,
      profileId: profile.id,
      displayName: profile.displayName,
      presenceState: "watching",
    });
  } catch {
    return NextResponse.json({ error: "Message could not be sent." }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("watch_event_messages")
    .insert({
      event_id: eventId,
      profile_id: profile.id,
      author_type: "human",
      display_name: profile.displayName,
      agent_slug: null,
      body,
      trust_level: null,
      is_official_creator_agent: false,
    })
    .select("id, event_id, author_type, display_name, profile_id, agent_slug, body, trust_level, is_official_creator_agent, created_at")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Message could not be sent." }, { status: 500 });
  }

  await finalizeWatchEventActivity(eventId);
  return NextResponse.json({ ok: true, message: data }, { status: 201 });
}

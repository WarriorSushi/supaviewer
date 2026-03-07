import { NextResponse } from "next/server";
import { getCurrentSessionProfile } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { refreshWatchEventPeakCounts, type WatchPresenceState } from "@/lib/watch-events";

export const dynamic = "force-dynamic";

const validPresenceStates = new Set<WatchPresenceState>([
  "watching",
  "taking-notes",
  "answering-questions",
  "hosting",
  "away",
]);

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
  const presenceState = String(payload.presenceState ?? "watching").trim() as WatchPresenceState;

  if (!eventId || !validPresenceStates.has(presenceState)) {
    return NextResponse.json({ error: "Invalid presence payload." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: event, error: eventError } = await supabase
    .from("watch_events")
    .select("id, host_profile_id")
    .eq("id", eventId)
    .maybeSingle();

  if (eventError || !event) {
    return NextResponse.json({ error: "Watch event not found." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("watch_event_attendees")
    .upsert(
      {
        event_id: eventId,
        profile_id: profile.id,
        attendee_type: "human",
        display_name: profile.displayName,
        agent_slug: null,
        presence_state: presenceState,
        trust_level: null,
        is_official_creator_agent: false,
        is_host: event.host_profile_id === profile.id,
        last_seen_at: new Date().toISOString(),
      },
      {
        onConflict: "event_id,profile_id",
      },
    )
    .select("id, event_id, attendee_type, display_name, profile_id, agent_slug, presence_state, trust_level, is_official_creator_agent, is_host, joined_at, last_seen_at")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Presence could not be updated." }, { status: 500 });
  }

  await refreshWatchEventPeakCounts(eventId);
  return NextResponse.json({ ok: true, attendee: data });
}

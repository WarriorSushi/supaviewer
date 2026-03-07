import { NextResponse } from "next/server";
import { authenticateAgentRequest, logAgentRun } from "@/lib/agents";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { refreshWatchEventPeakCounts } from "@/lib/watch-events";

export const dynamic = "force-dynamic";

const validPresenceStates = new Set([
  "watching",
  "taking-notes",
  "answering-questions",
  "hosting",
  "away",
]);

async function resolveWatchEvent(body: Record<string, unknown>) {
  const eventId = String(body.event_id ?? "").trim();
  const eventSlug = String(body.event_slug ?? "").trim();
  const supabase = createSupabaseAdminClient();

  if (!eventId && !eventSlug) {
    return null;
  }

  const query = supabase
    .from("watch_events")
    .select("id, official_agent_id")
    .limit(1);

  const { data, error } = eventId
    ? await query.eq("id", eventId).maybeSingle()
    : await query.eq("slug", eventSlug).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as { id: string; official_agent_id: string | null } | null;
}

export async function POST(request: Request) {
  const agentSession = await authenticateAgentRequest("comment");

  if (!agentSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (agentSession.agent.trustLevel === "sandbox") {
    return NextResponse.json({ error: "This agent is still sandboxed for public lounge presence." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const presenceState = String(body.presence_state ?? "watching").trim();

    if (!validPresenceStates.has(presenceState)) {
      await logAgentRun(agentSession.agent.id, "watch-event-attend", "rejected", {
        reason: "invalid-presence-state",
      });

      return NextResponse.json({ error: "Invalid presence state." }, { status: 400 });
    }

    const event = await resolveWatchEvent(body);

    if (!event) {
      await logAgentRun(agentSession.agent.id, "watch-event-attend", "rejected", {
        reason: "event-not-found",
      });

      return NextResponse.json({ error: "Watch event not found." }, { status: 404 });
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("watch_event_attendees").upsert(
      {
        event_id: event.id,
        agent_id: agentSession.agent.id,
        agent_slug: agentSession.agent.slug,
        attendee_type: "agent",
        display_name: agentSession.agent.name,
        presence_state: presenceState,
        trust_level: agentSession.agent.trustLevel,
        is_official_creator_agent: agentSession.agent.isOfficialCreatorAgent,
        is_host: event.official_agent_id === agentSession.agent.id,
        last_seen_at: new Date().toISOString(),
      },
      {
        onConflict: "event_id,agent_id",
      },
    );

    if (error) {
      await logAgentRun(agentSession.agent.id, "watch-event-attend", "failed", {
        reason: "upsert-failed",
      });

      return NextResponse.json({ error: "Agent presence could not be recorded." }, { status: 500 });
    }

    await refreshWatchEventPeakCounts(event.id);
    await logAgentRun(agentSession.agent.id, "watch-event-attend", "created", {
      watchEventId: event.id,
      presenceState,
    });

    return NextResponse.json({ ok: true, watch_event_id: event.id, presence_state: presenceState }, { status: 201 });
  } catch {
    await logAgentRun(agentSession.agent.id, "watch-event-attend", "failed", {
      reason: "invalid-json",
    });

    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}

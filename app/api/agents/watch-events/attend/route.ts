import { NextResponse } from "next/server";
import { authenticateAgentRequest, logAgentRun } from "@/lib/agents";
import {
  finalizeWatchEventActivity,
  getWatchEventInteractionError,
  resolveWatchEventRecord,
  upsertAgentWatchEventAttendee,
  type WatchPresenceState,
} from "@/lib/watch-events";

export const dynamic = "force-dynamic";

const validPresenceStates = new Set<WatchPresenceState>([
  "watching",
  "taking-notes",
  "answering-questions",
  "hosting",
  "away",
]);

export async function POST(request: Request) {
  const agentSession = await authenticateAgentRequest("comment");

  if (!agentSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (agentSession.agent.trustLevel === "sandbox") {
    return NextResponse.json({ error: "This agent is still sandboxed for public lounge presence." }, { status: 403 });
  }

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    await logAgentRun(agentSession.agent.id, "watch-event-attend", "failed", {
      reason: "invalid-json",
    });

    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const presenceState = String(body.presence_state ?? "watching").trim() as WatchPresenceState;

    if (!validPresenceStates.has(presenceState)) {
      await logAgentRun(agentSession.agent.id, "watch-event-attend", "rejected", {
        reason: "invalid-presence-state",
      });

      return NextResponse.json({ error: "Invalid presence state." }, { status: 400 });
    }

    const event = await resolveWatchEventRecord({
      eventId: String(body.event_id ?? "").trim(),
      eventSlug: String(body.event_slug ?? "").trim(),
    });

    if (!event) {
      await logAgentRun(agentSession.agent.id, "watch-event-attend", "rejected", {
        reason: "event-not-found",
      });

      return NextResponse.json({ error: "Watch event not found." }, { status: 404 });
    }

    const interactionError = getWatchEventInteractionError(event, {
      actorType: "agent",
      kind: "presence",
    });

    if (interactionError) {
      await logAgentRun(agentSession.agent.id, "watch-event-attend", "rejected", {
        reason: `lifecycle-${event.phase}`,
      });

      return NextResponse.json({ error: interactionError.error }, { status: interactionError.statusCode });
    }

    try {
      await upsertAgentWatchEventAttendee({
        event,
        agentId: agentSession.agent.id,
        agentSlug: agentSession.agent.slug,
        displayName: agentSession.agent.name,
        presenceState,
        trustLevel: agentSession.agent.trustLevel,
        isOfficialCreatorAgent: agentSession.agent.isOfficialCreatorAgent,
      });
    } catch {
      await logAgentRun(agentSession.agent.id, "watch-event-attend", "failed", {
        reason: "upsert-failed",
      });

      return NextResponse.json({ error: "Agent presence could not be recorded." }, { status: 500 });
    }

    await finalizeWatchEventActivity(event.id);
    await logAgentRun(agentSession.agent.id, "watch-event-attend", "created", {
      watchEventId: event.id,
      presenceState,
    });

    return NextResponse.json({ ok: true, watch_event_id: event.id, presence_state: presenceState }, { status: 201 });
  } catch {
    await logAgentRun(agentSession.agent.id, "watch-event-attend", "failed", {
      reason: "server-error",
    });

    return NextResponse.json({ error: "Agent presence could not be recorded." }, { status: 500 });
  }
}

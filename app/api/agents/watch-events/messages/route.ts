import { NextResponse } from "next/server";
import {
  authenticateAgentRequest,
  checkAgentPublicActionPolicy,
  logAgentRun,
} from "@/lib/agents";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  finalizeWatchEventActivity,
  getWatchEventInteractionError,
  resolveWatchEventRecord,
  upsertAgentWatchEventAttendee,
} from "@/lib/watch-events";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const agentSession = await authenticateAgentRequest("comment");

  if (!agentSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (agentSession.agent.trustLevel === "sandbox") {
    return NextResponse.json({ error: "This agent is still sandboxed for public lounge messages." }, { status: 403 });
  }

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    await logAgentRun(agentSession.agent.id, "watch-event-message", "failed", {
      reason: "invalid-json",
    });

    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const messageBody = String(body.body ?? "").trim();

    if (!messageBody) {
      await logAgentRun(agentSession.agent.id, "watch-event-message", "rejected", {
        reason: "missing-body",
      });

      return NextResponse.json({ error: "Message body is required." }, { status: 400 });
    }

    const event = await resolveWatchEventRecord({
      eventId: String(body.event_id ?? "").trim(),
      eventSlug: String(body.event_slug ?? "").trim(),
    });

    if (!event) {
      await logAgentRun(agentSession.agent.id, "watch-event-message", "rejected", {
        reason: "event-not-found",
      });

      return NextResponse.json({ error: "Watch event not found." }, { status: 404 });
    }

    const interactionError = getWatchEventInteractionError(event, {
      actorType: "agent",
      kind: "message",
    });

    if (interactionError) {
      await logAgentRun(agentSession.agent.id, "watch-event-message", "rejected", {
        reason: `lifecycle-${event.phase}`,
      });

      return NextResponse.json({ error: interactionError.error }, { status: interactionError.statusCode });
    }

    const actionPolicy = await checkAgentPublicActionPolicy(agentSession.agent, "comment");

    if (!actionPolicy.ok) {
      await logAgentRun(agentSession.agent.id, "watch-event-message", "rejected", {
        reason: actionPolicy.reason,
      });

      return NextResponse.json({ error: actionPolicy.error }, { status: actionPolicy.statusCode });
    }

    const supabase = createSupabaseAdminClient();
    await upsertAgentWatchEventAttendee({
      event,
      agentId: agentSession.agent.id,
      agentSlug: agentSession.agent.slug,
      displayName: agentSession.agent.name,
      presenceState: "answering-questions",
      trustLevel: agentSession.agent.trustLevel,
      isOfficialCreatorAgent: agentSession.agent.isOfficialCreatorAgent,
    });

    const { data, error } = await supabase
      .from("watch_event_messages")
      .insert({
        event_id: event.id,
        agent_id: agentSession.agent.id,
        agent_slug: agentSession.agent.slug,
        author_type: "agent",
        display_name: agentSession.agent.name,
        body: messageBody,
        trust_level: agentSession.agent.trustLevel,
        is_official_creator_agent: agentSession.agent.isOfficialCreatorAgent,
      })
      .select("id")
      .maybeSingle();

    if (error || !data) {
      await logAgentRun(agentSession.agent.id, "watch-event-message", "failed", {
        reason: "insert-failed",
      });

      return NextResponse.json({ error: "Agent lounge message could not be created." }, { status: 500 });
    }

    await finalizeWatchEventActivity(event.id);
    await logAgentRun(agentSession.agent.id, "watch-event-message", "created", {
      watchEventId: event.id,
      watchEventMessageId: data.id,
    });

    return NextResponse.json({ ok: true, watch_event_id: event.id, message_id: data.id }, { status: 201 });
  } catch {
    await logAgentRun(agentSession.agent.id, "watch-event-message", "failed", {
      reason: "server-error",
    });

    return NextResponse.json({ error: "Agent lounge message could not be created." }, { status: 500 });
  }
}

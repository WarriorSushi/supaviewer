import { NextResponse } from "next/server";
import {
  authenticateAgentRequest,
  checkAgentPublicActionPolicy,
  logAgentRun,
} from "@/lib/agents";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { refreshWatchEventPeakCounts } from "@/lib/watch-events";

export const dynamic = "force-dynamic";

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
    return NextResponse.json({ error: "This agent is still sandboxed for public lounge messages." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const messageBody = String(body.body ?? "").trim();

    if (!messageBody) {
      await logAgentRun(agentSession.agent.id, "watch-event-message", "rejected", {
        reason: "missing-body",
      });

      return NextResponse.json({ error: "Message body is required." }, { status: 400 });
    }

    const event = await resolveWatchEvent(body);

    if (!event) {
      await logAgentRun(agentSession.agent.id, "watch-event-message", "rejected", {
        reason: "event-not-found",
      });

      return NextResponse.json({ error: "Watch event not found." }, { status: 404 });
    }

    const actionPolicy = await checkAgentPublicActionPolicy(agentSession.agent, "comment");

    if (!actionPolicy.ok) {
      await logAgentRun(agentSession.agent.id, "watch-event-message", "rejected", {
        reason: actionPolicy.reason,
      });

      return NextResponse.json({ error: actionPolicy.error }, { status: actionPolicy.statusCode });
    }

    const supabase = createSupabaseAdminClient();
    const now = new Date().toISOString();
    await supabase.from("watch_event_attendees").upsert(
      {
        event_id: event.id,
        agent_id: agentSession.agent.id,
        agent_slug: agentSession.agent.slug,
        attendee_type: "agent",
        display_name: agentSession.agent.name,
        presence_state: "answering-questions",
        trust_level: agentSession.agent.trustLevel,
        is_official_creator_agent: agentSession.agent.isOfficialCreatorAgent,
        is_host: event.official_agent_id === agentSession.agent.id,
        last_seen_at: now,
      },
      {
        onConflict: "event_id,agent_id",
      },
    );

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

    await refreshWatchEventPeakCounts(event.id);
    await logAgentRun(agentSession.agent.id, "watch-event-message", "created", {
      watchEventId: event.id,
      watchEventMessageId: data.id,
    });

    return NextResponse.json({ ok: true, watch_event_id: event.id, message_id: data.id }, { status: 201 });
  } catch {
    await logAgentRun(agentSession.agent.id, "watch-event-message", "failed", {
      reason: "invalid-json",
    });

    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}

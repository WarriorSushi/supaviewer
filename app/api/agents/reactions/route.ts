import { NextResponse } from "next/server";
import {
  authenticateAgentRequest,
  checkAgentPublicActionPolicy,
  logAgentRun,
} from "@/lib/agents";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function resolveFilmId(identifier: string) {
  const supabase = createSupabaseAdminClient();
  const serial = Number.parseInt(identifier.split("-")[0] ?? identifier, 10);
  const query = supabase
    .from("films")
    .select("id")
    .in("visibility", ["public", "limited"])
    .limit(1);

  const { data, error } = Number.isNaN(serial)
    ? await query.eq("slug", identifier).maybeSingle()
    : await query.eq("serial_number", serial).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id as string | undefined;
}

export async function POST(request: Request) {
  const agentSession = await authenticateAgentRequest("react");

  if (!agentSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (agentSession.agent.trustLevel === "sandbox") {
    return NextResponse.json({ error: "This agent is still sandboxed for public reactions." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const identifier = String(body.film_identifier ?? "").trim();

    if (!identifier) {
      await logAgentRun(agentSession.agent.id, "react", "rejected", {
        reason: "missing-film",
      });

      return NextResponse.json({ error: "Film identifier is required." }, { status: 400 });
    }

    const filmId = await resolveFilmId(identifier);

    if (!filmId) {
      await logAgentRun(agentSession.agent.id, "react", "rejected", {
        reason: "film-not-found",
      });

      return NextResponse.json({ error: "Film not found." }, { status: 404 });
    }

    const actionPolicy = await checkAgentPublicActionPolicy(agentSession.agent, "react");

    if (!actionPolicy.ok) {
      await logAgentRun(agentSession.agent.id, "react", "rejected", {
        reason: actionPolicy.reason,
      });

      return NextResponse.json({ error: actionPolicy.error }, { status: actionPolicy.statusCode });
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("agent_reactions").upsert({
      agent_id: agentSession.agent.id,
      film_id: filmId,
      signal_type: "interested",
    });

    if (error) {
      await logAgentRun(agentSession.agent.id, "react", "failed", {
        reason: "upsert-failed",
      });

      return NextResponse.json({ error: "Agent reaction could not be recorded." }, { status: 500 });
    }

    await logAgentRun(agentSession.agent.id, "react", "created", {
      filmId,
    });

    return NextResponse.json({ ok: true, film_id: filmId, signal: "interested" }, { status: 201 });
  } catch {
    await logAgentRun(agentSession.agent.id, "react", "failed", {
      reason: "invalid-json",
    });

    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}

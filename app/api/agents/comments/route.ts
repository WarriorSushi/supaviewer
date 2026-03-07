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
  const agentSession = await authenticateAgentRequest("comment");

  if (!agentSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (agentSession.agent.trustLevel === "sandbox") {
    return NextResponse.json({ error: "This agent is still sandboxed for public comments." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const identifier = String(body.film_identifier ?? "").trim();
    const commentBody = String(body.body ?? "").trim();

    if (!identifier || !commentBody) {
      await logAgentRun(agentSession.agent.id, "comment", "rejected", {
        reason: "missing-fields",
      });

      return NextResponse.json({ error: "Film identifier and body are required." }, { status: 400 });
    }

    const filmId = await resolveFilmId(identifier);

    if (!filmId) {
      await logAgentRun(agentSession.agent.id, "comment", "rejected", {
        reason: "film-not-found",
      });

      return NextResponse.json({ error: "Film not found." }, { status: 404 });
    }

    const actionPolicy = await checkAgentPublicActionPolicy(agentSession.agent, "comment");

    if (!actionPolicy.ok) {
      await logAgentRun(agentSession.agent.id, "comment", "rejected", {
        reason: actionPolicy.reason,
      });

      return NextResponse.json({ error: actionPolicy.error }, { status: actionPolicy.statusCode });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("comments")
      .insert({
        film_id: filmId,
        profile_id: agentSession.agent.ownerProfileId,
        agent_id: agentSession.agent.id,
        author_type: "agent",
        body: commentBody,
      })
      .select("id")
      .maybeSingle();

    if (error || !data) {
      await logAgentRun(agentSession.agent.id, "comment", "failed", {
        reason: "insert-failed",
      });

      return NextResponse.json({ error: "Agent reply could not be created." }, { status: 500 });
    }

    await logAgentRun(agentSession.agent.id, "comment", "created", {
      commentId: data.id,
      filmId,
    });

    return NextResponse.json({ ok: true, comment_id: data.id }, { status: 201 });
  } catch {
    await logAgentRun(agentSession.agent.id, "comment", "failed", {
      reason: "invalid-json",
    });

    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}

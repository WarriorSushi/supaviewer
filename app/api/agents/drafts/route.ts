import { NextResponse } from "next/server";
import { authenticateAgentRequest, logAgentRun } from "@/lib/agents";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { parseYouTubeVideo } from "@/lib/youtube";

export const dynamic = "force-dynamic";

function parseRuntimeMinutes(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  if (typeof value !== "string") {
    return null;
  }

  const parsed = Number.parseInt(value.replace(/[^\d]/g, ""), 10);
  return Number.isNaN(parsed) ? null : parsed;
}

async function isEmbeddableYouTubeVideo(canonicalUrl: string) {
  const endpoint = new URL("https://www.youtube.com/oembed");
  endpoint.searchParams.set("url", canonicalUrl);
  endpoint.searchParams.set("format", "json");

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      next: { revalidate: 0 },
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const agentSession = await authenticateAgentRequest("submit_drafts");

  if (!agentSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const youtubeUrl = String(body.youtube_url ?? "").trim();
    const proposedTitle = String(body.proposed_title ?? "").trim();
    const format = String(body.format ?? "").trim();
    const genre = String(body.genre ?? "").trim();
    const logline = String(body.logline ?? "").trim();
    const runtimeMinutes = parseRuntimeMinutes(body.runtime_minutes);
    const tools = Array.isArray(body.tools)
      ? body.tools.map((tool) => String(tool).trim()).filter(Boolean)
      : String(body.tools ?? "")
          .split(",")
          .map((tool) => tool.trim())
          .filter(Boolean);

    if (!youtubeUrl || !proposedTitle || !format || !genre || !logline || !runtimeMinutes) {
      await logAgentRun(agentSession.agent.id, "submit_drafts", "rejected", {
        reason: "missing-fields",
      });

      return NextResponse.json({ error: "Missing required draft fields." }, { status: 400 });
    }

    const parsedVideo = parseYouTubeVideo(youtubeUrl);

    if (!parsedVideo) {
      await logAgentRun(agentSession.agent.id, "submit_drafts", "rejected", {
        reason: "invalid-youtube-url",
      });

      return NextResponse.json({ error: "Invalid YouTube URL." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const [existingFilmResult, existingSubmissionResult, embeddable] = await Promise.all([
      supabase.from("films").select("id", { head: true, count: "exact" }).eq("youtube_video_id", parsedVideo.videoId),
      supabase
        .from("submissions")
        .select("id, status")
        .eq("youtube_video_id", parsedVideo.videoId)
        .neq("status", "rejected")
        .limit(1)
        .maybeSingle(),
      isEmbeddableYouTubeVideo(parsedVideo.canonicalUrl),
    ]);

    if ((existingFilmResult.count ?? 0) > 0 || existingSubmissionResult.data) {
      await logAgentRun(agentSession.agent.id, "submit_drafts", "rejected", {
        reason: "duplicate-video",
      });

      return NextResponse.json({ error: "That YouTube source already exists in the catalog or review queue." }, { status: 409 });
    }

    if (!embeddable) {
      await logAgentRun(agentSession.agent.id, "submit_drafts", "rejected", {
        reason: "unembeddable-video",
      });

      return NextResponse.json({ error: "That YouTube video is not embeddable." }, { status: 400 });
    }

    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .insert({
        profile_id: agentSession.agent.ownerProfileId,
        creator_id: agentSession.agent.creatorId,
        youtube_url: parsedVideo.canonicalUrl,
        youtube_video_id: parsedVideo.videoId,
        proposed_title: proposedTitle,
        runtime_minutes: runtimeMinutes,
        format,
        genre,
        logline,
        tools,
        rights_confirmed: true,
        ai_confirmed: true,
        status: "draft",
      })
      .select("id")
      .maybeSingle();

    if (submissionError || !submission) {
      await logAgentRun(agentSession.agent.id, "submit_drafts", "failed", {
        reason: "insert-failed",
      });

      return NextResponse.json({ error: "The draft could not be created." }, { status: 500 });
    }

    await supabase.from("agent_submissions").insert({
      agent_id: agentSession.agent.id,
      submission_id: submission.id,
      owner_profile_id: agentSession.agent.ownerProfileId,
      draft_status: "draft",
      generation_metadata: {
        source: "agent-api",
      },
    });

    await logAgentRun(agentSession.agent.id, "submit_drafts", "created", {
      submissionId: submission.id,
    });

    return NextResponse.json(
      {
        ok: true,
        submission_id: submission.id,
        review_path: "/studio",
        status: "draft",
      },
      { status: 201 },
    );
  } catch {
    await logAgentRun(agentSession.agent.id, "submit_drafts", "failed", {
      reason: "invalid-json",
    });

    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}

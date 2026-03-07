"use server";

import { redirect } from "next/navigation";
import { getCurrentSessionProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseYouTubeVideo } from "@/lib/youtube";

function parseRuntimeMinutes(value: string) {
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

export async function submitFilm(formData: FormData) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    redirect("/login?next=/submit");
  }

  const youtubeUrl = String(formData.get("youtube_url") ?? "").trim();
  const proposedTitle = String(formData.get("proposed_title") ?? "").trim();
  const runtimeInput = String(formData.get("runtime_minutes") ?? "").trim();
  const format = String(formData.get("format") ?? "").trim();
  const genre = String(formData.get("genre") ?? "").trim();
  const logline = String(formData.get("logline") ?? "").trim();
  const toolsInput = String(formData.get("tools") ?? "").trim();
  const aiConfirmed = formData.get("ai_confirmed") === "on";
  const rightsConfirmed = formData.get("rights_confirmed") === "on";
  const acceptsSerialPolicy = formData.get("serial_policy_confirmed") === "on";

  if (!youtubeUrl || !proposedTitle || !format || !genre || !logline) {
    redirect("/submit?error=missing-fields");
  }

  if (!aiConfirmed || !rightsConfirmed || !acceptsSerialPolicy) {
    redirect("/submit?error=confirmations-required");
  }

  const runtimeMinutes = parseRuntimeMinutes(runtimeInput);
  const parsedVideo = parseYouTubeVideo(youtubeUrl);

  if (!parsedVideo) {
    redirect("/submit?error=invalid-youtube-url");
  }

  if (!runtimeMinutes || runtimeMinutes <= 0) {
    redirect("/submit?error=invalid-runtime");
  }

  const supabase = await createSupabaseServerClient();
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

  if (existingFilmResult.error) {
    redirect("/submit?error=duplicate-check-failed");
  }

  if (existingSubmissionResult.error && existingSubmissionResult.error.code !== "PGRST116") {
    redirect("/submit?error=duplicate-check-failed");
  }

  if ((existingFilmResult.count ?? 0) > 0 || existingSubmissionResult.data) {
    redirect("/submit?error=duplicate-video");
  }

  if (!embeddable) {
    redirect("/submit?error=unembeddable-video");
  }

  const { error } = await supabase.from("submissions").insert({
    profile_id: profile.id,
    youtube_url: parsedVideo.canonicalUrl,
    youtube_video_id: parsedVideo.videoId,
    proposed_title: proposedTitle,
    runtime_minutes: runtimeMinutes,
    format,
    genre,
    logline,
    tools: toolsInput
      .split(",")
      .map((tool) => tool.trim())
      .filter(Boolean),
    rights_confirmed: rightsConfirmed,
    ai_confirmed: aiConfirmed,
    status: "submitted",
  });

  if (error) {
    redirect("/submit?error=submit-failed");
  }

  redirect("/submit?success=1");
}

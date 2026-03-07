import { getFilmAgentState } from "@/lib/agents";
import { getCurrentSessionProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function firstRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export async function getFilmSocialState(filmId: string, creatorId?: string | null) {
  const supabase = await createSupabaseServerClient();
  const { profile } = await getCurrentSessionProfile();

  const [
    { count: humanCommentsCount },
    { data: commentsData },
    likedResult,
    savedResult,
    agentState,
  ] = await Promise.all([
    supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("film_id", filmId)
      .eq("author_type", "human"),
    supabase
      .from("comments")
      .select("id, body, created_at, profiles (display_name)")
      .eq("film_id", filmId)
      .eq("author_type", "human")
      .order("created_at", { ascending: false })
      .limit(12),
    profile
      ? supabase
          .from("likes")
          .select("film_id")
          .eq("film_id", filmId)
          .eq("profile_id", profile.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    profile
      ? supabase
          .from("saves")
          .select("film_id")
          .eq("film_id", filmId)
          .eq("profile_id", profile.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    getFilmAgentState(filmId, creatorId),
  ]);

  const comments = (commentsData ?? []).map((comment) => ({
    id: comment.id as string,
    body: comment.body as string,
    createdAt: comment.created_at as string,
    author:
      firstRelation(comment.profiles as { display_name?: string } | { display_name?: string }[] | null)?.display_name ??
      "viewer",
  }));

  return {
    commentsCount: humanCommentsCount ?? comments.length,
    comments,
    agentCommentsCount: agentState.agentComments.length,
    agentComments: agentState.agentComments,
    agentReactionCount: agentState.reactionCount,
    agentsWatching: agentState.agentsWatching,
    officialAgents: agentState.officialAgents,
    liked: Boolean(likedResult.data),
    saved: Boolean(savedResult.data),
  };
}

export async function getCreatorFollowState(creatorId: string) {
  const supabase = await createSupabaseServerClient();
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    return { following: false };
  }

  const { data } = await supabase
    .from("follows")
    .select("creator_id")
    .eq("creator_id", creatorId)
    .eq("profile_id", profile.id)
    .maybeSingle();

  return { following: Boolean(data) };
}

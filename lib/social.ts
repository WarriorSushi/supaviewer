import { getCurrentSessionProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getFilmSocialState(filmId: string) {
  const supabase = await createSupabaseServerClient();
  const { profile } = await getCurrentSessionProfile();

  const [
    { count: commentsCount },
    { data: commentsData },
    likedResult,
    savedResult,
  ] = await Promise.all([
    supabase.from("comments").select("*", { count: "exact", head: true }).eq("film_id", filmId),
    supabase
      .from("comments")
      .select("id, body, created_at, profiles (display_name)")
      .eq("film_id", filmId)
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
  ]);

  const comments = (commentsData ?? []).map((comment) => ({
    id: comment.id as string,
    body: comment.body as string,
    createdAt: comment.created_at as string,
    author:
      ((comment.profiles as { display_name?: string }[] | null)?.[0])?.display_name ?? "viewer",
  }));

  return {
    commentsCount: commentsCount ?? comments.length,
    comments,
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

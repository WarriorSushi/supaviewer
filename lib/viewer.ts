import { getCurrentSessionProfile } from "@/lib/auth";
import { type Film } from "@/lib/catalog";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type LibraryFilmRow = {
  films: {
    id: string;
    serial_number: number;
    slug: string;
    title: string;
    logline: string | null;
    synopsis: string | null;
    youtube_url: string;
    runtime_minutes: number;
    release_year: number | null;
    format: string;
    genre: string;
    mood: string | null;
    tools: string[] | null;
    languages: string[] | null;
    featured_weight: number;
    discussion_count: number;
    views_count: number;
    saves_count: number;
    published_at: string | null;
    creators: { slug: string; name: string }[] | null;
  }[] | null;
};

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  })
    .format(value)
    .toLowerCase();
}

function themeForFilm(slug: string) {
  const themes: Record<string, { hero: string; card: string }> = {
    "afterlight-valley": {
      hero: "bg-[radial-gradient(circle_at_top_left,rgba(244,195,117,0.28),transparent_34%),linear-gradient(135deg,rgba(36,49,89,0.98),rgba(9,12,22,0.98))]",
      card: "bg-[radial-gradient(circle_at_top,rgba(255,214,153,0.3),transparent_58%),linear-gradient(135deg,rgba(39,52,89,0.96),rgba(9,12,22,0.98))]",
    },
    "glass-horizon": {
      hero: "bg-[radial-gradient(circle_at_10%_20%,rgba(177,200,255,0.22),transparent_32%),linear-gradient(135deg,rgba(23,36,68,0.98),rgba(7,10,20,0.98))]",
      card: "bg-[radial-gradient(circle_at_top,rgba(174,187,255,0.2),transparent_56%),linear-gradient(135deg,rgba(23,36,68,0.96),rgba(7,10,20,0.98))]",
    },
    "echoes-for-avalon": {
      hero: "bg-[radial-gradient(circle_at_85%_8%,rgba(244,195,117,0.28),transparent_34%),linear-gradient(135deg,rgba(40,32,66,0.98),rgba(9,12,22,0.98))]",
      card: "bg-[radial-gradient(circle_at_top,rgba(244,195,117,0.24),transparent_58%),linear-gradient(135deg,rgba(40,32,66,0.96),rgba(9,12,22,0.98))]",
    },
  };

  return themes[slug] ?? themes["afterlight-valley"];
}

function mapFilm(row: NonNullable<LibraryFilmRow["films"]>[number]): Film {
  const theme = themeForFilm(row.slug);
  const creator = row.creators?.[0];

  return {
    id: row.id,
    serial: row.serial_number,
    title: row.title,
    slug: row.slug,
    creatorSlug: creator?.slug ?? "unknown",
    creatorName: creator?.name ?? "Unknown",
    runtimeMinutes: row.runtime_minutes,
    releaseYear: row.release_year,
    format: row.format,
    genre: row.genre,
    mood: row.mood,
    tools: row.tools ?? [],
    logline: row.logline ?? "",
    synopsis: row.synopsis ?? "",
    credits: [],
    languages: row.languages ?? [],
    discussionCount: row.discussion_count,
    saves: formatCompactNumber(row.saves_count),
    views: formatCompactNumber(row.views_count),
    featuredWeight: row.featured_weight,
    publishedAt: row.published_at,
    youtubeUrl: row.youtube_url,
    heroClassName: theme.hero,
    cardClassName: theme.card,
    collectionSlugs: [],
  };
}

export async function getViewerLibrary() {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    return { saved: [], liked: [], claims: [], submissions: [] };
  }

  const supabase = await createSupabaseServerClient();
  const [savedResult, likedResult, claimsResult, submissionsResult] = await Promise.all([
    supabase
      .from("saves")
      .select(
        "films (id, serial_number, slug, title, logline, synopsis, youtube_url, runtime_minutes, release_year, format, genre, mood, tools, languages, featured_weight, discussion_count, views_count, saves_count, published_at, creators (slug, name))",
      )
      .eq("profile_id", profile.id),
    supabase
      .from("likes")
      .select(
        "films (id, serial_number, slug, title, logline, synopsis, youtube_url, runtime_minutes, release_year, format, genre, mood, tools, languages, featured_weight, discussion_count, views_count, saves_count, published_at, creators (slug, name))",
      )
      .eq("profile_id", profile.id),
    supabase
      .from("creator_claim_requests")
      .select("id, status, created_at, creators (name, slug)")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("submissions")
      .select("id, proposed_title, status, created_at")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false }),
  ]);

  const saved = (savedResult.data ?? [])
    .map((row) => (row as LibraryFilmRow).films?.[0])
    .filter(Boolean)
    .map((film) => mapFilm(film!));

  const liked = (likedResult.data ?? [])
    .map((row) => (row as LibraryFilmRow).films?.[0])
    .filter(Boolean)
    .map((film) => mapFilm(film!));

  return {
    saved,
    liked,
    claims: (claimsResult.data ?? []).map((claim) => ({
      id: claim.id as string,
      status: claim.status as string,
      createdAt: claim.created_at as string,
      creatorName: ((claim.creators as { name?: string }[] | null)?.[0])?.name ?? "Unknown",
      creatorSlug: ((claim.creators as { slug?: string }[] | null)?.[0])?.slug ?? "",
    })),
    submissions: (submissionsResult.data ?? []).map((submission) => ({
      id: submission.id as string,
      title: submission.proposed_title as string,
      status: submission.status as string,
      createdAt: submission.created_at as string,
    })),
  };
}

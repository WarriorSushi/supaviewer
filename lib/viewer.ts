import { getCurrentSessionProfile } from "@/lib/auth";
import { buildYouTubeThumbnailUrl, type Film } from "@/lib/catalog";
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
    visibility: string;
    availability_note: string | null;
    creators: { slug: string; name: string } | { slug: string; name: string }[] | null;
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
      hero: "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_34%),linear-gradient(135deg,rgba(30,30,35,0.98),rgba(8,8,10,0.98))]",
      card: "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_58%),linear-gradient(135deg,rgba(32,32,37,0.96),rgba(8,8,10,0.98))]",
    },
    "glass-horizon": {
      hero: "bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.12),transparent_32%),linear-gradient(135deg,rgba(26,26,32,0.98),rgba(8,8,10,0.98))]",
      card: "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_56%),linear-gradient(135deg,rgba(27,27,32,0.96),rgba(8,8,10,0.98))]",
    },
    "echoes-for-avalon": {
      hero: "bg-[radial-gradient(circle_at_85%_8%,rgba(255,255,255,0.14),transparent_34%),linear-gradient(135deg,rgba(34,34,38,0.98),rgba(9,9,11,0.98))]",
      card: "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_58%),linear-gradient(135deg,rgba(33,33,38,0.96),rgba(9,9,11,0.98))]",
    },
  };

  return themes[slug] ?? themes["afterlight-valley"];
}

function firstRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function mapFilm(row: NonNullable<LibraryFilmRow["films"]>[number]): Film {
  const theme = themeForFilm(row.slug);
  const creator = firstRelation(row.creators);

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
    thumbnailUrl: buildYouTubeThumbnailUrl(row.youtube_url),
    visibility: row.visibility,
    availabilityNote: row.availability_note,
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
        "films (id, serial_number, slug, title, logline, synopsis, youtube_url, runtime_minutes, release_year, format, genre, mood, tools, languages, featured_weight, discussion_count, views_count, saves_count, published_at, visibility, availability_note, creators (slug, name))",
      )
      .eq("profile_id", profile.id),
    supabase
      .from("likes")
      .select(
        "films (id, serial_number, slug, title, logline, synopsis, youtube_url, runtime_minutes, release_year, format, genre, mood, tools, languages, featured_weight, discussion_count, views_count, saves_count, published_at, visibility, availability_note, creators (slug, name))",
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
    .map((row) => firstRelation((row as LibraryFilmRow).films))
    .filter(Boolean)
    .map((film) => mapFilm(film!));

  const liked = (likedResult.data ?? [])
    .map((row) => firstRelation((row as LibraryFilmRow).films))
    .filter(Boolean)
    .map((film) => mapFilm(film!));

  return {
    saved,
    liked,
    claims: (claimsResult.data ?? []).map((claim) => ({
      id: claim.id as string,
      status: claim.status as string,
      createdAt: claim.created_at as string,
      creatorName: firstRelation(claim.creators as { name?: string } | { name?: string }[] | null)?.name ?? "Unknown",
      creatorSlug: firstRelation(claim.creators as { slug?: string } | { slug?: string }[] | null)?.slug ?? "",
    })),
    submissions: (submissionsResult.data ?? []).map((submission) => ({
      id: submission.id as string,
      title: submission.proposed_title as string,
      status: submission.status as string,
      createdAt: submission.created_at as string,
    })),
  };
}

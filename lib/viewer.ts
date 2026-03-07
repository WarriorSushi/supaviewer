import { getCurrentSessionProfile } from "@/lib/auth";
import { buildYouTubeThumbnailUrl, type Film } from "@/lib/catalog";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type LibraryFilmRow = {
  films: {
    id: string;
    creator_id: string;
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
      hero: "bg-[linear-gradient(135deg,rgba(31,31,35,0.98),rgba(18,18,22,0.98)_42%,rgba(7,7,9,0.99)_78%)]",
      card: "bg-[linear-gradient(180deg,rgba(28,28,32,0.96),rgba(14,14,18,0.98))]",
    },
    "glass-horizon": {
      hero: "bg-[linear-gradient(135deg,rgba(28,28,32,0.98),rgba(16,16,20,0.98)_42%,rgba(7,7,9,0.99)_78%)]",
      card: "bg-[linear-gradient(180deg,rgba(25,25,29,0.96),rgba(14,14,18,0.98))]",
    },
    "echoes-for-avalon": {
      hero: "bg-[linear-gradient(135deg,rgba(36,36,40,0.98),rgba(18,18,21,0.98)_42%,rgba(8,8,10,0.99)_78%)]",
      card: "bg-[linear-gradient(180deg,rgba(31,31,35,0.96),rgba(15,15,18,0.98))]",
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
    creatorId: row.creator_id,
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
    founderBadge: null,
    trophies: [],
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
        "films (id, creator_id, serial_number, slug, title, logline, synopsis, youtube_url, runtime_minutes, release_year, format, genre, mood, tools, languages, featured_weight, discussion_count, views_count, saves_count, published_at, visibility, availability_note, creators (slug, name))",
      )
      .eq("profile_id", profile.id),
    supabase
      .from("likes")
      .select(
        "films (id, creator_id, serial_number, slug, title, logline, synopsis, youtube_url, runtime_minutes, release_year, format, genre, mood, tools, languages, featured_weight, discussion_count, views_count, saves_count, published_at, visibility, availability_note, creators (slug, name))",
      )
      .eq("profile_id", profile.id),
    supabase
      .from("creator_claim_requests")
      .select("id, status, created_at, creators (name, slug)")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("submissions")
      .select("id, proposed_title, status, created_at, rejection_reason, rejection_details, agent_submissions (draft_status, promoted_at, agents (name, slug))")
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
    submissions: (submissionsResult.data ?? []).map((submission) => {
      const agentSubmission = firstRelation(
        submission.agent_submissions as
          | {
              draft_status?: string | null;
              promoted_at?: string | null;
              agents?: { name?: string; slug?: string } | { name?: string; slug?: string }[] | null;
            }
          | {
              draft_status?: string | null;
              promoted_at?: string | null;
              agents?: { name?: string; slug?: string } | { name?: string; slug?: string }[] | null;
            }[]
          | null,
      );
      const agent = firstRelation(
        agentSubmission?.agents as
          | { name?: string; slug?: string }
          | { name?: string; slug?: string }[]
          | null,
      );

      return {
        id: submission.id as string,
        title: submission.proposed_title as string,
        status: submission.status as string,
        createdAt: submission.created_at as string,
        rejectionReason: (submission.rejection_reason as string | null) ?? null,
        rejectionDetails: (submission.rejection_details as string | null) ?? null,
        agentDraftStatus: agentSubmission?.draft_status ?? null,
        agentPromotedAt: agentSubmission?.promoted_at ?? null,
        agentName: agent?.name ?? null,
        agentSlug: agent?.slug ?? null,
      };
    }),
  };
}

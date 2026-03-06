import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Film = {
  id: string;
  serial: number;
  title: string;
  slug: string;
  creatorSlug: string;
  creatorName: string;
  runtimeMinutes: number;
  releaseYear: number | null;
  format: string;
  genre: string;
  mood: string | null;
  tools: string[];
  logline: string;
  synopsis: string;
  credits: { role: string; name: string }[];
  languages: string[];
  discussionCount: number;
  saves: string;
  views: string;
  featuredWeight: number;
  publishedAt: string | null;
  youtubeUrl: string;
  thumbnailUrl: string;
  visibility: string;
  availabilityNote: string | null;
  heroClassName: string;
  cardClassName: string;
  collectionSlugs: string[];
};

export type Creator = {
  id: string;
  slug: string;
  name: string;
  headline: string;
  bio: string;
  location: string;
  filmsDirected: number;
  followers: string;
  heroClassName: string;
  ownerProfileId: string | null;
};

export type Collection = {
  id: string;
  slug: string;
  name: string;
  description: string;
  countLabel: string;
  heroClassName: string;
};

type FilmRow = {
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
  creators:
    | {
        slug: string;
        name: string;
      }
    | {
        slug: string;
        name: string;
      }[]
    | null;
};

type CreatorRow = {
  id: string;
  slug: string;
  name: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  followers_count: number;
  profile_id: string | null;
};

const creatorThemes: Record<string, string> = {
  "mira-sol":
    "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_54%),linear-gradient(135deg,rgba(38,38,44,0.98),rgba(10,10,12,0.98))]",
  "jun-vale":
    "bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.12),transparent_38%),linear-gradient(135deg,rgba(28,28,34,0.98),rgba(8,8,11,0.98))]",
  "anik-dey":
    "bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.14),transparent_42%),linear-gradient(135deg,rgba(34,34,39,0.98),rgba(10,10,12,0.98))]",
  "ari-nox":
    "bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.1),transparent_34%),linear-gradient(135deg,rgba(31,31,36,0.98),rgba(10,10,12,0.98))]",
};

const filmHeroThemes: Record<string, string> = {
  "afterlight-valley":
    "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_34%),linear-gradient(135deg,rgba(30,30,35,0.98),rgba(8,8,10,0.98))]",
  "glass-horizon":
    "bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.12),transparent_32%),linear-gradient(135deg,rgba(26,26,32,0.98),rgba(8,8,10,0.98))]",
  "echoes-for-avalon":
    "bg-[radial-gradient(circle_at_85%_8%,rgba(255,255,255,0.14),transparent_34%),linear-gradient(135deg,rgba(34,34,38,0.98),rgba(9,9,11,0.98))]",
  "static-bloom":
    "bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.1),transparent_36%),linear-gradient(135deg,rgba(29,29,34,0.98),rgba(8,8,10,0.98))]",
  "orchard-of-zero":
    "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_32%),linear-gradient(135deg,rgba(35,35,40,0.98),rgba(9,9,11,0.98))]",
  "salt-atlas":
    "bg-[radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.12),transparent_32%),linear-gradient(135deg,rgba(32,32,37,0.98),rgba(9,9,11,0.98))]",
  "the-quiet-machine":
    "bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.12),transparent_32%),linear-gradient(135deg,rgba(24,24,29,0.98),rgba(8,8,10,0.98))]",
};

const filmCardThemes: Record<string, string> = {
  "afterlight-valley":
    "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_58%),linear-gradient(135deg,rgba(32,32,37,0.96),rgba(8,8,10,0.98))]",
  "glass-horizon":
    "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_56%),linear-gradient(135deg,rgba(27,27,32,0.96),rgba(8,8,10,0.98))]",
  "echoes-for-avalon":
    "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_58%),linear-gradient(135deg,rgba(33,33,38,0.96),rgba(9,9,11,0.98))]",
  "static-bloom":
    "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_52%),linear-gradient(135deg,rgba(30,30,34,0.96),rgba(8,8,10,0.98))]",
  "orchard-of-zero":
    "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_58%),linear-gradient(135deg,rgba(34,34,39,0.96),rgba(9,9,11,0.98))]",
  "salt-atlas":
    "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_58%),linear-gradient(135deg,rgba(31,31,36,0.96),rgba(9,9,11,0.98))]",
  "the-quiet-machine":
    "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_56%),linear-gradient(135deg,rgba(25,25,30,0.96),rgba(8,8,10,0.98))]",
};

const collectionThemes: Record<string, string> = {
  "festival-contenders":
    "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent_34%),linear-gradient(135deg,rgba(28,28,33,0.98),rgba(9,9,11,0.98))]",
  "midnight-surrealism":
    "bg-[radial-gradient(circle_at_84%_10%,rgba(255,255,255,0.08),transparent_30%),linear-gradient(135deg,rgba(24,24,29,0.98),rgba(9,9,11,0.98))]",
  "first-100":
    "bg-[radial-gradient(circle_at_10%_12%,rgba(255,255,255,0.08),transparent_34%),linear-gradient(135deg,rgba(30,30,35,0.98),rgba(9,9,11,0.98))]",
};

const filmCredits: Record<string, { role: string; name: string }[]> = {
  "afterlight-valley": [
    { role: "Director", name: "Mira Sol" },
    { role: "Sound", name: "Sami Velez" },
    { role: "Edit", name: "Nika Rowe" },
  ],
  "glass-horizon": [
    { role: "Director", name: "Jun Vale" },
    { role: "Score", name: "Iris Doman" },
    { role: "Color", name: "Jae Min" },
  ],
  "echoes-for-avalon": [
    { role: "Director", name: "Anik Dey" },
    { role: "Production Design", name: "Nora Rahman" },
    { role: "Composer", name: "Tuhin Sen" },
  ],
  "static-bloom": [
    { role: "Director", name: "Ari Nox" },
    { role: "Score", name: "Len Kade" },
    { role: "Mix", name: "Reina Holt" },
  ],
  "orchard-of-zero": [
    { role: "Director", name: "Mira Sol" },
    { role: "Producer", name: "Lena Arcos" },
    { role: "Sound", name: "Sami Velez" },
  ],
  "salt-atlas": [
    { role: "Director", name: "Anik Dey" },
    { role: "Writer", name: "Diya Ray" },
    { role: "Composer", name: "Tuhin Sen" },
  ],
  "the-quiet-machine": [
    { role: "Director", name: "Jun Vale" },
    { role: "Producer", name: "Hana Kim" },
    { role: "Edit", name: "Jae Min" },
  ],
};

export const homePrinciples = [
  "Long-form films over disposable clips",
  "Public serial numbers that reward early creators",
  "Mobile fast without feeling like a short-form app",
  "Editorial taste with scalable ranking underneath",
];

function extractYouTubeVideoId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "") || null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
  } catch {
    return null;
  }

  return null;
}

export function buildYouTubeThumbnailUrl(url: string) {
  const id = extractYouTubeVideoId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  })
    .format(value)
    .toLowerCase();
}

function firstRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function mapFilm(row: FilmRow, collectionSlugs: string[] = []): Film {
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
    credits: filmCredits[row.slug] ?? [],
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
    heroClassName: filmHeroThemes[row.slug] ?? filmHeroThemes["afterlight-valley"],
    cardClassName: filmCardThemes[row.slug] ?? filmCardThemes["afterlight-valley"],
    collectionSlugs,
  };
}

function mapCreator(row: CreatorRow, filmsDirected: number): Creator {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    headline: row.headline ?? "",
    bio: row.bio ?? "",
    location: row.location ?? "",
    filmsDirected,
    followers: formatCompactNumber(row.followers_count),
    heroClassName: creatorThemes[row.slug] ?? creatorThemes["mira-sol"],
    ownerProfileId: row.profile_id,
  };
}

export function buildFilmHref(film: Pick<Film, "serial" | "slug">) {
  return `/films/${film.serial}-${film.slug}`;
}

export function buildCreatorHref(creator: Pick<Creator, "slug">) {
  return `/creators/${creator.slug}`;
}

async function getPublicFilmRows() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("films")
    .select(
      "id, serial_number, slug, title, logline, synopsis, youtube_url, runtime_minutes, release_year, format, genre, mood, tools, languages, featured_weight, discussion_count, views_count, saves_count, published_at, visibility, availability_note, creators (slug, name)",
    )
    .in("visibility", ["public", "limited"]);

  if (error) {
    throw new Error(`Failed to load films: ${error.message}`);
  }

  return (data ?? []) as FilmRow[];
}

async function getCollectionMembership() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("collection_films")
    .select("film_id, collections (slug)");

  if (error) {
    throw new Error(`Failed to load collection membership: ${error.message}`);
  }

  const membership = new Map<string, string[]>();

  for (const row of data ?? []) {
    const filmId = row.film_id as string;
    const slug = ((row.collections as { slug?: string }[] | null)?.[0])?.slug;
    if (!slug) continue;
    membership.set(filmId, [...(membership.get(filmId) ?? []), slug]);
  }

  return membership;
}

async function getMappedFilms() {
  const [filmRows, membership] = await Promise.all([
    getPublicFilmRows(),
    getCollectionMembership(),
  ]);

  return filmRows.map((row) => mapFilm(row, membership.get(row.id) ?? []));
}

export async function getFeaturedFilms(limit = 4) {
  const films = await getMappedFilms();
  return films.sort((a, b) => b.featuredWeight - a.featuredWeight).slice(0, limit);
}

export async function getLatestFilms(limit = 4) {
  const films = await getMappedFilms();
  return films
    .sort(
      (a, b) =>
        new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime(),
    )
    .slice(0, limit);
}

export async function getTrendingFilms(limit = 4) {
  const films = await getMappedFilms();
  return films.sort((a, b) => b.discussionCount - a.discussionCount).slice(0, limit);
}

export async function getFilmByIdentifier(identifier: string) {
  const serial = Number.parseInt(identifier.split("-")[0] ?? identifier, 10);
  const films = await getMappedFilms();

  if (!Number.isNaN(serial)) {
    const serialMatch = films.find((film) => film.serial === serial) ?? null;
    if (serialMatch) {
      return serialMatch;
    }
  } else {
    const slugMatch = films.find((film) => film.slug === identifier) ?? null;
    if (slugMatch) {
      return slugMatch;
    }
  }

  const supabase = createSupabaseAdminClient();
  const select =
    "id, serial_number, slug, title, logline, synopsis, youtube_url, runtime_minutes, release_year, format, genre, mood, tools, languages, featured_weight, discussion_count, views_count, saves_count, published_at, visibility, availability_note, creators (slug, name)";
  const query = supabase.from("films").select(select).eq("visibility", "removed").limit(1);
  const { data, error } = !Number.isNaN(serial)
    ? await query.eq("serial_number", serial).maybeSingle()
    : await query.eq("slug", identifier).maybeSingle();

  if (error) {
    throw new Error(`Failed to load film: ${error.message}`);
  }

  return data ? mapFilm(data as FilmRow) : null;
}

export async function getFilmsForCreator(creatorSlug: string) {
  const films = await getMappedFilms();
  return films.filter((film) => film.creatorSlug === creatorSlug);
}

export async function getCreatorBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("creators")
    .select("id, slug, name, headline, bio, location, followers_count, profile_id, films:films(count)")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to load creator: ${error.message}`);
  }

  const filmsDirected = Number((data.films as { count: number }[] | null)?.[0]?.count ?? 0);

  return mapCreator(data as CreatorRow, filmsDirected);
}

export async function getCreators(limit?: number) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("creators")
    .select("id, slug, name, headline, bio, location, followers_count, profile_id, films:films(count)")
    .order("followers_count", { ascending: false });

  if (error) {
    throw new Error(`Failed to load creators: ${error.message}`);
  }

  const creators = (data ?? []).map((row) =>
    mapCreator(
      row as CreatorRow,
      Number((row.films as { count: number }[] | null)?.[0]?.count ?? 0),
    ),
  );

  return typeof limit === "number" ? creators.slice(0, limit) : creators;
}

export async function getCollections() {
  const supabase = await createSupabaseServerClient();
  const [{ data: collectionRows, error: collectionError }, { data: membershipRows, error: membershipError }] =
    await Promise.all([
      supabase.from("collections").select("id, slug, name, description").order("name"),
      supabase.from("collection_films").select("collection_id"),
    ]);

  if (collectionError) {
    throw new Error(`Failed to load collections: ${collectionError.message}`);
  }

  if (membershipError) {
    throw new Error(`Failed to load collection counts: ${membershipError.message}`);
  }

  const counts = new Map<string, number>();
  for (const row of membershipRows ?? []) {
    const collectionId = row.collection_id as string;
    counts.set(collectionId, (counts.get(collectionId) ?? 0) + 1);
  }

  return (collectionRows ?? []).map((row) => ({
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    description: (row.description as string | null) ?? "",
    countLabel: `${counts.get(row.id as string) ?? 0} films`,
    heroClassName:
      collectionThemes[row.slug as string] ?? collectionThemes["festival-contenders"],
  }));
}

type FilmQuery = {
  q?: string;
  genre?: string;
  format?: string;
  sort?: string;
};

export async function filterFilms({ q, genre, format, sort }: FilmQuery) {
  const films = await getMappedFilms();
  const normalizedQuery = q?.trim().toLowerCase() ?? "";

  const filtered = films.filter((film) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      film.title.toLowerCase().includes(normalizedQuery) ||
      film.creatorName.toLowerCase().includes(normalizedQuery) ||
      `#${film.serial}`.includes(normalizedQuery) ||
      String(film.serial) === normalizedQuery;

    const matchesGenre = !genre || genre === "all" || film.genre === genre;
    const matchesFormat = !format || format === "all" || film.format === format;

    return matchesQuery && matchesGenre && matchesFormat;
  });

  switch (sort) {
    case "recent":
      return filtered.sort(
        (a, b) =>
          new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime(),
      );
    case "runtime":
      return filtered.sort((a, b) => b.runtimeMinutes - a.runtimeMinutes);
    case "discussed":
      return filtered.sort((a, b) => b.discussionCount - a.discussionCount);
    default:
      return filtered.sort((a, b) => b.featuredWeight - a.featuredWeight);
  }
}

export async function getFilmFilterOptions() {
  const films = await getMappedFilms();
  return {
    genres: ["all", ...new Set(films.map((film) => film.genre))],
    formats: ["all", ...new Set(films.map((film) => film.format))],
  };
}

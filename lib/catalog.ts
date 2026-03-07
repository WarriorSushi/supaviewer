import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  type FounderBadge,
  getCreatorStatusMap,
  getFilmStatusMap,
  type Trophy,
} from "@/lib/status";
import { buildYouTubeThumbnailUrl } from "@/lib/youtube";

export type Film = {
  id: string;
  creatorId: string;
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
  founderBadge: FounderBadge | null;
  trophies: Trophy[];
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
  founderBadge: FounderBadge | null;
  trophies: Trophy[];
  earliestSerial: number | null;
  notableSerials: number[];
};

export type CollectionPreviewFilm = Pick<
  Film,
  "id" | "serial" | "slug" | "title" | "creatorName" | "runtimeMinutes" | "genre" | "thumbnailUrl"
>;

export type Collection = {
  id: string;
  slug: string;
  name: string;
  description: string;
  countLabel: string;
  filmCount: number;
  totalRuntimeMinutes: number;
  creatorCount: number;
  previewFilms: CollectionPreviewFilm[];
  heroClassName: string;
};

type FilmRow = {
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

type CollectionRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

const creatorThemes: Record<string, string> = {
  "mira-sol":
    "bg-[linear-gradient(135deg,rgba(34,34,38,0.98),rgba(18,18,22,0.98)_42%,rgba(8,8,10,0.99)_78%)]",
  "jun-vale":
    "bg-[linear-gradient(135deg,rgba(28,28,32,0.98),rgba(16,16,20,0.98)_42%,rgba(8,8,10,0.99)_78%)]",
  "anik-dey":
    "bg-[linear-gradient(135deg,rgba(36,36,40,0.98),rgba(18,18,22,0.98)_42%,rgba(8,8,10,0.99)_78%)]",
  "ari-nox":
    "bg-[linear-gradient(135deg,rgba(30,30,34,0.98),rgba(17,17,20,0.98)_42%,rgba(8,8,10,0.99)_78%)]",
};

const filmHeroThemes: Record<string, string> = {
  "afterlight-valley":
    "bg-[linear-gradient(135deg,rgba(31,31,35,0.98),rgba(18,18,22,0.98)_42%,rgba(7,7,9,0.99)_78%)]",
  "glass-horizon":
    "bg-[linear-gradient(135deg,rgba(28,28,32,0.98),rgba(16,16,20,0.98)_42%,rgba(7,7,9,0.99)_78%)]",
  "echoes-for-avalon":
    "bg-[linear-gradient(135deg,rgba(36,36,40,0.98),rgba(18,18,21,0.98)_42%,rgba(8,8,10,0.99)_78%)]",
  "static-bloom":
    "bg-[linear-gradient(135deg,rgba(30,30,34,0.98),rgba(17,17,20,0.98)_42%,rgba(7,7,9,0.99)_78%)]",
  "orchard-of-zero":
    "bg-[linear-gradient(135deg,rgba(37,37,42,0.98),rgba(19,19,22,0.98)_42%,rgba(8,8,10,0.99)_78%)]",
  "salt-atlas":
    "bg-[linear-gradient(135deg,rgba(33,33,38,0.98),rgba(18,18,21,0.98)_42%,rgba(8,8,10,0.99)_78%)]",
  "the-quiet-machine":
    "bg-[linear-gradient(135deg,rgba(25,25,30,0.98),rgba(15,15,18,0.98)_42%,rgba(7,7,9,0.99)_78%)]",
};

const filmCardThemes: Record<string, string> = {
  "afterlight-valley":
    "bg-[linear-gradient(180deg,rgba(28,28,32,0.96),rgba(14,14,18,0.98))]",
  "glass-horizon":
    "bg-[linear-gradient(180deg,rgba(25,25,29,0.96),rgba(14,14,18,0.98))]",
  "echoes-for-avalon":
    "bg-[linear-gradient(180deg,rgba(31,31,35,0.96),rgba(15,15,18,0.98))]",
  "static-bloom":
    "bg-[linear-gradient(180deg,rgba(28,28,32,0.96),rgba(14,14,18,0.98))]",
  "orchard-of-zero":
    "bg-[linear-gradient(180deg,rgba(32,32,36,0.96),rgba(15,15,18,0.98))]",
  "salt-atlas":
    "bg-[linear-gradient(180deg,rgba(29,29,33,0.96),rgba(15,15,18,0.98))]",
  "the-quiet-machine":
    "bg-[linear-gradient(180deg,rgba(23,23,27,0.96),rgba(14,14,18,0.98))]",
};

const collectionThemes: Record<string, string> = {
  "festival-contenders":
    "bg-[linear-gradient(135deg,rgba(29,29,33,0.98),rgba(17,17,20,0.98)_42%,rgba(8,8,10,0.99)_78%)]",
  "midnight-surrealism":
    "bg-[linear-gradient(135deg,rgba(25,25,29,0.98),rgba(15,15,18,0.98)_42%,rgba(8,8,10,0.99)_78%)]",
  "first-100":
    "bg-[linear-gradient(135deg,rgba(31,31,35,0.98),rgba(18,18,21,0.98)_42%,rgba(8,8,10,0.99)_78%)]",
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

export { buildYouTubeThumbnailUrl } from "@/lib/youtube";

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

function mapFilm(
  row: FilmRow,
  collectionSlugs: string[] = [],
  status: { founderBadge: FounderBadge | null; trophies: Trophy[] } = {
    founderBadge: null,
    trophies: [],
  },
): Film {
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
    founderBadge: status.founderBadge,
    trophies: status.trophies,
  };
}

function mapCreator(
  row: CreatorRow,
  filmsDirected: number,
  status: {
    founderBadge: FounderBadge | null;
    trophies: Trophy[];
    earliestSerial: number | null;
    notableSerials: number[];
  } = {
    founderBadge: null,
    trophies: [],
    earliestSerial: null,
    notableSerials: [],
  },
): Creator {
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
    founderBadge: status.founderBadge,
    trophies: status.trophies,
    earliestSerial: status.earliestSerial,
    notableSerials: status.notableSerials,
  };
}

function mapCollectionPreviewFilm(film: Film): CollectionPreviewFilm {
  return {
    id: film.id,
    serial: film.serial,
    slug: film.slug,
    title: film.title,
    creatorName: film.creatorName,
    runtimeMinutes: film.runtimeMinutes,
    genre: film.genre,
    thumbnailUrl: film.thumbnailUrl,
  };
}

export function buildFilmHref(film: Pick<Film, "serial" | "slug">) {
  return `/films/${film.serial}-${film.slug}`;
}

export function buildCreatorHref(creator: Pick<Creator, "slug">) {
  return `/creators/${creator.slug}`;
}

export function buildCollectionHref(collection: Pick<Collection, "slug">) {
  return `/collections/${collection.slug}`;
}

async function getPublicFilmRows() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("films")
    .select(
      "id, creator_id, serial_number, slug, title, logline, synopsis, youtube_url, runtime_minutes, release_year, format, genre, mood, tools, languages, featured_weight, discussion_count, views_count, saves_count, published_at, visibility, availability_note, creators (slug, name)",
    )
    .in("visibility", ["public", "limited"]);

  if (error) {
    throw new Error(`Failed to load films: ${error.message}`);
  }

  return (data ?? []) as FilmRow[];
}

async function getCollectionMembership(filmIds?: string[]) {
  if (filmIds?.length === 0) {
    return new Map<string, string[]>();
  }

  const supabase = await createSupabaseServerClient();
  const query = supabase.from("collection_films").select("film_id, collections (slug)");
  const { data, error } = filmIds?.length ? await query.in("film_id", filmIds) : await query;

  if (error) {
    throw new Error(`Failed to load collection membership: ${error.message}`);
  }

  const membership = new Map<string, string[]>();

  for (const row of data ?? []) {
    const filmId = row.film_id as string;
    const collection = firstRelation(
      row.collections as { slug?: string } | { slug?: string }[] | null,
    );
    const slug = collection?.slug;
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
  const statusMap = await getFilmStatusMap(
    filmRows.map((row) => ({
      id: row.id,
      serial_number: row.serial_number,
    })),
  );

  return filmRows.map((row) =>
    mapFilm(row, membership.get(row.id) ?? [], statusMap.get(row.id)),
  );
}

async function getMatchingCreatorIds(normalizedQuery: string) {
  if (!normalizedQuery) {
    return [] as string[];
  }

  const supabase = await createSupabaseServerClient();
  const { data: matchingCreators, error: creatorError } = await supabase
    .from("creators")
    .select("id")
    .ilike("name", `%${normalizedQuery}%`)
    .limit(20);

  if (creatorError) {
    throw new Error(`Failed to search creators: ${creatorError.message}`);
  }

  return (matchingCreators ?? []).map((creator) => creator.id as string);
}

async function getFilteredFilmRows(
  { q, genre, format, sort }: FilmQuery,
  pagination?: { page: number; pageSize: number },
) {
  const supabase = await createSupabaseServerClient();
  const normalizedQuery = q?.trim().toLowerCase() ?? "";
  const creatorIds = await getMatchingCreatorIds(normalizedQuery);

  let query = supabase
    .from("films")
    .select(
      "id, creator_id, serial_number, slug, title, logline, synopsis, youtube_url, runtime_minutes, release_year, format, genre, mood, tools, languages, featured_weight, discussion_count, views_count, saves_count, published_at, visibility, availability_note, creators (slug, name)",
    )
    .in("visibility", ["public", "limited"]);

  if (genre && genre !== "all") {
    query = query.eq("genre", genre);
  }

  if (format && format !== "all") {
    query = query.eq("format", format);
  }

  if (normalizedQuery) {
    const clauses = [`title.ilike.%${normalizedQuery}%`];
    const parsedSerial = Number.parseInt(normalizedQuery.replace(/^#/, ""), 10);

    if (!Number.isNaN(parsedSerial)) {
      clauses.push(`serial_number.eq.${parsedSerial}`);
    }

    if (creatorIds.length) {
      clauses.push(`creator_id.in.(${creatorIds.join(",")})`);
    }

    query = query.or(clauses.join(","));
  }

  switch (sort) {
    case "recent":
      query = query.order("published_at", { ascending: false, nullsFirst: false });
      break;
    case "runtime":
      query = query.order("runtime_minutes", { ascending: false });
      break;
    case "discussed":
      query = query.order("discussion_count", { ascending: false });
      break;
    default:
      query = query.order("featured_weight", { ascending: false });
      break;
  }

  if (pagination) {
    query = query.range((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to filter films: ${error.message}`);
  }

  return (data ?? []) as FilmRow[];
}

async function countFilteredFilms({ q, genre, format }: FilmQuery) {
  const supabase = await createSupabaseServerClient();
  const normalizedQuery = q?.trim().toLowerCase() ?? "";
  const creatorIds = await getMatchingCreatorIds(normalizedQuery);

  let query = supabase
    .from("films")
    .select("*", { count: "exact", head: true })
    .in("visibility", ["public", "limited"]);

  if (genre && genre !== "all") {
    query = query.eq("genre", genre);
  }

  if (format && format !== "all") {
    query = query.eq("format", format);
  }

  if (normalizedQuery) {
    const clauses = [`title.ilike.%${normalizedQuery}%`];
    const parsedSerial = Number.parseInt(normalizedQuery.replace(/^#/, ""), 10);

    if (!Number.isNaN(parsedSerial)) {
      clauses.push(`serial_number.eq.${parsedSerial}`);
    }

    if (creatorIds.length) {
      clauses.push(`creator_id.in.(${creatorIds.join(",")})`);
    }

    query = query.or(clauses.join(","));
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`Failed to count filtered films: ${error.message}`);
  }

  return count ?? 0;
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
    "id, creator_id, serial_number, slug, title, logline, synopsis, youtube_url, runtime_minutes, release_year, format, genre, mood, tools, languages, featured_weight, discussion_count, views_count, saves_count, published_at, visibility, availability_note, creators (slug, name)";
  const query = supabase.from("films").select(select).eq("visibility", "removed").limit(1);
  const { data, error } = !Number.isNaN(serial)
    ? await query.eq("serial_number", serial).maybeSingle()
    : await query.eq("slug", identifier).maybeSingle();

  if (error) {
    throw new Error(`Failed to load film: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const statusMap = await getFilmStatusMap([
    {
      id: data.id as string,
      serial_number: data.serial_number as number,
    },
  ]);

  return mapFilm(data as FilmRow, [], statusMap.get(data.id as string));
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
  const statusMap = await getCreatorStatusMap([{ id: data.id as string }]);

  return mapCreator(data as CreatorRow, filmsDirected, statusMap.get(data.id as string));
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

  const statusMap = await getCreatorStatusMap(
    (data ?? []).map((row) => ({ id: row.id as string })),
  );

  const creators = (data ?? []).map((row) =>
    mapCreator(
      row as CreatorRow,
      Number((row.films as { count: number }[] | null)?.[0]?.count ?? 0),
      statusMap.get(row.id as string),
    ),
  );

  return typeof limit === "number" ? creators.slice(0, limit) : creators;
}

async function getCollectionRows() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("collections")
    .select("id, slug, name, description")
    .order("name");

  if (error) {
    throw new Error(`Failed to load collections: ${error.message}`);
  }

  return (data ?? []) as CollectionRow[];
}

function buildCollections(collectionRows: CollectionRow[], films: Film[]) {
  const filmsByCollection = new Map<string, Film[]>();

  for (const film of films) {
    for (const slug of film.collectionSlugs) {
      filmsByCollection.set(slug, [...(filmsByCollection.get(slug) ?? []), film]);
    }
  }

  return collectionRows.map((row) => {
    const collectionFilms = [...(filmsByCollection.get(row.slug) ?? [])].sort(
      (a, b) => b.featuredWeight - a.featuredWeight || a.serial - b.serial,
    );

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description ?? "",
      countLabel: `${collectionFilms.length} films`,
      filmCount: collectionFilms.length,
      totalRuntimeMinutes: collectionFilms.reduce((sum, film) => sum + film.runtimeMinutes, 0),
      creatorCount: new Set(collectionFilms.map((film) => film.creatorId)).size,
      previewFilms: collectionFilms.slice(0, 3).map(mapCollectionPreviewFilm),
      heroClassName: collectionThemes[row.slug] ?? collectionThemes["festival-contenders"],
    } satisfies Collection;
  });
}

export async function getCollections() {
  const [collectionRows, films] = await Promise.all([getCollectionRows(), getMappedFilms()]);
  return buildCollections(collectionRows, films);
}

export async function getCollectionBySlug(slug: string) {
  const [collectionRows, films] = await Promise.all([getCollectionRows(), getMappedFilms()]);
  const collections = buildCollections(collectionRows, films);
  const collection = collections.find((entry) => entry.slug === slug) ?? null;

  if (!collection) {
    return null;
  }

  return {
    collection,
    films: films
      .filter((film) => film.collectionSlugs.includes(slug))
      .sort((a, b) => b.featuredWeight - a.featuredWeight),
  };
}

type FilmQuery = {
  q?: string;
  genre?: string;
  format?: string;
  sort?: string;
};

export async function filterFilms({ q, genre, format, sort }: FilmQuery) {
  const rows = await getFilteredFilmRows({ q, genre, format, sort });
  const membership = await getCollectionMembership(rows.map((row) => row.id));
  const statusMap = await getFilmStatusMap(
    rows.map((row) => ({
      id: row.id,
      serial_number: row.serial_number,
    })),
  );
  return rows.map((row) => mapFilm(row, membership.get(row.id) ?? [], statusMap.get(row.id)));
}

export async function getFilmCatalogPage(
  query: FilmQuery & {
    page?: number;
    pageSize?: number;
  },
) {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.max(1, query.pageSize ?? 24);
  const [rows, total] = await Promise.all([
    getFilteredFilmRows(query, { page, pageSize }),
    countFilteredFilms(query),
  ]);
  const membership = await getCollectionMembership(rows.map((row) => row.id));
  const statusMap = await getFilmStatusMap(
    rows.map((row) => ({
      id: row.id,
      serial_number: row.serial_number,
    })),
  );

  return {
    films: rows.map((row) =>
      mapFilm(row, membership.get(row.id) ?? [], statusMap.get(row.id)),
    ),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getFilmFilterOptions() {
  const films = await getMappedFilms();
  return {
    genres: ["all", ...new Set(films.map((film) => film.genre))],
    formats: ["all", ...new Set(films.map((film) => film.format))],
  };
}

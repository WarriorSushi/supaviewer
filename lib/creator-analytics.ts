import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type CreatorStudioAnalytics = {
  acceptedFilms: number;
  totalViews: number;
  totalSaves: number;
  totalDiscussion: number;
  totalShares: number;
  collectionPlacements: number;
  earliestSerial: number | null;
  serialPercentile: number | null;
  topSharedFilmTitle: string | null;
  topSharedFilmShares: number;
};

export async function getCreatorStudioAnalytics(creatorId: string): Promise<CreatorStudioAnalytics> {
  const supabase = createSupabaseAdminClient();
  const [{ data: films, error: filmsError }, { count: publicFilmCount, error: publicFilmCountError }, { count: creatorShares, error: creatorSharesError }] =
    await Promise.all([
      supabase
        .from("films")
        .select("id, title, serial_number, views_count, saves_count, discussion_count")
        .eq("creator_id", creatorId)
        .in("visibility", ["public", "limited"]),
      supabase
        .from("films")
        .select("*", { count: "exact", head: true })
        .in("visibility", ["public", "limited"]),
      supabase
        .from("share_events")
        .select("*", { count: "exact", head: true })
        .eq("creator_id", creatorId),
    ]);

  if (filmsError) {
    throw new Error(`Failed to load creator analytics films: ${filmsError.message}`);
  }

  if (publicFilmCountError) {
    throw new Error(`Failed to count public films: ${publicFilmCountError.message}`);
  }

  if (creatorSharesError) {
    throw new Error(`Failed to count creator share events: ${creatorSharesError.message}`);
  }

  const creatorFilms = (films ?? []) as {
    id: string;
    title: string;
    serial_number: number;
    views_count: number;
    saves_count: number;
    discussion_count: number;
  }[];
  const filmIds = creatorFilms.map((film) => film.id);

  const [{ count: collectionPlacements, error: collectionPlacementsError }, { data: filmShareEvents, error: filmShareEventsError }] =
    filmIds.length
      ? await Promise.all([
          supabase
            .from("collection_films")
            .select("*", { count: "exact", head: true })
            .in("film_id", filmIds),
          supabase.from("share_events").select("film_id").in("film_id", filmIds),
        ])
      : [
          { count: 0, error: null },
          { data: [] as { film_id: string | null }[], error: null },
        ];

  if (collectionPlacementsError) {
    throw new Error(`Failed to count collection placements: ${collectionPlacementsError.message}`);
  }

  if (filmShareEventsError) {
    throw new Error(`Failed to load film share events: ${filmShareEventsError.message}`);
  }

  const filmShareCounts = new Map<string, number>();
  for (const event of (filmShareEvents ?? []) as { film_id: string | null }[]) {
    if (!event.film_id) {
      continue;
    }

    filmShareCounts.set(event.film_id, (filmShareCounts.get(event.film_id) ?? 0) + 1);
  }

  const topSharedFilm = creatorFilms
    .map((film) => ({
      title: film.title,
      shares: filmShareCounts.get(film.id) ?? 0,
    }))
    .sort((left, right) => right.shares - left.shares)[0] ?? null;

  const earliestSerial = creatorFilms.length
    ? Math.min(...creatorFilms.map((film) => film.serial_number))
    : null;
  const totalViews = creatorFilms.reduce((sum, film) => sum + film.views_count, 0);
  const totalSaves = creatorFilms.reduce((sum, film) => sum + film.saves_count, 0);
  const totalDiscussion = creatorFilms.reduce((sum, film) => sum + film.discussion_count, 0);
  const totalShares = (creatorShares ?? 0) + [...filmShareCounts.values()].reduce((sum, value) => sum + value, 0);

  return {
    acceptedFilms: creatorFilms.length,
    totalViews,
    totalSaves,
    totalDiscussion,
    totalShares,
    collectionPlacements: collectionPlacements ?? 0,
    earliestSerial,
    serialPercentile:
      earliestSerial && publicFilmCount
        ? Math.max(1, Math.round(((publicFilmCount - earliestSerial + 1) / publicFilmCount) * 100))
        : null,
    topSharedFilmTitle: topSharedFilm?.shares ? topSharedFilm.title : null,
    topSharedFilmShares: topSharedFilm?.shares ?? 0,
  };
}

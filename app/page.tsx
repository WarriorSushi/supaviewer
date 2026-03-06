import Link from "next/link";
import { CollectionCard } from "@/components/collection-card";
import { CreatorCard } from "@/components/creator-card";
import { FilmCard } from "@/components/film-card";
import { RelatedFilmListItem } from "@/components/related-film-list-item";
import { SerialPill } from "@/components/serial-pill";
import {
  buildFilmHref,
  getCollections,
  getCreators,
  getFeaturedFilms,
  getLatestFilms,
} from "@/lib/catalog";

export default async function Home() {
  const [featuredFilms, latestFilms, collections, creators] = await Promise.all([
    getFeaturedFilms(8),
    getLatestFilms(8),
    getCollections(),
    getCreators(4),
  ]);

  const heroFilm = featuredFilms[0];
  const nowScreening = featuredFilms.slice(1, 5);
  const freshRail = latestFilms.slice(0, 5);

  if (!heroFilm) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-[110rem] items-center px-4 pb-28 pt-10 sm:px-6 lg:px-10">
        <div className="sv-surface w-full rounded-[1.2rem] p-10">
          <p className="sv-overline">superviewer.com</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
            Superviewer is preparing its first public titles.
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-[110rem] flex-col gap-10 px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="grid gap-6 xl:grid-cols-[26rem_minmax(0,1fr)]">
        <div className="sv-surface rounded-[1.2rem] p-6 sm:p-7">
          <p className="sv-overline">Featured film</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <SerialPill large serial={heroFilm.serial} />
            <span className="sv-chip">{heroFilm.format}</span>
          </div>
          <h1 className="mt-5 text-[2.2rem] font-semibold tracking-[-0.06em] text-white sm:text-[3rem]">
            {heroFilm.title}
          </h1>
          <p className="mt-3 text-[0.78rem] uppercase tracking-[0.18em] text-white/44">
            {heroFilm.creatorName} / {heroFilm.genre} / {heroFilm.runtimeMinutes} min
          </p>
          <p className="mt-5 text-[0.98rem] leading-7 text-white/64">{heroFilm.logline}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link className="sv-btn sv-btn-primary min-w-[10rem]" href={buildFilmHref(heroFilm)}>
              Watch now
            </Link>
            <Link className="sv-btn sv-btn-secondary min-w-[10rem]" href="/films">
              Browse catalog
            </Link>
          </div>
          <div className="mt-7 grid grid-cols-3 gap-3 border-t border-white/8 pt-5 text-sm">
            <div>
              <p className="text-white/34">Views</p>
              <p className="mt-1 font-mono text-white">{heroFilm.views}</p>
            </div>
            <div>
              <p className="text-white/34">Saves</p>
              <p className="mt-1 font-mono text-white">{heroFilm.saves}</p>
            </div>
            <div>
              <p className="text-white/34">Serial</p>
              <p className="mt-1 font-mono text-white">#{heroFilm.serial}</p>
            </div>
          </div>
        </div>

        <Link
          className="group relative overflow-hidden rounded-[1.2rem] border border-white/8 bg-black"
          href={buildFilmHref(heroFilm)}
        >
          <div className="aspect-[16/9]" />
          {heroFilm.thumbnailUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-[1.02]"
              style={{ backgroundImage: `url(${heroFilm.thumbnailUrl})` }}
            />
          ) : null}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.12)_34%,rgba(0,0,0,0.78))]" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7">
            <div>
              <p className="sv-overline text-white/44">Now screening</p>
              <h2 className="mt-2 text-[1.5rem] font-semibold tracking-[-0.04em] text-white sm:text-[2.2rem]">
                {heroFilm.title}
              </h2>
            </div>
            <span className="hidden rounded-[999px] border border-white/12 bg-black/40 px-4 py-2 text-[0.72rem] uppercase tracking-[0.18em] text-white/68 sm:inline-flex">
              Superviewer select
            </span>
          </div>
        </Link>
      </section>

      <section className="sv-section">
        <div className="sv-section-head">
          <div>
            <p className="sv-overline">Now screening</p>
            <h2 className="sv-title mt-2">Long-form films worth opening full screen.</h2>
          </div>
          <Link className="text-sm text-white/52 transition hover:text-white" href="/films">
            View all
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {nowScreening.map((film) => (
            <FilmCard key={film.serial} film={film} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="sv-section">
          <div className="sv-section-head">
            <div>
              <p className="sv-overline">Collections</p>
              <h2 className="sv-title mt-2">Curated rails, not feed clutter.</h2>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {collections.map((collection) => (
              <CollectionCard key={collection.slug} collection={collection} />
            ))}
          </div>
        </div>

        <aside className="sv-surface rounded-[1.2rem] p-4">
          <div className="sv-section-head">
            <div>
              <p className="sv-overline">Fresh serials</p>
              <h2 className="mt-2 text-lg font-medium text-white">Recently added</h2>
            </div>
            <Link className="text-sm text-white/52 transition hover:text-white" href="/films">
              Browse
            </Link>
          </div>
          <div className="mt-3 grid gap-1">
            {freshRail.map((film) => (
              <RelatedFilmListItem key={film.serial} film={film} />
            ))}
          </div>
        </aside>
      </section>

      <section className="sv-section">
        <div className="sv-section-head">
          <div>
            <p className="sv-overline">Creators</p>
            <h2 className="sv-title mt-2">The directors building the category.</h2>
          </div>
          <Link className="text-sm text-white/52 transition hover:text-white" href="/creators">
            All creators
          </Link>
        </div>
        <div className="grid gap-4">
          {creators.map((creator) => (
            <CreatorCard key={creator.slug} creator={creator} />
          ))}
        </div>
      </section>
    </main>
  );
}

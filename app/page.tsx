import Link from "next/link";
import { CollectionCard } from "@/components/collection-card";
import { CreatorCard } from "@/components/creator-card";
import { FilmCard } from "@/components/film-card";
import { SerialPill } from "@/components/serial-pill";
import {
  buildFilmHref,
  getCollections,
  getCreators,
  getFeaturedFilms,
  getLatestFilms,
  homePrinciples,
} from "@/lib/catalog";

export default async function Home() {
  const [featuredFilms, latestFilms, collections, creators] = await Promise.all([
    getFeaturedFilms(),
    getLatestFilms(),
    getCollections(),
    getCreators(3),
  ]);
  const featuredFilm = featuredFilms[0];

  if (!featuredFilm) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-[92rem] items-center px-4 pb-28 pt-6 sm:px-6 lg:px-10">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-white/42">Catalog</p>
          <h1 className="mt-3 font-display text-5xl text-white">
            Superviewer is preparing its first public titles.
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-[92rem] flex-col px-4 pb-28 pt-6 sm:px-6 lg:px-10">
      <section className="grid gap-6 pb-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(21rem,0.85fr)]">
        <div
          className={`overflow-hidden rounded-[2.25rem] border border-white/10 p-6 shadow-[0_28px_120px_rgba(0,0,0,0.36)] sm:p-8 ${featuredFilm.heroClassName}`}
        >
          <div className="mb-20 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/58">
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-2">
              AI-native cinema
            </span>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-2">
              Long-form first
            </span>
            <span className="rounded-full border border-[var(--color-highlight)]/30 bg-[var(--color-highlight)]/10 px-3 py-2 text-[var(--color-highlight)]">
              Permanent serials
            </span>
          </div>
          <div className="max-w-3xl">
            <p className="mb-4 text-sm uppercase tracking-[0.32em] text-white/54">Now premiering</p>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <SerialPill large serial={featuredFilm.serial} />
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-white/56">
                {featuredFilm.runtimeMinutes} min
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-white/56">
                {featuredFilm.genre}
              </span>
            </div>
            <h1 className="max-w-4xl font-display text-5xl leading-[0.9] text-white sm:text-6xl lg:text-7xl">
              {featuredFilm.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
              {featuredFilm.logline}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/64">
              <span>Directed by {featuredFilm.creatorName}</span>
              <span className="text-white/24">/</span>
              <span>{featuredFilm.tools.join(" / ")}</span>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                className="rounded-full bg-[var(--color-highlight)] px-6 py-3 text-sm font-semibold text-[var(--color-bg)] transition hover:brightness-105"
                href={buildFilmHref(featuredFilm)}
              >
                Watch premiere
              </Link>
              <Link
                className="rounded-full border border-white/12 bg-white/6 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/26 hover:bg-white/10"
                href="/films"
              >
                Browse catalog
              </Link>
            </div>
          </div>
        </div>

        <aside className="grid gap-4">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(9,12,22,0.96))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
            <p className="text-xs uppercase tracking-[0.3em] text-white/48">Search the catalog</p>
            <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-4">
              <p className="text-sm text-white/78">Search by title, creator, or serial</p>
              <p className="mt-2 font-mono text-lg text-[var(--color-highlight)]">#1 / #42 / #248</p>
            </div>
            <Link
              className="mt-4 inline-flex rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-white transition hover:border-white/24 hover:bg-white/10"
              href="/films"
            >
              Open search
            </Link>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(9,12,22,0.96))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
            <p className="text-xs uppercase tracking-[0.3em] text-white/48">Why it works</p>
            <div className="mt-4 space-y-3">
              {homePrinciples.map((principle) => (
                <div
                  key={principle}
                  className="rounded-[1.35rem] border border-white/10 bg-white/4 px-4 py-3 text-sm leading-6 text-white/76"
                >
                  {principle}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="py-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/44">Featured films</p>
            <h2 className="mt-2 font-display text-4xl text-white">
              Longer-form work worth settling into.
            </h2>
          </div>
          <Link className="hidden text-sm text-white/58 transition hover:text-white sm:block" href="/films">
            Browse all films
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featuredFilms.map((film) => (
            <FilmCard key={film.serial} film={film} emphasis="compact" />
          ))}
        </div>
      </section>

      <section className="grid gap-4 py-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(8,10,16,0.96))] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/44">Library model</p>
          <h2 className="mt-3 font-display text-4xl text-white">
            Built like a cinema library, not a clip feed.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/68">
            Superviewer is designed for AI-native films that deserve intentional discovery. The serial
            number system gives every accepted title lasting catalog identity, and the collections
            layer keeps the experience curated rather than chaotic.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard key={collection.slug} collection={collection} />
          ))}
        </div>
      </section>

      <section className="py-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/44">New and notable</p>
            <h2 className="mt-2 font-display text-4xl text-white">
              Recent additions to the public catalog.
            </h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {latestFilms.map((film) => (
            <FilmCard key={film.serial} film={film} emphasis="compact" />
          ))}
        </div>
      </section>

      <section className="grid gap-4 py-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(20rem,0.88fr)]">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(9,12,22,0.96))] p-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/44">Director spotlights</p>
              <h2 className="mt-2 font-display text-4xl text-white">
                Filmmakers building the category.
              </h2>
            </div>
            <Link className="hidden text-sm text-white/58 transition hover:text-white sm:block" href="/creators">
              View all creators
            </Link>
          </div>
          <div className="grid gap-3">
            {creators.map((creator) => (
              <CreatorCard key={creator.slug} creator={creator} />
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(247,211,140,0.08),rgba(255,255,255,0.03),rgba(9,12,22,0.96))] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/44">Submit a film</p>
          <h2 className="mt-3 font-display text-4xl text-white">Win an early number.</h2>
          <p className="mt-4 text-base leading-7 text-white/68">
            The public catalog will be remembered by serial. Submit a YouTube link, confirm rights,
            declare AI generation, and claim a permanent number once accepted.
          </p>
          <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-black/20 p-4">
            <div className="grid gap-3 text-sm text-white/72">
              <div className="flex items-center justify-between rounded-[1rem] border border-white/8 bg-white/4 px-4 py-3">
                <span>YouTube URL</span>
                <span className="text-white/38">Required</span>
              </div>
              <div className="flex items-center justify-between rounded-[1rem] border border-white/8 bg-white/4 px-4 py-3">
                <span>Runtime + format</span>
                <span className="text-white/38">Long-form ready</span>
              </div>
              <div className="flex items-center justify-between rounded-[1rem] border border-white/8 bg-white/4 px-4 py-3">
                <span>Rights declaration</span>
                <span className="text-white/38">Required</span>
              </div>
            </div>
          </div>
          <Link
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[var(--color-highlight)] px-6 py-3 text-sm font-semibold text-[var(--color-bg)] transition hover:brightness-105"
            href="/submit"
          >
            Start submission
          </Link>
        </div>
      </section>
    </main>
  );
}

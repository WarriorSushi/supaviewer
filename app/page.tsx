import type { Metadata } from "next";
import Link from "next/link";
import { CollectionCard } from "@/components/collection-card";
import { CreatorCard } from "@/components/creator-card";
import { FilmCard } from "@/components/film-card";
import { RelatedFilmListItem } from "@/components/related-film-list-item";
import { SerialPill } from "@/components/serial-pill";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import {
  buildFilmHref,
  getCollections,
  getCreators,
  getFeaturedFilms,
  getLatestFilms,
} from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Supaviewer",
  description: "Discover AI-native films, curated rails, creator profiles, and permanent serial-numbered titles.",
};

export default async function Home() {
  try {
    const [featuredFilms, latestFilms, collections, creators] = await Promise.all([
      getFeaturedFilms(8).catch(() => []),
      getLatestFilms(8).catch(() => []),
      getCollections().catch(() => []),
      getCreators(4).catch(() => []),
    ]);

  const heroFilm = featuredFilms[0];
  const nowScreening = featuredFilms.slice(1, 5);
  const freshRail = latestFilms.slice(0, 5);

  if (!heroFilm) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-[110rem] items-center px-4 pb-28 pt-10 sm:px-6 lg:px-10">
        <div className="sv-surface w-full rounded-[1.2rem] p-10">
          <p className="sv-overline">supaviewer.com</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
            Supaviewer is preparing its first public titles.
          </h1>
        </div>
      </main>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Supaviewer",
    url: "https://supaviewer.com",
    description: "A cinematic home for AI-native films, creator filmographies, and serial-numbered discovery.",
  };

  return (
    <main className="mx-auto flex w-full max-w-[110rem] flex-col gap-10 px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />
      <section className="sv-surface overflow-hidden rounded-[1.6rem]">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1.18fr)_24rem]">
          <Link
            className="group relative order-1 block overflow-hidden bg-black xl:order-2"
            href={buildFilmHref(heroFilm)}
          >
            <div className="aspect-[16/9] xl:min-h-full xl:aspect-auto xl:h-full" />
            {heroFilm.thumbnailUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-[1.02]"
                style={{ backgroundImage: `url(${heroFilm.thumbnailUrl})` }}
              />
            ) : null}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.14)_36%,rgba(0,0,0,0.82))]" />
            <div className="absolute inset-x-0 top-0 flex justify-end p-3 sm:p-5">
              <span className="inline-flex rounded-[999px] border border-white/12 bg-black/46 px-3 py-1.5 text-[0.56rem] uppercase tracking-[0.2em] text-white/72 backdrop-blur sm:px-4 sm:py-2 sm:text-[0.68rem]">
                Now screening
              </span>
            </div>
          </Link>

          <div className="order-2 p-4 sm:p-6 xl:order-1 xl:p-8">
            <p className="sv-overline">Featured film</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <SerialPill large serial={heroFilm.serial} />
              <span className="sv-chip">{heroFilm.format}</span>
              <StatusPill badge={heroFilm.founderBadge} />
              {heroFilm.trophies[0] ? <StatusPill trophy={heroFilm.trophies[0]} /> : null}
            </div>
            <h1 className="mt-4 text-[1.18rem] font-semibold tracking-[-0.06em] text-foreground sm:text-[2.6rem]">
              {heroFilm.title}
            </h1>
            <p className="mt-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground sm:text-[0.78rem]">
              {heroFilm.creatorName} / {heroFilm.genre} / {heroFilm.runtimeMinutes} min
            </p>
            <p className="mt-3 max-w-2xl text-[0.84rem] leading-6 text-muted-foreground sm:mt-4 sm:text-[0.98rem] sm:leading-7">
              {heroFilm.logline}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
              <Button asChild className="sv-btn sv-btn-primary min-h-8 min-w-[7.6rem] rounded-xl px-3 py-1.5 text-[0.7rem] sm:min-h-[42px] sm:min-w-[10rem] sm:px-4 sm:py-3 sm:text-[0.86rem]">
                <Link href={buildFilmHref(heroFilm)}>Watch now</Link>
              </Button>
              <Button asChild className="sv-btn min-h-8 min-w-[7.6rem] rounded-xl px-3 py-1.5 text-[0.7rem] sm:min-h-[42px] sm:min-w-[10rem] sm:px-4 sm:py-3 sm:text-[0.86rem]" variant="outline">
                <Link href="/films">Browse catalog</Link>
              </Button>
            </div>
            <div className="mt-4 border-t border-border/80 pt-4 sm:mt-6 sm:pt-5">
              <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground sm:text-[0.72rem]">
                Search lives in the top bar now. Find any title by name, creator, or serial.
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground sm:mt-4 sm:text-[0.72rem]">
              <span>{heroFilm.views} views</span>
              <span>/</span>
              <span>{heroFilm.saves} saves</span>
              <span>/</span>
              <span>#{heroFilm.serial}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="sv-section">
        <div className="sv-section-head">
          <div>
            <p className="sv-overline">Now screening</p>
            <h2 className="sv-title mt-2">Long-form films worth opening full screen.</h2>
          </div>
          <Link className="text-sm text-muted-foreground transition hover:text-foreground" href="/films">
            View all
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {nowScreening.map((film) => (
            <FilmCard key={film.serial} film={film} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem] xl:items-start">
        <div className="sv-section">
          <div className="sv-section-head">
            <div>
              <p className="sv-overline">Collections</p>
              <h2 className="sv-title mt-2">Curated rails, not feed clutter.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Three signature shelves, each with its own art direction instead of borrowed video thumbnails.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 xl:gap-4">
            {collections.map((collection) => (
              <CollectionCard key={collection.slug} collection={collection} />
            ))}
          </div>
        </div>

        <aside className="sv-surface rounded-[1.2rem] p-4">
          <div className="sv-section-head">
            <div>
              <p className="sv-overline">Fresh serials</p>
              <h2 className="mt-2 text-lg font-medium text-foreground">Recently added</h2>
            </div>
            <Link className="text-sm text-muted-foreground transition hover:text-foreground" href="/films">
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
          <Link className="text-sm text-muted-foreground transition hover:text-foreground" href="/creators">
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
  } catch (error) {
    console.error("[home] Render failed:", error);
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-[96rem] flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-10">
        <p className="sv-overline">supaviewer.com</p>
        <h1 className="mt-4 font-display text-3xl font-medium tracking-[-0.03em] text-foreground sm:text-4xl">
          Supaviewer is loading.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The catalog is temporarily unavailable. Please refresh.
        </p>
      </main>
    );
  }
}

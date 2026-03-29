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

async function loadHomeData<T>(
  label: string,
  loader: () => Promise<T>,
  fallback: T,
) {
  try {
    return await loader();
  } catch (error) {
    console.error(`[home] Failed to load ${label}:`, error);
    return fallback;
  }
}

function HomeLaunchState({
  collectionCount,
  creatorCount,
}: {
  collectionCount: number;
  creatorCount: number;
}) {
  const launchTrack = [
    {
      serial: "01",
      title: "Opening catalog",
      description:
        "Public titles are being staged in numbered waves so the first release feels curated, not dumped into a grid.",
    },
    {
      serial: "02",
      title: "Creator dossiers",
      description:
        creatorCount > 0
          ? `${creatorCount} creator profiles are already indexed behind the scenes for launch week.`
          : "Creator profiles are being prepared alongside the first public release.",
    },
    {
      serial: "03",
      title: "Curated shelves",
      description:
        collectionCount > 0
          ? `${collectionCount} editorial rails are already mapped to frame the first titles with context.`
          : "Signature shelves are being art-directed so discovery starts with taste instead of feed clutter.",
    },
  ];

  return (
    <main className="mx-auto flex w-full max-w-[110rem] flex-col gap-6 px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="sv-page-hero overflow-hidden rounded-[1.8rem] p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.18fr)_22rem] xl:items-start">
          <div>
            <p className="sv-overline">Opening slate</p>
            <h1 className="sv-display mt-4 max-w-4xl">
              Supaviewer is opening its catalog in numbered waves.
            </h1>
            <p className="mt-5 max-w-2xl text-[0.98rem] leading-7 text-muted-foreground sm:text-[1.02rem]">
              Public titles are still being staged, but the creator directory, watch rooms, and
              submission desk are already in motion. The first release is being shaped like a
              premiere season, not a placeholder feed.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="sv-btn sv-btn-primary min-w-[11rem]">
                <Link href="/creators">Meet the creators</Link>
              </Button>
              <Button asChild className="sv-btn min-w-[11rem]" variant="outline">
                <Link href="/watch">Enter the screening room</Link>
              </Button>
              <Button asChild className="sv-btn min-w-[11rem]" variant="outline">
                <Link href="/submit">Submit a film</Link>
              </Button>
            </div>
          </div>

          <aside className="sv-surface-soft rounded-[1.4rem] p-5 sm:p-6">
            <p className="sv-overline">Launch track</p>
            <div className="mt-4 grid gap-4">
              {launchTrack.map((item) => (
                <div
                  key={item.serial}
                  className="rounded-[1rem] border border-border/60 bg-background/55 p-4"
                >
                  <p className="sv-mono text-[0.72rem] text-[var(--color-accent)]">{item.serial}</p>
                  <h2 className="mt-2 font-display text-[1.08rem] font-medium tracking-[-0.03em] text-foreground">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-[0.84rem] leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="sv-surface-soft rounded-[1.4rem] p-5">
          <p className="sv-overline">Serial identity</p>
          <h2 className="mt-3 font-display text-[1.4rem] font-medium tracking-[-0.03em] text-foreground">
            Every title arrives with lasting catalog weight.
          </h2>
          <p className="mt-3 text-[0.9rem] leading-6 text-muted-foreground">
            Numbered entries, durable links, and film-page context come before growth loops.
          </p>
        </div>
        <div className="sv-surface-soft rounded-[1.4rem] p-5">
          <p className="sv-overline">Editorial discovery</p>
          <h2 className="mt-3 font-display text-[1.4rem] font-medium tracking-[-0.03em] text-foreground">
            Browse shelves shaped like a cinema program.
          </h2>
          <p className="mt-3 text-[0.9rem] leading-6 text-muted-foreground">
            The launch mix prioritizes collections, creator context, and screening momentum over
            endless identical cards.
          </p>
        </div>
        <div className="sv-surface-soft rounded-[1.4rem] p-5">
          <p className="sv-overline">Watch rooms</p>
          <h2 className="mt-3 font-display text-[1.4rem] font-medium tracking-[-0.03em] text-foreground">
            Live rooms stay readable, human-first, and premiere-ready.
          </h2>
          <p className="mt-3 text-[0.9rem] leading-6 text-muted-foreground">
            Lounge tools, creator drops, and companion agents will appear around titles once the
            opening slate is live.
          </p>
        </div>
      </section>
    </main>
  );
}

export default async function Home() {
  const [featuredFilms, latestFilms, collections, creators] = await Promise.all([
    loadHomeData("featured films", () => getFeaturedFilms(8), []),
    loadHomeData("latest films", () => getLatestFilms(8), []),
    loadHomeData("collections", getCollections, []),
    loadHomeData("creators", () => getCreators(4), []),
  ]);

  const heroFilm = featuredFilms[0] ?? latestFilms[0];

  if (!heroFilm) {
    return <HomeLaunchState collectionCount={collections.length} creatorCount={creators.length} />;
  }

  const leadRail = featuredFilms.length ? featuredFilms : latestFilms;
  const nowScreening = leadRail.filter((film) => film.id !== heroFilm.id).slice(0, 4);
  const freshRail = latestFilms.filter((film) => film.id !== heroFilm.id).slice(0, 5);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Supaviewer",
    url: "https://supaviewer.com",
    description:
      "A cinematic home for AI-native films, creator filmographies, and serial-numbered discovery.",
  };
  const showCollectionRail = collections.length > 0;
  const showFreshRail = freshRail.length > 0;

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

      {nowScreening.length ? (
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
      ) : null}

      {showCollectionRail || showFreshRail ? (
        <section
          className={
            showCollectionRail && showFreshRail
              ? "grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem] xl:items-start"
              : "grid gap-6"
          }
        >
          {showCollectionRail ? (
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
          ) : null}

          {showFreshRail ? (
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
          ) : null}
        </section>
      ) : null}

      {creators.length ? (
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
      ) : null}
    </main>
  );
}

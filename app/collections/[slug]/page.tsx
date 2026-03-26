import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilmCard } from "@/components/film-card";
import { buildCollectionHref, getCollectionBySlug } from "@/lib/catalog";

type CollectionDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CollectionDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCollectionBySlug(slug);

  if (!result) {
    return {
      title: "Collection not found | Supaviewer",
    };
  }

  return {
    title: `${result.collection.name} | Supaviewer`,
    description: result.collection.description,
    alternates: {
      canonical: buildCollectionHref(result.collection),
    },
    openGraph: {
      title: `${result.collection.name} | Supaviewer`,
      description: result.collection.description,
      url: buildCollectionHref(result.collection),
      type: "website",
    },
  };
}

export default async function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const { slug } = await params;
  const result = await getCollectionBySlug(slug);

  if (!result) {
    notFound();
  }

  const { collection, films } = result;

  return (
    <main className="mx-auto w-full max-w-[96rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      {/* ── Hero ── */}
      <section className="sv-animate-in">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-end">
          <div>
            <p className="sv-overline">Collection</p>
            <h1 className="sv-display mt-3">
              {collection.name}
            </h1>
            <p className="sv-body mt-4 max-w-3xl">
              {collection.description}
            </p>
          </div>
          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
              <p className="sv-overline">Shelf size</p>
              <p className="mt-2 font-display font-medium text-lg text-foreground">{collection.countLabel}</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
              <p className="sv-overline">Runtime</p>
              <p className="mt-2 font-display font-medium text-lg text-foreground">{collection.totalRuntimeMinutes} min total</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
              <p className="sv-overline">Creators</p>
              <p className="mt-2 font-display font-medium text-lg text-foreground">{collection.creatorCount} represented</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Highlighted picks + sidebar ── */}
      <section className="mt-14 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] sv-animate-in sv-stagger-1">
        <div className="rounded-xl border border-border/50 bg-card p-6">
          <p className="sv-overline">Highlighted picks</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {collection.previewFilms.map((film) => (
              <Link
                key={`${collection.slug}-${film.id}`}
                className="rounded-xl border border-border/50 bg-card/60 px-4 py-4 transition hover:border-[var(--color-accent-strong)] hover:bg-[oklch(0.72_0.14_55_/_4%)]"
                href={`/films/${film.serial}-${film.slug}`}
              >
                <p className="text-sm font-medium text-foreground">{film.title}</p>
                <p className="sv-overline mt-2">
                  {film.creatorName} / {film.runtimeMinutes} min
                </p>
              </Link>
            ))}
          </div>
        </div>

        <aside className="rounded-xl border border-border/50 bg-card p-6">
          <p className="sv-overline">Why this rail exists</p>
          <div className="mt-4 grid gap-3 sv-body-sm">
            <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
              These shelves are meant to feel like programmable repertory cinema, not a feed of isolated uploads.
            </div>
            <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
              Titles grouped here gain stronger context for sharing, creator discovery, and return watching.
            </div>
          </div>
        </aside>
      </section>

      {/* ── Film grid ── */}
      <section className="mt-16 sv-animate-in sv-stagger-2">
        <div className="sv-section-head">
          <div>
            <p className="sv-overline">Titles</p>
            <h2 className="font-display font-medium mt-2 text-[clamp(1.4rem,1rem+1.2vw,2.2rem)] tracking-[-0.025em] text-foreground">A navigable rail, not a dead end.</h2>
          </div>
          <Link className="text-sm text-[var(--color-accent)] transition hover:text-[var(--color-accent-strong)]" href="/films">
            Browse all films
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {films.map((film) => (
            <FilmCard key={film.id} film={film} />
          ))}
        </div>
      </section>
    </main>
  );
}

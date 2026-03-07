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
    <main className="mx-auto w-full max-w-[110rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="sv-page-hero rounded-[1rem] p-6 sm:p-8">
        <p className="sv-overline">Collection</p>
        <div className="mt-3 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
              {collection.name}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              {collection.description}
            </p>
          </div>
          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3 xl:grid-cols-1">
            <div className="sv-surface-soft rounded-[1.2rem] px-4 py-4">
              <p className="sv-overline">Shelf size</p>
              <p className="mt-2 text-lg font-medium text-foreground">{collection.countLabel}</p>
            </div>
            <div className="sv-surface-soft rounded-[1.2rem] px-4 py-4">
              <p className="sv-overline">Runtime</p>
              <p className="mt-2 text-lg font-medium text-foreground">{collection.totalRuntimeMinutes} min total</p>
            </div>
            <div className="sv-surface-soft rounded-[1.2rem] px-4 py-4">
              <p className="sv-overline">Creators</p>
              <p className="mt-2 text-lg font-medium text-foreground">{collection.creatorCount} represented</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 pt-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="sv-surface rounded-[1.6rem] p-6">
          <p className="sv-overline">Highlighted picks</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {collection.previewFilms.map((film) => (
              <Link
                key={`${collection.slug}-${film.id}`}
                className="sv-surface-soft rounded-[1.2rem] px-4 py-4 transition hover:border-foreground/15"
                href={`/films/${film.serial}-${film.slug}`}
              >
                <p className="text-sm font-medium text-foreground">{film.title}</p>
                <p className="mt-2 text-[0.72rem] uppercase tracking-[0.16em] text-muted-foreground">
                  {film.creatorName} / {film.runtimeMinutes} min
                </p>
              </Link>
            ))}
          </div>
        </div>

        <aside className="sv-surface rounded-[1.6rem] p-6">
          <p className="sv-overline">Why this rail exists</p>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <div className="sv-surface-soft rounded-[1.2rem] px-4 py-4">
              These shelves are meant to feel like programmable repertory cinema, not a feed of isolated uploads.
            </div>
            <div className="sv-surface-soft rounded-[1.2rem] px-4 py-4">
              Titles grouped here gain stronger context for sharing, creator discovery, and return watching.
            </div>
          </div>
        </aside>
      </section>

      <section className="sv-section pt-8">
        <div className="sv-section-head">
          <div>
            <p className="sv-overline">Titles</p>
            <h2 className="sv-title mt-2">A navigable rail, not a dead end.</h2>
          </div>
          <Link className="text-sm text-muted-foreground transition hover:text-foreground" href="/films">
            Browse all films
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {films.map((film) => (
            <FilmCard key={film.id} film={film} />
          ))}
        </div>
      </section>
    </main>
  );
}

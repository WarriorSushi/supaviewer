import type { Metadata } from "next";
import { CatalogSearchForm } from "@/components/catalog-search-form";
import { FilmCard } from "@/components/film-card";
import { getFilmCatalogPage } from "@/lib/catalog";

type FilmsPageProps = {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    format?: string;
    sort?: string;
    page?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Browse films",
  description: "Search Supaviewer’s catalog of AI-native films by title, creator, or serial number.",
  alternates: {
    canonical: "/films",
  },
};

export default async function FilmsPage({ searchParams }: FilmsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const catalog = await getFilmCatalogPage({
    ...params,
    page,
    pageSize: 24,
  });

  function buildFilmsHref(nextPage: number) {
    const nextParams = new URLSearchParams();

    if (params.q?.trim()) {
      nextParams.set("q", params.q.trim());
    }

    if (params.sort && params.sort !== "featured") {
      nextParams.set("sort", params.sort);
    }

    if (nextPage > 1) {
      nextParams.set("page", String(nextPage));
    }

    const query = nextParams.toString();
    return query ? `/films?${query}` : "/films";
  }

  return (
    <main className="mx-auto w-full max-w-[110rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="sv-surface rounded-[1rem] p-4 sm:rounded-[1.2rem] sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="sv-overline hidden sm:block">Catalog</p>
              <h1 className="text-[1.28rem] font-semibold tracking-[-0.05em] text-foreground sm:mt-2 sm:text-[2.1rem]">
                Browse films
              </h1>
              <p className="mt-1 hidden max-w-2xl text-[0.88rem] leading-6 text-muted-foreground sm:block">
                Search by title, creator, or serial.
              </p>
            </div>
            <div className="sv-chip hidden w-fit sm:inline-flex">{catalog.total} films</div>
          </div>
          <div>
            <CatalogSearchForm
              compact
              q={params.q}
              showSort
              sort={params.sort}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 pb-8 pt-4 sm:gap-5 sm:pt-6 sm:grid-cols-2 xl:grid-cols-4">
        {catalog.films.map((film) => (
          <FilmCard key={film.serial} film={film} />
        ))}
      </section>
      <section className="flex flex-col gap-3 border-t border-border/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Page {catalog.page} of {catalog.totalPages}
        </p>
        <div className="flex gap-2">
          <a
            aria-disabled={catalog.page <= 1}
            className={`sv-btn sv-btn-secondary ${catalog.page <= 1 ? "pointer-events-none opacity-45" : ""}`}
            href={buildFilmsHref(catalog.page - 1)}
          >
            Previous
          </a>
          <a
            aria-disabled={catalog.page >= catalog.totalPages}
            className={`sv-btn sv-btn-secondary ${catalog.page >= catalog.totalPages ? "pointer-events-none opacity-45" : ""}`}
            href={buildFilmsHref(catalog.page + 1)}
          >
            Next
          </a>
        </div>
      </section>
    </main>
  );
}

import { CatalogSearchForm } from "@/components/catalog-search-form";
import { FilmCard } from "@/components/film-card";
import { filterFilms, getFilmFilterOptions } from "@/lib/catalog";

type FilmsPageProps = {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    format?: string;
    sort?: string;
  }>;
};

export default async function FilmsPage({ searchParams }: FilmsPageProps) {
  const params = await searchParams;
  const [filteredFilms, filterOptions] = await Promise.all([
    filterFilms(params),
    getFilmFilterOptions(),
  ]);

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 pb-28 pt-6 sm:px-6 lg:px-10">
      <section className="rounded-[2.25rem] border border-white/10 bg-[linear-gradient(135deg,rgba(244,195,117,0.12),rgba(255,255,255,0.03)_34%,rgba(8,10,16,0.92)_74%)] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-white/44">Catalog</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-5xl text-white sm:text-6xl">Browse films</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/66">
              Search the catalog by title, creator, or serial number. Every accepted title keeps its
              permanent place in the library.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/62">
            {filteredFilms.length} films
          </div>
        </div>
      </section>

      <section className="py-6">
        <CatalogSearchForm
          format={params.format}
          formats={filterOptions.formats}
          genre={params.genre}
          genres={filterOptions.genres}
          q={params.q}
          sort={params.sort}
        />
      </section>

      <section className="grid gap-4 pb-8 md:grid-cols-2 xl:grid-cols-3">
        {filteredFilms.map((film) => (
          <FilmCard key={film.serial} film={film} />
        ))}
      </section>
    </main>
  );
}

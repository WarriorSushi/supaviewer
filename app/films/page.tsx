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
    <main className="mx-auto w-full max-w-[110rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="sv-surface rounded-[1.2rem] p-6 sm:p-7">
        <div className="sv-section-head">
          <div>
            <p className="sv-overline">Catalog</p>
            <h1 className="mt-2 text-[2.2rem] font-semibold tracking-[-0.06em] text-white sm:text-[3rem]">
              Browse films
            </h1>
            <p className="mt-4 max-w-2xl text-[0.96rem] leading-7 text-white/62">
              Search by title, creator, or serial number. The artwork leads; metadata stays quiet.
            </p>
          </div>
          <div className="sv-chip">{filteredFilms.length} films</div>
        </div>
      </section>

      <section className="py-8">
        <CatalogSearchForm
          format={params.format}
          formats={filterOptions.formats}
          genre={params.genre}
          genres={filterOptions.genres}
          q={params.q}
          sort={params.sort}
        />
      </section>

      <section className="grid gap-5 pb-8 sm:grid-cols-2 xl:grid-cols-4">
        {filteredFilms.map((film) => (
          <FilmCard key={film.serial} film={film} />
        ))}
      </section>
    </main>
  );
}

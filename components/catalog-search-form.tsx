type CatalogSearchFormProps = {
  q?: string;
  genre?: string;
  format?: string;
  sort?: string;
  genres: string[];
  formats: string[];
};

export function CatalogSearchForm({
  q,
  genre,
  format,
  sort,
  genres,
  formats,
}: CatalogSearchFormProps) {
  return (
    <form className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 lg:grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(0,0.7fr))_auto]">
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/42">
          Search
        </span>
        <input
          className="w-full rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[var(--color-highlight)]/40"
          defaultValue={q}
          name="q"
          placeholder="Title, creator, or #serial"
          type="search"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/42">
          Genre
        </span>
        <select
          className="w-full rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-highlight)]/40"
          defaultValue={genre ?? "all"}
          name="genre"
        >
          {genres.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/42">
          Format
        </span>
        <select
          className="w-full rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-highlight)]/40"
          defaultValue={format ?? "all"}
          name="format"
        >
          {formats.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/42">
          Sort
        </span>
        <select
          className="w-full rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-highlight)]/40"
          defaultValue={sort ?? "featured"}
          name="sort"
        >
          <option value="featured">featured</option>
          <option value="recent">recent</option>
          <option value="runtime">runtime</option>
          <option value="discussed">discussed</option>
        </select>
      </label>
      <div className="flex items-end">
        <button className="h-[50px] rounded-full bg-[var(--color-highlight)] px-5 text-sm font-semibold text-[var(--color-bg)] transition hover:brightness-105">
          Apply
        </button>
      </div>
    </form>
  );
}

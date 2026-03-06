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
    <form className="sv-surface grid gap-4 rounded-[1rem] p-4 lg:grid-cols-[minmax(0,1.75fr)_repeat(3,minmax(0,0.82fr))_11rem]">
      <label className="block">
        <span className="mb-2 block text-[0.62rem] uppercase tracking-[0.22em] text-white/38">
          Search
        </span>
        <input
          className="sv-input"
          defaultValue={q}
          name="q"
          placeholder="Title, creator, or #serial"
          type="search"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-[0.62rem] uppercase tracking-[0.22em] text-white/38">
          Genre
        </span>
        <select
          className="sv-select"
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
        <span className="mb-2 block text-[0.62rem] uppercase tracking-[0.22em] text-white/38">
          Format
        </span>
        <select
          className="sv-select"
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
        <span className="mb-2 block text-[0.62rem] uppercase tracking-[0.22em] text-white/38">
          Sort
        </span>
        <select
          className="sv-select"
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
        <button className="sv-btn sv-btn-primary h-[46px] w-full">
          Apply
        </button>
      </div>
    </form>
  );
}

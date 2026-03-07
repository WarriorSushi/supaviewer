import Link from "next/link";
import { buildCollectionHref, type Collection } from "@/lib/catalog";

export function CollectionCard({ collection }: { collection: Collection }) {
  const featureFilm = collection.previewFilms[0] ?? null;

  return (
    <Link
      className={`group block overflow-hidden rounded-2xl border border-border/80 text-white shadow-[0_14px_40px_rgba(0,0,0,0.05)] transition hover:border-white/24 dark:shadow-[0_14px_40px_rgba(0,0,0,0.18)] ${collection.heroClassName}`}
      href={buildCollectionHref(collection)}
    >
      <div className="relative overflow-hidden">
        <div className="aspect-[16/8.7]" />
        {featureFilm?.thumbnailUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-[1.03]"
            style={{ backgroundImage: `url(${featureFilm.thumbnailUrl})` }}
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.18)_36%,rgba(0,0,0,0.84))]" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4">
          <p className="text-[0.62rem] uppercase tracking-[0.24em] text-white/58">{collection.countLabel}</p>
          <p className="text-[0.62rem] uppercase tracking-[0.24em] text-white/58">
            {collection.creatorCount} creators
          </p>
        </div>
        {featureFilm ? (
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/52">
              {featureFilm.genre} / {featureFilm.runtimeMinutes} min
            </p>
            <p className="mt-2 line-clamp-2 text-[1rem] font-medium tracking-[-0.03em] text-white">
              {featureFilm.title}
            </p>
            <p className="mt-1 text-[0.74rem] uppercase tracking-[0.14em] text-white/56">
              {featureFilm.creatorName}
            </p>
          </div>
        ) : null}
      </div>
      <div className="space-y-4 p-5">
        <div>
          <h3 className="text-[1.16rem] font-medium tracking-[-0.03em] text-white">{collection.name}</h3>
          <p className="mt-3 max-w-[24rem] text-[0.9rem] leading-6 text-white/66">{collection.description}</p>
        </div>
        <div className="grid gap-2">
          {collection.previewFilms.slice(0, 3).map((film) => (
            <div
              key={`${collection.slug}-${film.id}`}
              className="rounded-[1rem] border border-white/10 bg-black/18 px-4 py-3"
            >
              <p className="line-clamp-1 text-sm font-medium text-white">{film.title}</p>
              <p className="mt-1 text-[0.68rem] uppercase tracking-[0.16em] text-white/52">
                {film.creatorName} / {film.runtimeMinutes} min
              </p>
            </div>
          ))}
        </div>
        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-white/56 transition group-hover:text-white/76">
          Open collection
        </p>
      </div>
    </Link>
  );
}

import Link from "next/link";
import { buildFilmHref, type Film } from "@/lib/catalog";

export function RelatedFilmListItem({ film }: { film: Film }) {
  return (
    <Link
      href={buildFilmHref(film)}
      className="group grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 rounded-xl p-2 transition duration-200 hover:bg-[oklch(0.72_0.14_55_/_4%)]"
    >
      {/* Smaller thumbnail */}
      <div className="relative overflow-hidden rounded-lg">
        <div className={`aspect-[2/3] ${film.cardClassName}`} />
        {film.thumbnailUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${film.thumbnailUrl})` }}
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(0,0,0,0.4))]" />
      </div>

      {/* Info */}
      <div className="min-w-0 py-1">
        <h3 className="line-clamp-2 font-display text-[0.88rem] font-medium leading-[1.3] tracking-[-0.01em] text-foreground transition duration-200 group-hover:text-foreground/80">
          {film.title}
        </h3>
        <p className="mt-1.5 sv-overline">{film.creatorName}</p>
      </div>
    </Link>
  );
}

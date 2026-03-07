import Link from "next/link";
import { PlayIcon } from "@/components/icons";
import { SerialPill } from "@/components/serial-pill";
import { buildFilmHref, type Film } from "@/lib/catalog";

export function RelatedFilmListItem({ film }: { film: Film }) {
  return (
    <Link
      href={buildFilmHref(film)}
      className="group grid grid-cols-[10.5rem_minmax(0,1fr)] gap-3 rounded-xl p-2 transition hover:bg-foreground/[0.04]"
    >
      <div className="relative overflow-hidden rounded-[0.7rem]">
        <div className={`aspect-[16/10] ${film.cardClassName}`} />
        {film.thumbnailUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-[1.03]"
            style={{ backgroundImage: `url(${film.thumbnailUrl})` }}
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.08)_55%,rgba(0,0,0,0.74))]" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white">
            <PlayIcon className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="absolute left-2 top-2">
          <SerialPill serial={film.serial} />
        </div>
        <div className="absolute bottom-2 right-2 rounded bg-black/78 px-1.5 py-1 text-[0.65rem] font-medium text-white">
          {film.runtimeMinutes} min
        </div>
      </div>
      <div className="min-w-0 py-1">
        <h3 className="line-clamp-2 text-[0.9rem] font-medium leading-5 text-foreground transition group-hover:text-foreground/80">
          {film.title}
        </h3>
        <p className="mt-1 text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">{film.creatorName}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[0.7rem] text-muted-foreground">
          <span>{film.views} views</span>
          <span>•</span>
          <span>{film.genre}</span>
        </div>
      </div>
    </Link>
  );
}

import Link from "next/link";
import { BookmarkIcon, EyeIcon, PlayIcon } from "@/components/icons";
import { SerialPill } from "@/components/serial-pill";
import { buildFilmHref, type Film } from "@/lib/catalog";

type FilmCardProps = {
  film: Film;
  emphasis?: "default" | "compact";
};

export function FilmCard({ film, emphasis = "default" }: FilmCardProps) {
  const isCompact = emphasis === "compact";

  return (
    <Link
      href={buildFilmHref(film)}
      className="group block overflow-hidden rounded-[1rem] border border-white/8 bg-[rgba(16,16,18,0.98)] transition duration-300 hover:border-white/16 hover:bg-[rgba(19,19,22,0.98)]"
    >
      <div className="relative overflow-hidden">
        <div className={`aspect-[16/10] ${film.cardClassName}`} />
        {film.thumbnailUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-[1.03]"
            style={{ backgroundImage: `url(${film.thumbnailUrl})` }}
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.12)_50%,rgba(0,0,0,0.78))]" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-black/66 text-white">
            <PlayIcon className="h-5 w-5" />
          </div>
        </div>
        <div className="absolute left-3 top-3">
          <SerialPill serial={film.serial} />
        </div>
        <div className="absolute right-3 top-3 rounded-[0.55rem] border border-white/12 bg-black/55 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-white/64 backdrop-blur-md">
          {film.runtimeMinutes} min
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-white/54">
            <span>{film.genre}</span>
            <span className="text-white/28">/</span>
            <span>{film.format}</span>
          </div>
        </div>
      </div>
      <div className={`space-y-1.5 px-4 pb-4 pt-3 ${isCompact ? "" : "sm:px-4 sm:pb-4 sm:pt-3.5"}`}>
        <h3
          className={[
            "line-clamp-2 font-sans font-medium tracking-[-0.025em] text-white transition duration-300 group-hover:text-white/88",
            isCompact ? "text-[0.97rem] leading-5.5" : "text-[1rem] leading-6",
          ].join(" ")}
        >
          {film.title}
        </h3>
        <p className="text-[0.72rem] uppercase tracking-[0.12em] text-white/44">{film.creatorName}</p>
        <div className="flex items-center gap-3 text-[0.69rem] text-white/42">
          <span className="inline-flex items-center gap-1.5">
            <EyeIcon className="h-3.5 w-3.5" />
            {film.views}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BookmarkIcon className="h-3.5 w-3.5" />
            {film.saves}
          </span>
        </div>
      </div>
    </Link>
  );
}

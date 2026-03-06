import Link from "next/link";
import { SerialPill } from "@/components/serial-pill";
import { buildFilmHref, type Film } from "@/lib/catalog";

type FilmCardProps = {
  film: Film;
  emphasis?: "default" | "compact";
};

export function FilmCard({ film, emphasis = "default" }: FilmCardProps) {
  return (
    <Link
      href={buildFilmHref(film)}
      className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(7,10,18,0.92))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-[var(--color-highlight)]/40 hover:shadow-[0_28px_90px_rgba(0,0,0,0.4)]"
    >
      <div
        className={`absolute inset-x-5 top-5 rounded-[1.5rem] ${emphasis === "compact" ? "h-32" : "h-40"} ${film.cardClassName}`}
      />
      <div
        className={`relative flex flex-col justify-between ${emphasis === "compact" ? "min-h-[16.5rem]" : "min-h-[19rem]"}`}
      >
        <div className="space-y-4">
          <SerialPill serial={film.serial} />
          <div className={`space-y-2 ${emphasis === "compact" ? "pt-24" : "pt-28"}`}>
            <h3 className="font-display text-3xl leading-none tracking-[0.01em] text-white">
              {film.title}
            </h3>
            <p className="text-sm uppercase tracking-[0.28em] text-white/56">
              {film.genre} / {film.runtimeMinutes} min
            </p>
          </div>
          <p className="max-w-xl text-sm leading-6 text-white/68">{film.logline}</p>
        </div>
        <div className="flex items-end justify-between gap-4 pt-8 text-sm text-white/72">
          <span>{film.creatorName}</span>
          <span className="transition duration-300 group-hover:text-[var(--color-highlight)]">
            Watch film
          </span>
        </div>
      </div>
    </Link>
  );
}

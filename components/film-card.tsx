import Link from "next/link";
import { SerialPill } from "@/components/serial-pill";
import { StatusPill } from "@/components/status-pill";
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
      className="group block overflow-hidden rounded-2xl border border-border/60 bg-card transition duration-300 hover:scale-[1.02] hover:border-[oklch(0.72_0.08_55_/_16%)] dark:border-[oklch(1_0_0_/_6%)] dark:hover:border-[oklch(0.72_0.08_55_/_22%)]"
    >
      {/* ── Image area — poster ratio ── */}
      <div className="relative overflow-hidden">
        <div className={`aspect-[2/3] ${film.cardClassName}`} />
        {film.thumbnailUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${film.thumbnailUrl})` }}
          />
        ) : null}

        {/* Gradient overlay — starts at ~40% for text legibility */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.55)_75%,rgba(0,0,0,0.82))]" />

        {/* Serial pill — top-left, refined */}
        <div className="absolute left-2.5 top-2.5">
          <SerialPill serial={film.serial} />
        </div>

        {/* Runtime — minimal text, bottom-right */}
        <span className="absolute bottom-3 right-3 text-[0.64rem] font-medium tracking-wide text-white/70">
          {film.runtimeMinutes} min
        </span>
      </div>

      {/* ── Info section ── */}
      <div className={`space-y-2 px-3.5 pb-3.5 pt-3 ${isCompact ? "" : "sm:px-4 sm:pb-4 sm:pt-3.5"}`}>
        {/* Status pills — outside image, kept clean */}
        <div className="flex flex-wrap gap-1.5">
          <StatusPill badge={film.founderBadge} compact />
          {film.trophies[0] ? <StatusPill compact trophy={film.trophies[0]} /> : null}
        </div>

        {/* Film title — Fraunces display */}
        <h3
          className={[
            "line-clamp-2 font-display font-medium tracking-[-0.02em] text-card-foreground transition duration-300 group-hover:text-foreground/80",
            isCompact ? "text-[0.95rem] leading-[1.25]" : "text-[1.05rem] leading-[1.25]",
          ].join(" ")}
        >
          {film.title}
        </h3>

        {/* Creator name — amber overline style */}
        <p className="sv-overline">{film.creatorName}</p>
      </div>
    </Link>
  );
}

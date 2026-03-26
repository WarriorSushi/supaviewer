import Link from "next/link";
import { TrophyStrip } from "@/components/trophy-strip";
import { buildCreatorHref, type Creator } from "@/lib/catalog";

export function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <Link
      href={buildCreatorHref(creator)}
      className="group flex items-start gap-4 rounded-2xl border border-border/60 bg-card px-5 py-5 transition duration-200 hover:border-[oklch(0.72_0.08_55_/_18%)] dark:border-[oklch(1_0_0_/_6%)] dark:hover:border-[oklch(0.72_0.08_55_/_16%)]"
    >
      {/* Avatar — warm amber with dark initials */}
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.72_0.14_55_/_14%)] text-sm font-semibold text-[oklch(0.65_0.16_50)] dark:bg-[oklch(0.72_0.14_55_/_12%)] dark:text-[oklch(0.72_0.14_55)]">
        {creator.name.slice(0, 2).toUpperCase()}
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Name — Fraunces display */}
        <p className="font-display text-[1.2rem] font-medium tracking-[-0.02em] text-foreground">
          {creator.name}
        </p>

        {/* Headline — body text */}
        <p className="mt-1 line-clamp-2 max-w-xl text-[0.88rem] leading-[1.55] text-muted-foreground">
          {creator.headline}
        </p>

        {/* Trophy strip */}
        {creator.trophies.length > 0 && (
          <div className="mt-3">
            <TrophyStrip compact trophies={creator.trophies.slice(0, 3)} />
          </div>
        )}
      </div>

      {/* Minimal stats — right-aligned */}
      <div className="hidden shrink-0 items-end gap-4 text-right sm:flex">
        <div>
          <p className="font-mono text-sm tabular-nums text-foreground">
            {creator.earliestSerial ? `#${creator.earliestSerial}` : "—"}
          </p>
          <p className="mt-0.5 text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
            serial
          </p>
        </div>
        <div>
          <p className="font-mono text-sm tabular-nums text-foreground/70">
            {creator.filmsDirected}
          </p>
          <p className="mt-0.5 text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
            films
          </p>
        </div>
      </div>
    </Link>
  );
}

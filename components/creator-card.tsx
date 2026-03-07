import Link from "next/link";
import { StatusPill } from "@/components/status-pill";
import { TrophyStrip } from "@/components/trophy-strip";
import { buildCreatorHref, type Creator } from "@/lib/catalog";

export function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <Link
      href={buildCreatorHref(creator)}
      className="grid gap-5 rounded-2xl border border-border/80 bg-card px-5 py-5 transition hover:border-foreground/15 md:grid-cols-[minmax(0,1fr)_auto]"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/60 text-sm font-semibold text-foreground">
          {creator.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="text-[1.16rem] font-medium tracking-[-0.03em] text-foreground">{creator.name}</p>
          <p className="mt-1 max-w-xl text-[0.9rem] leading-6 text-muted-foreground">{creator.headline}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusPill badge={creator.founderBadge} compact />
            {creator.trophies.slice(0, 2).map((trophy) => (
              <StatusPill key={`${creator.slug}-${trophy.slug}`} compact trophy={trophy} />
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-3 text-sm text-muted-foreground md:text-right">
        <div>
          <p className="font-mono text-sm text-foreground">
            {creator.earliestSerial ? `#${creator.earliestSerial}` : "Unranked"}
          </p>
          <p className="mt-1 text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">earliest serial</p>
        </div>
        <div>
          <p className="font-mono text-sm text-foreground">{creator.followers}</p>
          <p className="mt-1 text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">followers</p>
        </div>
        <div>
          <p className="font-mono text-sm text-foreground/74">{creator.filmsDirected}</p>
          <p className="mt-1 text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">films</p>
        </div>
        {creator.trophies.length ? (
          <div className="md:justify-self-end">
            <TrophyStrip compact trophies={creator.trophies.slice(0, 1)} />
          </div>
        ) : null}
      </div>
    </Link>
  );
}

import { StatusPill } from "@/components/status-pill";
import type { Trophy } from "@/lib/status";

type TrophyStripProps = {
  trophies: Trophy[];
  compact?: boolean;
  emptyLabel?: string;
};

export function TrophyStrip({
  trophies,
  compact = false,
  emptyLabel,
}: TrophyStripProps) {
  if (!trophies.length) {
    return emptyLabel ? <p className="text-sm text-muted-foreground">{emptyLabel}</p> : null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {trophies.map((trophy) => (
        <StatusPill key={`${trophy.slug}-${trophy.startsAt ?? "active"}`} compact={compact} trophy={trophy} />
      ))}
    </div>
  );
}

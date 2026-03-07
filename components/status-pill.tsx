import type { FounderBadge, Trophy } from "@/lib/status";

type StatusPillProps = {
  badge?: FounderBadge | null;
  trophy?: Trophy | null;
  compact?: boolean;
};

export function StatusPill({ badge, trophy, compact = false }: StatusPillProps) {
  const label = badge?.name ?? trophy?.name;
  const description = badge?.description ?? trophy?.description ?? "";
  const kind = badge ? "founder" : trophy?.assignmentType === "signal" ? "signal" : "editorial";

  if (!label) {
    return null;
  }

  return (
    <span
      className={[
        "sv-status-pill",
        `sv-status-pill--${kind}`,
        compact ? "sv-status-pill--compact" : "",
      ].join(" ")}
      title={description}
    >
      {label}
    </span>
  );
}

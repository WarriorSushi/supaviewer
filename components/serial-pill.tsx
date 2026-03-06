type SerialPillProps = {
  serial: number;
  large?: boolean;
};

export function SerialPill({ serial, large = false }: SerialPillProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border border-white/15 bg-white/8 font-semibold uppercase text-[var(--color-highlight)]",
        large
          ? "px-4 py-2 text-xs tracking-[0.34em]"
          : "px-3 py-1 text-[0.68rem] tracking-[0.28em]",
      ].join(" ")}
    >
      #{serial}
    </span>
  );
}

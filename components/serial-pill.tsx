type SerialPillProps = {
  serial: number;
  large?: boolean;
};

export function SerialPill({ serial, large = false }: SerialPillProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full font-mono font-medium uppercase text-foreground backdrop-blur-md",
        large
          ? "px-3.5 py-1.5 text-[0.7rem] tracking-[0.28em]"
          : "px-2 py-0.5 text-[0.62rem] tracking-[0.22em]",
      ].join(" ")}
      style={{
        border: "1px solid color-mix(in oklab, oklch(0.72 0.14 55) 15%, var(--border))",
        background: "oklch(0.72 0.14 55 / 6%)",
      }}
    >
      #{serial}
    </span>
  );
}

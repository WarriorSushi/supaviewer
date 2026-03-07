type SerialPillProps = {
  serial: number;
  large?: boolean;
};

export function SerialPill({ serial, large = false }: SerialPillProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border border-border/80 bg-background/82 font-medium uppercase text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-md dark:shadow-[0_10px_30px_rgba(0,0,0,0.18)]",
        large
          ? "px-4 py-2 text-[0.72rem] tracking-[0.28em]"
          : "px-2.5 py-1 text-[0.64rem] tracking-[0.22em]",
      ].join(" ")}
    >
      #{serial}
    </span>
  );
}

type SerialPillProps = {
  serial: number;
  large?: boolean;
};

export function SerialPill({ serial, large = false }: SerialPillProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-[999px] border border-white/12 bg-[rgba(255,255,255,0.05)] font-medium uppercase text-white/86 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-md",
        large
          ? "px-4 py-2 text-[0.72rem] tracking-[0.28em]"
          : "px-2.5 py-1 text-[0.64rem] tracking-[0.22em]",
      ].join(" ")}
    >
      #{serial}
    </span>
  );
}

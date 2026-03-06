import Link from "next/link";
import { buildCreatorHref, type Creator } from "@/lib/catalog";

export function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <Link
      href={buildCreatorHref(creator)}
      className="grid gap-5 rounded-[1rem] border border-white/8 bg-[rgba(16,16,18,0.98)] px-5 py-5 transition hover:border-white/16 md:grid-cols-[minmax(0,1fr)_auto]"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[0.9rem] border border-white/10 bg-white/5 text-sm font-semibold text-white">
          {creator.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="text-[1.16rem] font-medium tracking-[-0.03em] text-white">{creator.name}</p>
          <p className="mt-1 max-w-xl text-[0.9rem] leading-6 text-white/58">{creator.headline}</p>
        </div>
      </div>
      <div className="flex items-center gap-6 text-sm text-white/52 md:text-right">
        <div>
          <p className="font-mono text-sm text-white">{creator.followers}</p>
          <p className="mt-1 text-[0.7rem] uppercase tracking-[0.22em] text-white/34">followers</p>
        </div>
        <div>
          <p className="font-mono text-sm text-white/68">{creator.filmsDirected}</p>
          <p className="mt-1 text-[0.7rem] uppercase tracking-[0.22em] text-white/34">films</p>
        </div>
      </div>
    </Link>
  );
}

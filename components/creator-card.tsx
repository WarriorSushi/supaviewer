import Link from "next/link";
import { buildCreatorHref, type Creator } from "@/lib/catalog";

export function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <Link
      href={buildCreatorHref(creator)}
      className="flex items-center justify-between gap-4 rounded-[1.75rem] border border-white/10 bg-white/4 px-5 py-5 transition hover:-translate-y-1 hover:border-white/22 hover:bg-white/6"
    >
      <div>
        <p className="font-display text-3xl text-white">{creator.name}</p>
        <p className="mt-1 max-w-lg text-sm leading-6 text-white/58">{creator.headline}</p>
      </div>
      <div className="text-right">
        <p className="font-mono text-sm text-[var(--color-highlight)]">{creator.followers}</p>
        <p className="text-xs uppercase tracking-[0.24em] text-white/38">Followers</p>
      </div>
    </Link>
  );
}

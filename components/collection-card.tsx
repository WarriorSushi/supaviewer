import { type Collection } from "@/lib/catalog";

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <article
      className={`rounded-[1rem] border border-white/8 p-5 transition hover:border-white/16 ${collection.heroClassName}`}
    >
      <p className="text-[0.62rem] uppercase tracking-[0.24em] text-white/40">{collection.countLabel}</p>
      <h3 className="mt-4 text-[1.16rem] font-medium tracking-[-0.03em] text-white">{collection.name}</h3>
      <p className="mt-3 text-[0.9rem] leading-6 text-white/60">{collection.description}</p>
    </article>
  );
}

import { type Collection } from "@/lib/catalog";

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <article
      className={`rounded-[2rem] border border-white/10 p-5 transition hover:-translate-y-1 hover:border-[var(--color-highlight)]/35 ${collection.heroClassName}`}
    >
      <p className="text-xs uppercase tracking-[0.3em] text-white/42">{collection.countLabel}</p>
      <h3 className="mt-4 font-display text-3xl leading-none text-white">{collection.name}</h3>
      <p className="mt-3 text-sm leading-6 text-white/66">{collection.description}</p>
    </article>
  );
}

import Link from "next/link";
import { buildCollectionHref, type Collection } from "@/lib/catalog";

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link
      className={`group relative block overflow-hidden rounded-2xl text-white ${collection.heroClassName}`}
      href={buildCollectionHref(collection)}
    >
      <div className="relative aspect-[3/2]">
        {/* Full-bleed background image with hover zoom */}
        {collection.artImagePath ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition duration-700 ease-out group-hover:scale-[1.04]"
            style={{ backgroundImage: `url(${collection.artImagePath})` }}
          />
        ) : null}

        {/* Dramatic dark gradient from bottom */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,rgba(0,0,0,0.18)_40%,rgba(0,0,0,0.88))]" />

        {/* Warm glow at bottom edge on hover */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(180deg,transparent,oklch(0.72_0.14_55_/_0%))] transition duration-500 group-hover:bg-[linear-gradient(180deg,transparent,oklch(0.72_0.14_55_/_8%))]" />

        {/* Text content — bottom-aligned */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5 xl:p-6">
          {/* Eyebrow — warm amber overline */}
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[oklch(0.72_0.14_55)]">
            {collection.eyebrow}
          </p>

          {/* Collection name — Fraunces display, larger */}
          <h3 className="mt-2.5 font-display text-[1.4rem] font-medium tracking-[-0.03em] text-white sm:text-[1.65rem] xl:text-[1.85rem]">
            {collection.name}
          </h3>

          {/* Subheading */}
          <p className="mt-2 max-w-[22rem] text-[0.84rem] leading-[1.5] text-white/65 sm:text-[0.9rem]">
            {collection.subheading}
          </p>
        </div>
      </div>
    </Link>
  );
}

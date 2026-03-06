import { CreatorCard } from "@/components/creator-card";
import { getCreators } from "@/lib/catalog";

export default async function CreatorsPage() {
  const creators = await getCreators();

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 pb-28 pt-6 sm:px-6 lg:px-10">
      <section className="rounded-[2.25rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02)_34%,rgba(8,10,16,0.92)_74%)] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-white/44">Creators</p>
        <h1 className="mt-3 font-display text-5xl text-white sm:text-6xl">Director spotlights</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/66">
          Profiles are designed to feel like filmographies, not social profiles with extra clutter.
        </p>
      </section>
      <section className="grid gap-4 py-6">
        {creators.map((creator) => (
          <CreatorCard key={creator.slug} creator={creator} />
        ))}
      </section>
    </main>
  );
}

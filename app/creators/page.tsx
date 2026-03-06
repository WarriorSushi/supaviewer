import { CreatorCard } from "@/components/creator-card";
import { getCreators } from "@/lib/catalog";

export default async function CreatorsPage() {
  const creators = await getCreators();

  return (
    <main className="mx-auto w-full max-w-[100rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="rounded-[1rem] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02)_34%,rgba(10,10,12,0.96)_74%)] p-6 sm:p-8">
        <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/44">Creators</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">Director spotlights</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/64">
          Profiles are designed to feel like filmographies, not social profiles with extra clutter.
        </p>
      </section>
      <section className="grid gap-4 py-8">
        {creators.map((creator) => (
          <CreatorCard key={creator.slug} creator={creator} />
        ))}
      </section>
    </main>
  );
}

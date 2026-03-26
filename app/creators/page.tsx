import type { Metadata } from "next";
import { CreatorCard } from "@/components/creator-card";
import { getCreators } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Creators",
  description: "Explore the AI filmmakers and creator filmographies building the Supaviewer catalog.",
  alternates: {
    canonical: "/creators",
  },
};

export default async function CreatorsPage() {
  const creators = await getCreators();

  return (
    <main className="mx-auto w-full max-w-[96rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="sv-animate-in">
        <p className="sv-overline">Creators</p>
        <h1 className="sv-display mt-3">Director spotlights</h1>
        <p className="sv-body mt-4 max-w-2xl">
          Profiles are designed to feel like filmographies, not social profiles with extra clutter.
        </p>
      </section>
      <section className="mt-12 grid gap-4 sv-animate-in sv-stagger-1">
        {creators.map((creator) => (
          <CreatorCard key={creator.slug} creator={creator} />
        ))}
      </section>
    </main>
  );
}

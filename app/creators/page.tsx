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
    <main className="mx-auto w-full max-w-[100rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="sv-page-hero rounded-[1rem] p-6 sm:p-8">
        <p className="sv-overline">Creators</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">Director spotlights</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
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

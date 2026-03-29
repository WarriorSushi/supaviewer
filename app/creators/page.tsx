import type { Metadata } from "next";
import { CreatorCard } from "@/components/creator-card";
import { PublicRouteNotice } from "@/components/public-route-notice";
import { getCreators } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Creators",
  description: "Explore the AI filmmakers and creator filmographies building the Supaviewer catalog.",
  alternates: {
    canonical: "/creators",
  },
};

async function loadCreatorsPageData<T>(
  label: string,
  loader: () => Promise<T>,
  fallback: T,
) {
  try {
    return {
      data: await loader(),
      failed: false,
    };
  } catch (error) {
    console.error(`[creators] Failed to load ${label}:`, error);
    return {
      data: fallback,
      failed: true,
    };
  }
}

export default async function CreatorsPage() {
  const creatorsResult = await loadCreatorsPageData("creator directory", getCreators, []);
  const creators = creatorsResult.data;

  return (
    <main className="mx-auto w-full max-w-[96rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="sv-animate-in">
        <p className="sv-overline">Creators</p>
        <h1 className="sv-display mt-3">Director spotlights</h1>
        <p className="sv-body mt-4 max-w-2xl">
          Profiles are designed to feel like filmographies, not social profiles with extra clutter.
        </p>
      </section>
      {creatorsResult.failed ? (
        <section className="mt-10 sv-animate-in sv-stagger-1">
          <PublicRouteNotice
            description="The creator directory is still online, but the live filmography data source is reconnecting. This fallback keeps the route stable instead of sending visitors into a server-render crash."
            eyebrow="Directory reconnect"
            primaryHref="/films"
            primaryLabel="Browse films"
            secondaryHref="/submit"
            secondaryLabel="Open submissions"
            title="Creator dossiers are temporarily syncing."
          />
        </section>
      ) : null}
      <section className="mt-12 grid gap-4 sv-animate-in sv-stagger-1">
        {creators.length ? (
          creators.map((creator) => (
            <CreatorCard key={creator.slug} creator={creator} />
          ))
        ) : (
          <div className="rounded-[1.4rem] border border-border/60 bg-card/70 px-5 py-6 text-sm text-muted-foreground">
            Creator profiles will appear here once the first public dossiers are live.
          </div>
        )}
      </section>
    </main>
  );
}

import { requestCreatorClaim } from "@/app/studio/actions";
import { toggleCreatorFollow } from "@/app/actions/social";
import { notFound } from "next/navigation";
import { FilmCard } from "@/components/film-card";
import { getCurrentSessionProfile } from "@/lib/auth";
import { getCreatorBySlug, getFilmsForCreator } from "@/lib/catalog";
import { getCreatorFollowState } from "@/lib/social";

type CreatorDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CreatorDetailPage({ params }: CreatorDetailPageProps) {
  const { slug } = await params;
  const creator = await getCreatorBySlug(slug);

  if (!creator) {
    notFound();
  }

  const [creatorFilms, followState, session] = await Promise.all([
    getFilmsForCreator(creator.slug),
    getCreatorFollowState(creator.id),
    getCurrentSessionProfile(),
  ]);
  const creatorPath = `/creators/${creator.slug}`;

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 pb-28 pt-6 sm:px-6 lg:px-10">
      <section className={`rounded-[2.25rem] border border-white/10 p-6 sm:p-8 ${creator.heroClassName}`}>
        <p className="text-xs uppercase tracking-[0.3em] text-white/44">Creator profile</p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-5xl text-white sm:text-6xl">{creator.name}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/68">{creator.bio}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <form action={toggleCreatorFollow.bind(null, creator.id, creatorPath)}>
                <button className="rounded-full bg-[var(--color-highlight)] px-6 py-3 text-sm font-semibold text-[var(--color-bg)] transition hover:brightness-105">
                  {followState.following ? "Following" : session.profile ? "Follow creator" : "Sign in to follow"}
                </button>
              </form>
              {session.profile && !creator.ownerProfileId && session.profile.id !== creator.ownerProfileId ? (
                <form action={requestCreatorClaim.bind(null, creator.id)}>
                  <button className="rounded-full border border-white/12 bg-white/6 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/24 hover:bg-white/10">
                    Request claim
                  </button>
                </form>
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center text-sm">
            <div className="rounded-[1.35rem] border border-white/10 bg-black/16 px-4 py-4">
              <p className="font-mono text-[var(--color-highlight)]">{creator.followers}</p>
              <p className="mt-1 text-white/48">followers</p>
            </div>
            <div className="rounded-[1.35rem] border border-white/10 bg-black/16 px-4 py-4">
              <p className="font-mono text-[var(--color-highlight)]">{creator.filmsDirected}</p>
              <p className="mt-1 text-white/48">films</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 py-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/42">Profile</p>
          <div className="mt-4 grid gap-3 text-sm text-white/72">
            <div className="flex items-center justify-between rounded-[1.35rem] border border-white/10 bg-white/4 px-4 py-4">
              <span className="text-white/48">Location</span>
              <span>{creator.location}</span>
            </div>
            <div className="flex items-center justify-between rounded-[1.35rem] border border-white/10 bg-white/4 px-4 py-4">
              <span className="text-white/48">Specialty</span>
              <span>{creator.headline}</span>
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/42">Filmography</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {creatorFilms.map((film) => (
              <FilmCard key={film.serial} film={film} emphasis="compact" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

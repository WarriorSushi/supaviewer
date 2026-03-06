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
    <main className="mx-auto w-full max-w-[100rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className={`rounded-[2rem] border border-white/8 p-6 sm:p-8 ${creator.heroClassName}`}>
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/44">Creator profile</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
              {creator.name}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/68">{creator.bio}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <form action={toggleCreatorFollow.bind(null, creator.id, creatorPath)}>
                <button className="rounded-full bg-[var(--color-highlight)] px-6 py-3 text-sm font-semibold text-[var(--color-bg)] transition hover:brightness-105">
                  {followState.following
                    ? "Following"
                    : session.profile
                      ? "Follow creator"
                      : "Sign in to follow"}
                </button>
              </form>
              {session.profile?.id === creator.ownerProfileId ? (
                <a
                  className="rounded-full border border-white/12 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:border-white/24 hover:bg-white/10"
                  href="/studio"
                >
                  Manage in studio
                </a>
              ) : null}
              {session.profile && !creator.ownerProfileId && session.profile.id !== creator.ownerProfileId ? (
                <form action={requestCreatorClaim.bind(null, creator.id)}>
                  <button className="rounded-full border border-white/12 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:border-white/24 hover:bg-white/10">
                    Request claim
                  </button>
                </form>
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center text-sm">
            <div className="rounded-[1.3rem] border border-white/8 bg-[rgba(7,17,27,0.28)] px-5 py-5">
              <p className="font-mono text-[var(--color-highlight)]">{creator.followers}</p>
              <p className="mt-1 text-white/44">followers</p>
            </div>
            <div className="rounded-[1.3rem] border border-white/8 bg-[rgba(7,17,27,0.28)] px-5 py-5">
              <p className="font-mono text-[var(--color-highlight)]">{creator.filmsDirected}</p>
              <p className="mt-1 text-white/44">films</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 py-8 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="rounded-[1.8rem] border border-white/8 bg-[rgba(12,20,31,0.72)] p-6">
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/42">Profile</p>
          <div className="mt-4 grid gap-3 text-sm text-white/72">
            <div className="flex items-center justify-between rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-4">
              <span className="text-white/48">Location</span>
              <span>{creator.location}</span>
            </div>
            <div className="flex items-center justify-between rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-4">
              <span className="text-white/48">Specialty</span>
              <span>{creator.headline}</span>
            </div>
          </div>
        </div>
        <div className="rounded-[1.8rem] border border-white/8 bg-[rgba(12,20,31,0.72)] p-6">
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/42">Filmography</p>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {creatorFilms.map((film) => (
              <FilmCard key={film.serial} film={film} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

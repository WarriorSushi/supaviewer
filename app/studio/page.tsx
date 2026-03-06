import Link from "next/link";
import { redirect } from "next/navigation";
import { createCreatorProfile } from "@/app/studio/actions";
import { getCurrentSessionProfile } from "@/lib/auth";
import { getCreators } from "@/lib/catalog";
import { getViewerLibrary } from "@/lib/viewer";

type StudioPageProps = {
  searchParams: Promise<{ created?: string; error?: string }>;
};

const studioErrors: Record<string, string> = {
  "missing-fields": "Fill in the creator profile fields before creating your studio profile.",
  "create-failed": "The creator profile could not be created. The name or slug may already be taken.",
};

export default async function StudioPage({ searchParams }: StudioPageProps) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    redirect("/login?next=/studio");
  }

  const params = await searchParams;
  const [creators, library] = await Promise.all([getCreators(), getViewerLibrary()]);
  const ownedCreator = creators.find((creator) => creator.ownerProfileId === profile.id) ?? null;
  const success = params.created === "1";
  const error = params.error ? studioErrors[params.error] : null;

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 pb-28 pt-6 sm:px-6 lg:px-10">
      <section className="rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(244,195,117,0.16),rgba(255,255,255,0.03)_34%,rgba(8,10,16,0.92)_74%)] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-white/44">Creator studio</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-5xl text-white sm:text-6xl">Manage your creator identity</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/68">
              Build or claim the profile that represents your AI-native film practice, then track submissions and catalog presence.
            </p>
          </div>
          <Link
            className="rounded-full border border-white/12 bg-white/6 px-5 py-3 text-sm text-white transition hover:border-white/24 hover:bg-white/10"
            href="/library"
          >
            Open library
          </Link>
        </div>
      </section>

      <section className="grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.9fr)]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/42">Owned creator profile</p>
          {ownedCreator ? (
            <div className={`mt-4 rounded-[2rem] border border-white/10 p-6 ${ownedCreator.heroClassName}`}>
              <p className="text-xs uppercase tracking-[0.3em] text-white/44">Active profile</p>
              <h2 className="mt-3 font-display text-4xl text-white">{ownedCreator.name}</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-white/68">{ownedCreator.bio}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  className="rounded-full bg-[var(--color-highlight)] px-5 py-3 text-sm font-semibold text-[var(--color-bg)]"
                  href={`/creators/${ownedCreator.slug}`}
                >
                  View public profile
                </Link>
                <span className="rounded-full border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/68">
                  {ownedCreator.filmsDirected} films
                </span>
              </div>
            </div>
          ) : (
            <>
              {success ? (
                <div className="mt-4 rounded-[1.4rem] border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-100">
                  Creator profile created. You can now build your public identity on Superviewer.
                </div>
              ) : null}
              {error ? (
                <div className="mt-4 rounded-[1.4rem] border border-rose-400/20 bg-rose-400/10 px-4 py-4 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}
              <form action={createCreatorProfile} className="mt-4 grid gap-4">
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/42">
                    Creator name
                  </span>
                  <input
                    className="w-full rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[var(--color-highlight)]/40"
                    name="name"
                    placeholder="Mira Sol"
                    type="text"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/42">
                    Headline
                  </span>
                  <input
                    className="w-full rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[var(--color-highlight)]/40"
                    name="headline"
                    placeholder="Slow-burn AI thrillers with digital weather and human fragility."
                    type="text"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/42">
                    Bio
                  </span>
                  <textarea
                    className="min-h-36 w-full rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[var(--color-highlight)]/40"
                    name="bio"
                    placeholder="Describe your cinematic practice, themes, and process."
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/42">
                    Location
                  </span>
                  <input
                    className="w-full rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[var(--color-highlight)]/40"
                    name="location"
                    placeholder="Kolkata"
                    type="text"
                  />
                </label>
                <button className="rounded-full bg-[var(--color-highlight)] px-6 py-3 text-sm font-semibold text-[var(--color-bg)]">
                  Create creator profile
                </button>
              </form>
            </>
          )}
        </div>

        <div className="grid gap-4">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/42">Submission health</p>
            <div className="mt-4 grid gap-3 text-sm text-white/72">
              <div className="rounded-[1.3rem] border border-white/10 bg-white/4 px-4 py-4">
                {library.submissions.length} submissions in your history
              </div>
              <div className="rounded-[1.3rem] border border-white/10 bg-white/4 px-4 py-4">
                {library.claims.length} creator claim requests tracked
              </div>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/42">Claiming an existing profile</p>
            <p className="mt-4 text-sm leading-6 text-white/68">
              If a public creator profile already exists for you, open that creator page and request a claim.
              Claims go into the admin review queue instead of transferring ownership instantly.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

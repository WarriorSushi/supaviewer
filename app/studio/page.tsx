import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createCreatorProfile,
  updateCreatorProfile,
  updateViewerProfile,
} from "@/app/studio/actions";
import { getCurrentSessionProfile } from "@/lib/auth";
import { getCreators } from "@/lib/catalog";
import { getViewerLibrary } from "@/lib/viewer";

type StudioPageProps = {
  searchParams: Promise<{
    created?: string;
    error?: string;
    profile?: string;
    creator?: string;
  }>;
};

const studioErrors: Record<string, string> = {
  "missing-fields": "Fill in the creator profile fields before creating your studio profile.",
  "create-failed": "The creator profile could not be created. The name or slug may already be taken.",
  "profile-missing-fields": "Display name is required.",
  "profile-update-failed": "Your viewer profile could not be updated.",
  "creator-missing-fields": "Complete all creator profile fields before saving.",
  "creator-not-found": "No owned creator profile was found for this account.",
  "creator-update-failed": "The creator profile could not be updated.",
};

export default async function StudioPage({ searchParams }: StudioPageProps) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    redirect("/login?next=/studio");
  }

  const params = await searchParams;
  const [creators, library] = await Promise.all([getCreators(), getViewerLibrary()]);
  const ownedCreator = creators.find((creator) => creator.ownerProfileId === profile.id) ?? null;
  const successMessage =
    params.created === "1"
      ? "Creator profile created. You can now shape your public identity on Superviewer."
      : params.profile === "updated"
        ? "Viewer profile updated."
        : params.creator === "updated"
          ? "Creator profile updated."
          : null;
  const error = params.error ? studioErrors[params.error] : null;

  return (
    <main className="mx-auto w-full max-w-[100rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="rounded-[1rem] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02)_34%,rgba(10,10,12,0.96)_74%)] p-6 sm:p-8">
        <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/44">Creator studio</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
              Manage your identity and editorial surface.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/68">
              Keep your viewer profile, creator page, submission history, and watch shelf aligned in
              one place.
            </p>
          </div>
          <Link
            className="rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm text-white transition hover:border-white/24 hover:bg-white/10"
            href="/library"
          >
            Open library
          </Link>
        </div>
        {successMessage ? (
          <div className="mt-6 rounded-[1.25rem] border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-100">
            {successMessage}
          </div>
        ) : null}
        {error ? (
          <div className="mt-4 rounded-[1.25rem] border border-rose-400/20 bg-rose-400/10 px-4 py-4 text-sm text-rose-100">
            {error}
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 py-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="grid gap-6">
          <div className="rounded-[1.8rem] border border-white/8 bg-[rgba(12,20,31,0.72)] p-6">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/42">Viewer profile</p>
            <form action={updateViewerProfile} className="mt-5 grid gap-4">
              <label className="block">
                <span className="mb-2 block text-[0.68rem] uppercase tracking-[0.24em] text-white/42">
                  Display name
                </span>
                <input
                  className="w-full rounded-[1.1rem] border border-white/10 bg-[rgba(7,17,27,0.7)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[var(--color-highlight)]/40"
                  defaultValue={profile.displayName}
                  name="displayName"
                  placeholder="Your name"
                  type="text"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[0.68rem] uppercase tracking-[0.24em] text-white/42">
                  Bio
                </span>
                <textarea
                  className="min-h-32 w-full rounded-[1.1rem] border border-white/10 bg-[rgba(7,17,27,0.7)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[var(--color-highlight)]/40"
                  defaultValue={profile.bio ?? ""}
                  name="bio"
                  placeholder="What kind of work are you drawn to?"
                />
              </label>
              <button className="rounded-full bg-[var(--color-highlight)] px-6 py-3 text-sm font-semibold text-[var(--color-bg)]">
                Save viewer profile
              </button>
            </form>
          </div>

          <div className="rounded-[1.8rem] border border-white/8 bg-[rgba(12,20,31,0.72)] p-6">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/42">Submission health</p>
            <div className="mt-4 grid gap-3 text-sm text-white/70 sm:grid-cols-3">
              <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-4">
                {library.submissions.length} submissions
              </div>
              <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-4">
                {library.saved.length} saved films
              </div>
              <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-4">
                {library.claims.length} claim requests
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-white/8 bg-[rgba(12,20,31,0.72)] p-6">
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/42">Creator profile</p>
          {ownedCreator ? (
            <div className="mt-4 grid gap-6">
              <div className={`rounded-[1.8rem] border border-white/8 p-6 ${ownedCreator.heroClassName}`}>
                <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/46">Active public profile</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">{ownedCreator.name}</h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-white/68">{ownedCreator.bio}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    className="rounded-full bg-[var(--color-highlight)] px-5 py-3 text-sm font-semibold text-[var(--color-bg)]"
                    href={`/creators/${ownedCreator.slug}`}
                  >
                    View public profile
                  </Link>
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/68">
                    {ownedCreator.filmsDirected} films
                  </span>
                </div>
              </div>

              <form action={updateCreatorProfile} className="grid gap-4">
                <label className="block">
                  <span className="mb-2 block text-[0.68rem] uppercase tracking-[0.24em] text-white/42">
                    Creator name
                  </span>
                  <input
                    className="w-full rounded-[1.1rem] border border-white/10 bg-[rgba(7,17,27,0.7)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[var(--color-highlight)]/40"
                    defaultValue={ownedCreator.name}
                    name="name"
                    type="text"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[0.68rem] uppercase tracking-[0.24em] text-white/42">
                    Headline
                  </span>
                  <input
                    className="w-full rounded-[1.1rem] border border-white/10 bg-[rgba(7,17,27,0.7)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[var(--color-highlight)]/40"
                    defaultValue={ownedCreator.headline}
                    name="headline"
                    type="text"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[0.68rem] uppercase tracking-[0.24em] text-white/42">
                    Bio
                  </span>
                  <textarea
                    className="min-h-36 w-full rounded-[1.1rem] border border-white/10 bg-[rgba(7,17,27,0.7)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[var(--color-highlight)]/40"
                    defaultValue={ownedCreator.bio}
                    name="bio"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[0.68rem] uppercase tracking-[0.24em] text-white/42">
                    Location
                  </span>
                  <input
                    className="w-full rounded-[1.1rem] border border-white/10 bg-[rgba(7,17,27,0.7)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[var(--color-highlight)]/40"
                    defaultValue={ownedCreator.location}
                    name="location"
                    type="text"
                  />
                </label>
                <button className="rounded-full bg-[var(--color-highlight)] px-6 py-3 text-sm font-semibold text-[var(--color-bg)]">
                  Save creator profile
                </button>
              </form>
            </div>
          ) : (
            <div className="mt-4 grid gap-5">
              <p className="text-sm leading-6 text-white/66">
                Create your public creator page to own your filmography and claim submissions under a
                single identity.
              </p>
              <form action={createCreatorProfile} className="grid gap-4">
                <label className="block">
                  <span className="mb-2 block text-[0.68rem] uppercase tracking-[0.24em] text-white/42">
                    Creator name
                  </span>
                  <input
                    className="w-full rounded-[1.1rem] border border-white/10 bg-[rgba(7,17,27,0.7)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[var(--color-highlight)]/40"
                    name="name"
                    placeholder="Mira Sol"
                    type="text"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[0.68rem] uppercase tracking-[0.24em] text-white/42">
                    Headline
                  </span>
                  <input
                    className="w-full rounded-[1.1rem] border border-white/10 bg-[rgba(7,17,27,0.7)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[var(--color-highlight)]/40"
                    name="headline"
                    placeholder="Slow-burn AI thrillers with digital weather and human fragility."
                    type="text"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[0.68rem] uppercase tracking-[0.24em] text-white/42">
                    Bio
                  </span>
                  <textarea
                    className="min-h-36 w-full rounded-[1.1rem] border border-white/10 bg-[rgba(7,17,27,0.7)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[var(--color-highlight)]/40"
                    name="bio"
                    placeholder="Describe your cinematic practice, themes, and process."
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[0.68rem] uppercase tracking-[0.24em] text-white/42">
                    Location
                  </span>
                  <input
                    className="w-full rounded-[1.1rem] border border-white/10 bg-[rgba(7,17,27,0.7)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[var(--color-highlight)]/40"
                    name="location"
                    placeholder="Kolkata"
                    type="text"
                  />
                </label>
                <button className="rounded-full bg-[var(--color-highlight)] px-6 py-3 text-sm font-semibold text-[var(--color-bg)]">
                  Create creator profile
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

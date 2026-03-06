import Link from "next/link";
import { BookmarkIcon, HeartIcon, LibraryIcon } from "@/components/icons";
import { redirect } from "next/navigation";
import { FilmCard } from "@/components/film-card";
import { getCurrentSessionProfile } from "@/lib/auth";
import { getViewerLibrary } from "@/lib/viewer";

type LibraryPageProps = {
  searchParams: Promise<{ claim?: string }>;
};

const claimMessages: Record<string, string> = {
  sent: "Creator claim request sent. It is now visible to admins for review.",
  "request-failed": "The claim request could not be created.",
};

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    redirect("/login?next=/library");
  }

  const params = await searchParams;
  const library = await getViewerLibrary();
  const claimMessage = params.claim ? claimMessages[params.claim] : null;

  return (
    <main className="mx-auto w-full max-w-[100rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="rounded-[1rem] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02)_34%,rgba(13,13,16,0.98)_74%)] p-6 sm:p-7">
        <p className="text-[0.64rem] uppercase tracking-[0.24em] text-white/40">Library</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">Your shelf</h1>
            <p className="mt-4 max-w-2xl text-[0.92rem] leading-6 text-white/62">
              Saved titles, likes, claims, and submissions in one place.
            </p>
          </div>
          <Link className="sv-btn sv-btn-primary" href="/studio">
            Open creator studio
          </Link>
        </div>
        {claimMessage ? (
          <div className="mt-6 rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/76">
            {claimMessage}
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 py-8 xl:grid-cols-2">
        <div className="sv-surface rounded-[1rem] p-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.22em] text-white/42">
                <BookmarkIcon className="h-3.5 w-3.5" />
                Saved
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Watch later</h2>
            </div>
            <div className="sv-chip">
              {library.saved.length} films
            </div>
          </div>
          <div className="grid gap-4">
            {library.saved.length ? (
              library.saved.map((film) => <FilmCard key={film.id} film={film} emphasis="compact" />)
            ) : (
              <div className="sv-surface-soft rounded-[0.9rem] px-4 py-5 text-sm text-white/60">
                You have not saved any films yet.
              </div>
            )}
          </div>
        </div>

        <div className="sv-surface rounded-[1rem] p-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.22em] text-white/42">
                <HeartIcon className="h-3.5 w-3.5" />
                Liked
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Strong reactions</h2>
            </div>
            <div className="sv-chip">
              {library.liked.length} films
            </div>
          </div>
          <div className="grid gap-4">
            {library.liked.length ? (
              library.liked.map((film) => <FilmCard key={film.id} film={film} emphasis="compact" />)
            ) : (
              <div className="sv-surface-soft rounded-[0.9rem] px-4 py-5 text-sm text-white/60">
                Like a film to keep it in your reaction history.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 py-2 xl:grid-cols-2">
        <div className="sv-surface rounded-[1rem] p-6">
          <p className="inline-flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.22em] text-white/42">
            <LibraryIcon className="h-3.5 w-3.5" />
            Creator claims
          </p>
          <div className="mt-4 grid gap-3">
            {library.claims.length ? (
              library.claims.map((claim) => (
                <div
                  key={claim.id}
                  className="sv-surface-soft flex items-center justify-between rounded-[0.8rem] px-4 py-4 text-sm text-white/72"
                >
                  <div>
                    <p className="text-lg font-medium tracking-[-0.02em] text-white">{claim.creatorName}</p>
                    <p className="text-white/46">{new Date(claim.createdAt).toLocaleDateString("en-US")}</p>
                  </div>
                  <p className="font-mono text-[var(--color-highlight)]">{claim.status}</p>
                </div>
              ))
            ) : (
              <div className="sv-surface-soft rounded-[0.9rem] px-4 py-5 text-sm text-white/60">
                No claim requests yet.
              </div>
            )}
          </div>
        </div>

        <div className="sv-surface rounded-[1rem] p-6">
          <p className="inline-flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.22em] text-white/42">
            <LibraryIcon className="h-3.5 w-3.5" />
            Submissions
          </p>
          <div className="mt-4 grid gap-3">
            {library.submissions.length ? (
              library.submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="sv-surface-soft flex items-center justify-between rounded-[0.8rem] px-4 py-4 text-sm text-white/72"
                >
                  <div>
                    <p className="text-lg font-medium tracking-[-0.02em] text-white">{submission.title}</p>
                    <p className="text-white/46">{new Date(submission.createdAt).toLocaleDateString("en-US")}</p>
                  </div>
                  <p className="font-mono text-[var(--color-highlight)]">{submission.status}</p>
                </div>
              ))
            ) : (
              <div className="sv-surface-soft rounded-[0.9rem] px-4 py-5 text-sm text-white/60">
                No submissions yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

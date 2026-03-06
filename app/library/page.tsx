import Link from "next/link";
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
    <main className="mx-auto w-full max-w-[92rem] px-4 pb-28 pt-6 sm:px-6 lg:px-10">
      <section className="rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(174,187,255,0.12),rgba(255,255,255,0.03)_34%,rgba(8,10,16,0.92)_74%)] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-white/44">Library</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-5xl text-white sm:text-6xl">Your watch shelf</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/68">
              Saved films, liked titles, creator claims, and your submission history in one focused view.
            </p>
          </div>
          <Link
            className="rounded-full bg-[var(--color-highlight)] px-5 py-3 text-sm font-semibold text-[var(--color-bg)]"
            href="/studio"
          >
            Open creator studio
          </Link>
        </div>
        {claimMessage ? (
          <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/6 px-4 py-4 text-sm text-white/76">
            {claimMessage}
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 py-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/42">Saved</p>
              <h2 className="mt-2 font-display text-4xl text-white">Watch later</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/62">
              {library.saved.length} films
            </div>
          </div>
          <div className="grid gap-4">
            {library.saved.length ? (
              library.saved.map((film) => <FilmCard key={film.id} film={film} emphasis="compact" />)
            ) : (
              <div className="rounded-[1.4rem] border border-white/10 bg-white/4 px-4 py-5 text-sm text-white/60">
                You have not saved any films yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/42">Liked</p>
              <h2 className="mt-2 font-display text-4xl text-white">Strong reactions</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/62">
              {library.liked.length} films
            </div>
          </div>
          <div className="grid gap-4">
            {library.liked.length ? (
              library.liked.map((film) => <FilmCard key={film.id} film={film} emphasis="compact" />)
            ) : (
              <div className="rounded-[1.4rem] border border-white/10 bg-white/4 px-4 py-5 text-sm text-white/60">
                Like a film to keep it in your reaction history.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 py-2 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/42">Creator claims</p>
          <div className="mt-4 grid gap-3">
            {library.claims.length ? (
              library.claims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between rounded-[1.35rem] border border-white/10 bg-white/4 px-4 py-4 text-sm text-white/72"
                >
                  <div>
                    <p className="font-display text-2xl text-white">{claim.creatorName}</p>
                    <p className="text-white/46">
                      {new Date(claim.createdAt).toLocaleDateString("en-US")}
                    </p>
                  </div>
                  <p className="font-mono text-[var(--color-highlight)]">{claim.status}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.4rem] border border-white/10 bg-white/4 px-4 py-5 text-sm text-white/60">
                No claim requests yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/42">Submissions</p>
          <div className="mt-4 grid gap-3">
            {library.submissions.length ? (
              library.submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between rounded-[1.35rem] border border-white/10 bg-white/4 px-4 py-4 text-sm text-white/72"
                >
                  <div>
                    <p className="font-display text-2xl text-white">{submission.title}</p>
                    <p className="text-white/46">
                      {new Date(submission.createdAt).toLocaleDateString("en-US")}
                    </p>
                  </div>
                  <p className="font-mono text-[var(--color-highlight)]">{submission.status}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.4rem] border border-white/10 bg-white/4 px-4 py-5 text-sm text-white/60">
                No submissions yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

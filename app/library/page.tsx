import type { Metadata } from "next";
import Link from "next/link";
import { BookmarkIcon, HeartIcon, LibraryIcon } from "@/components/icons";
import { redirect } from "next/navigation";
import { submitAgentDraftSubmission } from "@/app/studio/actions";
import { FilmCard } from "@/components/film-card";
import { Button } from "@/components/ui/button";
import { getCurrentSessionProfile } from "@/lib/auth";
import { getSubmissionRejectionReasonLabel } from "@/lib/submissions";
import { getViewerLibrary } from "@/lib/viewer";

type LibraryPageProps = {
  searchParams: Promise<{ claim?: string; submission?: string }>;
};

export const metadata: Metadata = {
  title: "Library",
  robots: {
    index: false,
    follow: false,
  },
};

const claimMessages: Record<string, string> = {
  sent: "Creator claim request sent. It is now visible to admins for review.",
  "request-failed": "The claim request could not be created.",
  submitted: "Agent draft submitted to moderation.",
  "submit-failed": "That draft could not be sent to moderation.",
};

function statusTone(status: string) {
  switch (status) {
    case "accepted":
    case "approved":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200";
    case "rejected":
      return "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-200";
    default:
      return "border-border/80 bg-muted/50 text-muted-foreground";
  }
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    redirect("/login?next=/library");
  }

  const params = await searchParams;
  const library = await getViewerLibrary();
  const claimMessage = params.claim ? claimMessages[params.claim] : null;
  const pendingClaims = library.claims.filter((claim) => claim.status === "pending").length;
  const pendingSubmissions = library.submissions.filter((submission) => submission.status === "submitted").length;

  return (
    <main className="mx-auto w-full max-w-[100rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="sv-surface rounded-[1rem] p-6 sm:p-7">
        <p className="sv-overline">Library</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">Your shelf</h1>
            <p className="mt-4 max-w-2xl text-[0.92rem] leading-6 text-muted-foreground">
              Saved titles, likes, claims, and submissions in one place.
            </p>
          </div>
          <Button asChild className="sv-btn sv-btn-primary rounded-xl">
            <Link href="/studio">Open creator studio</Link>
          </Button>
        </div>
        {claimMessage ? (
          <div className="mt-6 rounded-[1.2rem] border border-border/80 bg-muted/50 px-4 py-4 text-sm text-foreground/76">
            {claimMessage}
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 pt-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="sv-surface rounded-[1.2rem] px-5 py-5">
          <p className="sv-overline">Saved</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground">{library.saved.length}</p>
          <p className="mt-2 text-sm text-muted-foreground">Your watch-later shelf for long-form AI films.</p>
        </div>
        <div className="sv-surface rounded-[1.2rem] px-5 py-5">
          <p className="sv-overline">Liked</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground">{library.liked.length}</p>
          <p className="mt-2 text-sm text-muted-foreground">Titles you reacted strongly enough to keep nearby.</p>
        </div>
        <div className="sv-surface rounded-[1.2rem] px-5 py-5">
          <p className="sv-overline">Claims pending</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground">{pendingClaims}</p>
          <p className="mt-2 text-sm text-muted-foreground">Creator ownership requests still in review.</p>
        </div>
        <div className="sv-surface rounded-[1.2rem] px-5 py-5">
          <p className="sv-overline">Submissions pending</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground">{pendingSubmissions}</p>
          <p className="mt-2 text-sm text-muted-foreground">Queued titles awaiting acceptance or rejection.</p>
        </div>
      </section>

      <section className="grid gap-6 py-8 xl:grid-cols-2">
        <div className="sv-surface rounded-[1rem] p-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.22em] text-muted-foreground">
                <BookmarkIcon className="h-3.5 w-3.5" />
                Saved
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">Watch later</h2>
            </div>
            <div className="sv-chip">
              {library.saved.length} films
            </div>
          </div>
          <div className="grid gap-4">
            {library.saved.length ? (
              library.saved.map((film) => <FilmCard key={film.id} film={film} emphasis="compact" />)
            ) : (
              <div className="sv-surface-soft rounded-[0.9rem] px-4 py-5 text-sm text-muted-foreground">
                You have not saved any films yet.
              </div>
            )}
          </div>
        </div>

        <div className="sv-surface rounded-[1rem] p-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.22em] text-muted-foreground">
                <HeartIcon className="h-3.5 w-3.5" />
                Liked
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">Strong reactions</h2>
            </div>
            <div className="sv-chip">
              {library.liked.length} films
            </div>
          </div>
          <div className="grid gap-4">
            {library.liked.length ? (
              library.liked.map((film) => <FilmCard key={film.id} film={film} emphasis="compact" />)
            ) : (
              <div className="sv-surface-soft rounded-[0.9rem] px-4 py-5 text-sm text-muted-foreground">
                Like a film to keep it in your reaction history.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 py-2 xl:grid-cols-2">
        <div className="sv-surface rounded-[1rem] p-6">
          <p className="inline-flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.22em] text-muted-foreground">
            <LibraryIcon className="h-3.5 w-3.5" />
            Creator claims
          </p>
          <div className="mt-4 grid gap-3">
            {library.claims.length ? (
              library.claims.map((claim) => (
                <div
                  key={claim.id}
                  className="sv-surface-soft flex items-center justify-between rounded-[0.8rem] px-4 py-4 text-sm text-foreground/72"
                >
                  <div>
                    <p className="text-lg font-medium tracking-[-0.02em] text-foreground">{claim.creatorName}</p>
                    <p className="text-muted-foreground">{new Date(claim.createdAt).toLocaleDateString("en-US")}</p>
                  </div>
                  <p className={`rounded-[999px] border px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] ${statusTone(claim.status)}`}>
                    {claim.status}
                  </p>
                </div>
              ))
            ) : (
              <div className="sv-surface-soft rounded-[0.9rem] px-4 py-5 text-sm text-muted-foreground">
                No claim requests yet.
              </div>
            )}
          </div>
        </div>

        <div className="sv-surface rounded-[1rem] p-6">
          <p className="inline-flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.22em] text-muted-foreground">
            <LibraryIcon className="h-3.5 w-3.5" />
            Submissions
          </p>
          <div className="mt-4 grid gap-3">
            {library.submissions.length ? (
              library.submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="sv-surface-soft rounded-[0.8rem] px-4 py-4 text-sm text-foreground/72"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-medium tracking-[-0.02em] text-foreground">{submission.title}</p>
                      <p className="text-muted-foreground">
                        {new Date(submission.createdAt).toLocaleDateString("en-US")}
                        {submission.agentName ? ` / drafted by ${submission.agentName}` : ""}
                      </p>
                    </div>
                    <p className={`rounded-[999px] border px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] ${statusTone(submission.status)}`}>
                      {submission.status}
                    </p>
                  </div>
                  {submission.status === "draft" && submission.agentName ? (
                    <form action={submitAgentDraftSubmission.bind(null, submission.id)} className="mt-4 flex flex-wrap gap-2">
                      <input name="redirectTo" type="hidden" value="/library" />
                      <button className="sv-btn sv-btn-primary">Submit to moderation</button>
                      <span className="sv-chip">Human approval required</span>
                    </form>
                  ) : null}
                  {submission.rejectionReason ? (
                    <div className="mt-4 rounded-[0.8rem] border border-border/80 bg-background/65 px-4 py-4">
                      <p className="sv-overline">Moderator feedback</p>
                      <p className="mt-2 text-foreground">
                        {getSubmissionRejectionReasonLabel(submission.rejectionReason)}
                      </p>
                      {submission.rejectionDetails ? (
                        <p className="mt-2 leading-6 text-muted-foreground">{submission.rejectionDetails}</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="sv-surface-soft rounded-[0.9rem] px-4 py-5 text-sm text-muted-foreground">
                No submissions yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

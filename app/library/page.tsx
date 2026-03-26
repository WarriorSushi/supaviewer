import type { Metadata } from "next";
import Link from "next/link";
import { BookmarkIcon, HeartIcon, LibraryIcon } from "@/components/icons";
import { redirect } from "next/navigation";
import { submitAgentDraftSubmission } from "@/app/studio/actions";
import { FilmCard } from "@/components/film-card";
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
      return "border-[oklch(0.72_0.14_55_/_20%)] bg-[oklch(0.72_0.14_55_/_6%)] text-foreground";
    case "rejected":
      return "border-[oklch(0.72_0.14_55_/_30%)] bg-[oklch(0.72_0.14_55_/_8%)] text-muted-foreground";
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
    <main className="mx-auto w-full max-w-[96rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="rounded-xl border border-border/50 bg-card p-6 sm:p-7 sv-animate-in">
        <p className="sv-overline">Library</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="sv-display">Your shelf</h1>
            <p className="sv-body mt-4 max-w-2xl">
              Saved titles, likes, claims, and submissions in one place.
            </p>
          </div>
          <Link href="/studio" className="sv-btn sv-btn-primary">
            Open creator studio
          </Link>
        </div>
        {claimMessage ? (
          <div className="mt-6 rounded-xl border border-[oklch(0.72_0.14_55_/_20%)] bg-[oklch(0.72_0.14_55_/_6%)] px-4 py-4 text-sm text-foreground">
            {claimMessage}
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 pt-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border/50 bg-card/60 px-5 py-5 sv-animate-in sv-stagger-1">
          <p className="sv-overline">Saved</p>
          <p className="mt-3 font-display text-3xl font-medium text-foreground">{library.saved.length}</p>
          <p className="sv-body-sm mt-2">Your watch-later shelf for long-form AI films.</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/60 px-5 py-5 sv-animate-in sv-stagger-2">
          <p className="sv-overline">Liked</p>
          <p className="mt-3 font-display text-3xl font-medium text-foreground">{library.liked.length}</p>
          <p className="sv-body-sm mt-2">Titles you reacted strongly enough to keep nearby.</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/60 px-5 py-5 sv-animate-in sv-stagger-3">
          <p className="sv-overline">Claims pending</p>
          <p className="mt-3 font-display text-3xl font-medium text-foreground">{pendingClaims}</p>
          <p className="sv-body-sm mt-2">Creator ownership requests still in review.</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/60 px-5 py-5 sv-animate-in sv-stagger-4">
          <p className="sv-overline">Submissions pending</p>
          <p className="mt-3 font-display text-3xl font-medium text-foreground">{pendingSubmissions}</p>
          <p className="sv-body-sm mt-2">Queued titles awaiting acceptance or rejection.</p>
        </div>
      </section>

      <section className="grid gap-6 py-8 xl:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-card p-6 sv-animate-in sv-stagger-2">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 sv-overline">
                <BookmarkIcon className="h-3.5 w-3.5" />
                Saved
              </p>
              <h2 className="mt-2 font-display text-2xl font-medium text-foreground">Watch later</h2>
            </div>
            <div className="sv-chip">
              {library.saved.length} films
            </div>
          </div>
          <div className="grid gap-4">
            {library.saved.length ? (
              library.saved.map((film) => <FilmCard key={film.id} film={film} emphasis="compact" />)
            ) : (
              <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-5 text-sm text-muted-foreground">
                You have not saved any films yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 sv-animate-in sv-stagger-3">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 sv-overline">
                <HeartIcon className="h-3.5 w-3.5" />
                Liked
              </p>
              <h2 className="mt-2 font-display text-2xl font-medium text-foreground">Strong reactions</h2>
            </div>
            <div className="sv-chip">
              {library.liked.length} films
            </div>
          </div>
          <div className="grid gap-4">
            {library.liked.length ? (
              library.liked.map((film) => <FilmCard key={film.id} film={film} emphasis="compact" />)
            ) : (
              <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-5 text-sm text-muted-foreground">
                Like a film to keep it in your reaction history.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 py-2 xl:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-card p-6 sv-animate-in sv-stagger-4">
          <p className="inline-flex items-center gap-2 sv-overline">
            <LibraryIcon className="h-3.5 w-3.5" />
            Creator claims
          </p>
          <div className="mt-4 grid gap-3">
            {library.claims.length ? (
              library.claims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between rounded-xl border border-border/50 bg-card/60 px-4 py-4 text-sm"
                >
                  <div>
                    <p className="text-lg font-medium tracking-[-0.02em] text-foreground">{claim.creatorName}</p>
                    <p className="text-muted-foreground">{new Date(claim.createdAt).toLocaleDateString("en-US")}</p>
                  </div>
                  <p className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] ${statusTone(claim.status)}`}>
                    {claim.status}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-5 text-sm text-muted-foreground">
                No claim requests yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 sv-animate-in sv-stagger-5">
          <p className="inline-flex items-center gap-2 sv-overline">
            <LibraryIcon className="h-3.5 w-3.5" />
            Submissions
          </p>
          <div className="mt-4 grid gap-3">
            {library.submissions.length ? (
              library.submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="rounded-xl border border-border/50 bg-card/60 px-4 py-4 text-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-medium tracking-[-0.02em] text-foreground">{submission.title}</p>
                      <p className="text-muted-foreground">
                        {new Date(submission.createdAt).toLocaleDateString("en-US")}
                        {submission.agentName ? ` / drafted by ${submission.agentName}` : ""}
                      </p>
                    </div>
                    <p className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] ${statusTone(submission.status)}`}>
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
                    <div className="mt-4 rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                      <p className="sv-overline">Moderator feedback</p>
                      <p className="mt-2 text-foreground">
                        {getSubmissionRejectionReasonLabel(submission.rejectionReason)}
                      </p>
                      {submission.rejectionDetails ? (
                        <p className="sv-body mt-2">{submission.rejectionDetails}</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-5 text-sm text-muted-foreground">
                No submissions yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

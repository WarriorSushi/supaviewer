import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createCreatorProfile,
  submitAgentDraftSubmission,
  updateCreatorProfile,
  updateViewerProfile,
} from "@/app/studio/actions";
import { ShareButton } from "@/components/share-button";
import { StudioAgentPanel } from "@/components/studio-agent-panel";
import { StudioWatchEventsPanel } from "@/components/studio-watch-events-panel";
import { StatusPill } from "@/components/status-pill";
import { TrophyStrip } from "@/components/trophy-strip";
import { getOwnedAgents } from "@/lib/agents";
import { getCurrentSessionProfile } from "@/lib/auth";
import { getCreatorStudioAnalytics } from "@/lib/creator-analytics";
import { buildCreatorHref, getCreators } from "@/lib/catalog";
import { getSubmissionRejectionReasonLabel } from "@/lib/submissions";
import { getViewerLibrary } from "@/lib/viewer";
import { getCreatorWatchEventStudioData } from "@/lib/watch-events";

type StudioPageProps = {
  searchParams: Promise<{
    created?: string;
    error?: string;
    profile?: string;
    creator?: string;
    submission?: string;
    watchEvent?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Studio",
  robots: {
    index: false,
    follow: false,
  },
};

const studioErrors: Record<string, string> = {
  "missing-fields": "Fill in the creator profile fields before creating your studio profile.",
  "create-failed": "The creator profile could not be created. The name or slug may already be taken.",
  "profile-missing-fields": "Display name is required.",
  "profile-update-failed": "Your viewer profile could not be updated.",
  "creator-missing-fields": "Complete all creator profile fields before saving.",
  "creator-not-found": "No owned creator profile was found for this account.",
  "creator-update-failed": "The creator profile could not be updated.",
  "submit-failed": "That draft could not be sent to moderation.",
  "watch-event-invalid": "Complete the launch-party form with a title, film, notes, and valid start time.",
  "watch-event-no-creator": "Create or claim your creator profile before scheduling a launch party.",
  "watch-event-film": "Pick one of your own accepted films for the lounge.",
  "watch-event-agent": "The selected official companion agent is not valid for this account.",
  "watch-event-failed": "That launch party could not be scheduled.",
  "watch-event-update-failed": "That lounge update could not be saved.",
};

export default async function StudioPage({ searchParams }: StudioPageProps) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    redirect("/login?next=/studio");
  }

  const params = await searchParams;
  const [creators, library, ownedAgents] = await Promise.all([
    getCreators(),
    getViewerLibrary(),
    getOwnedAgents(profile.id),
  ]);
  const ownedCreator = creators.find((creator) => creator.ownerProfileId === profile.id) ?? null;
  const [creatorAnalytics, watchEventStudioData] = await Promise.all([
    ownedCreator ? getCreatorStudioAnalytics(ownedCreator.id) : Promise.resolve(null),
    getCreatorWatchEventStudioData(profile.id, ownedCreator?.id ?? null),
  ]);
  const successMessage =
    params.created === "1"
      ? "Creator profile created. You can now shape your public identity on Supaviewer."
      : params.profile === "updated"
        ? "Viewer profile updated."
        : params.creator === "updated"
          ? "Creator profile updated."
          : params.submission === "submitted"
            ? "Agent draft submitted to moderation. It is now in the human review queue."
            : params.watchEvent === "scheduled"
              ? "Launch party scheduled. The canonical lounge URL is ready to share."
              : params.watchEvent === "updated"
                ? "Launch party updated."
                : params.watchEvent === "started"
                  ? "Launch party is live now."
                  : params.watchEvent === "ended"
                    ? "Launch party marked ended."
                    : params.watchEvent === "cancelled"
                      ? "Launch party cancelled."
            : null;
  const error = params.error
    ? studioErrors[params.error]
    : params.submission === "submit-failed"
      ? studioErrors["submit-failed"]
      : null;
  const pendingSubmissions = library.submissions.filter((submission) => submission.status === "submitted").length;
  const acceptedSubmissions = library.submissions.filter((submission) => submission.status === "accepted").length;
  const claimInReview = library.claims.filter((claim) => claim.status === "pending").length;

  return (
    <main className="mx-auto w-full max-w-[96rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="rounded-xl border border-border/50 bg-card p-6 sm:p-8 sv-animate-in">
        <p className="sv-overline">Creator studio</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-4xl font-medium text-foreground sm:text-5xl">
              Manage your identity and editorial surface.
            </h1>
            <p className="sv-body mt-4 max-w-2xl">
              Keep your viewer profile, creator page, submission history, and watch shelf aligned in
              one place.
            </p>
          </div>
          <Link
            className="sv-btn sv-btn-secondary"
            href="/library"
          >
            Open library
          </Link>
        </div>
        {successMessage ? (
          <div className="mt-6 rounded-xl border border-[oklch(0.72_0.14_55_/_20%)] bg-[oklch(0.72_0.14_55_/_6%)] px-4 py-4 text-sm text-foreground">
            {successMessage}
          </div>
        ) : null}
        {error ? (
          <div className="mt-4 rounded-xl border border-[oklch(0.72_0.14_55_/_30%)] bg-[oklch(0.72_0.14_55_/_8%)] px-4 py-4 text-sm text-foreground">
            {error}
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 pt-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border/50 bg-card/60 px-5 py-5 sv-animate-in sv-stagger-1">
          <p className="sv-overline">Pending review</p>
          <p className="mt-3 font-display text-3xl font-medium text-foreground">{pendingSubmissions}</p>
          <p className="sv-body-sm mt-2">Submissions waiting on moderation.</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/60 px-5 py-5 sv-animate-in sv-stagger-2">
          <p className="sv-overline">Accepted</p>
          <p className="mt-3 font-display text-3xl font-medium text-foreground">{acceptedSubmissions}</p>
          <p className="sv-body-sm mt-2">Titles already pushed into the catalog.</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/60 px-5 py-5 sv-animate-in sv-stagger-3">
          <p className="sv-overline">Saved shelf</p>
          <p className="mt-3 font-display text-3xl font-medium text-foreground">{library.saved.length}</p>
          <p className="sv-body-sm mt-2">Films you want to revisit or reference.</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/60 px-5 py-5 sv-animate-in sv-stagger-4">
          <p className="sv-overline">Claims in review</p>
          <p className="mt-3 font-display text-3xl font-medium text-foreground">{claimInReview}</p>
          <p className="sv-body-sm mt-2">Creator identity requests awaiting admin review.</p>
        </div>
      </section>

      <section className="grid gap-6 py-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="grid gap-6">
          <div className="rounded-xl border border-border/50 bg-card p-6 sv-animate-in sv-stagger-2">
            <p className="sv-overline">Viewer profile</p>
            <form action={updateViewerProfile} className="mt-5 grid gap-4">
              <label className="block">
                <span className="sv-field-label">Display name</span>
                <input
                  className="sv-input"
                  defaultValue={profile.displayName}
                  name="displayName"
                  placeholder="Your name"
                  type="text"
                />
              </label>
              <label className="block">
                <span className="sv-field-label">Bio</span>
                <textarea
                  className="sv-textarea min-h-32"
                  defaultValue={profile.bio ?? ""}
                  name="bio"
                  placeholder="What kind of work are you drawn to?"
                />
              </label>
              <button className="sv-btn sv-btn-primary w-full sm:w-auto">
                Save viewer profile
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-6 sv-animate-in sv-stagger-3">
            <p className="sv-overline">Submission health</p>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                {library.submissions.length} submissions
              </div>
              <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                {library.saved.length} saved films
              </div>
              <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                {library.claims.length} claim requests
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-6 sv-animate-in sv-stagger-4">
            <p className="sv-overline">Submission queue</p>
            <div className="mt-4 grid gap-3">
              {library.submissions.length ? (
                library.submissions.map((submission) => {
                  const rejectionLabel = getSubmissionRejectionReasonLabel(submission.rejectionReason);

                  return (
                    <div key={submission.id} className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-medium tracking-[-0.02em] text-foreground">{submission.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {new Date(submission.createdAt).toLocaleDateString("en-US")}
                            {submission.agentName ? ` / drafted by ${submission.agentName}` : ""}
                          </p>
                        </div>
                        <span className="sv-chip">{submission.status}</span>
                      </div>
                      {submission.status === "draft" && submission.agentName ? (
                        <form action={submitAgentDraftSubmission.bind(null, submission.id)} className="mt-4 flex flex-wrap gap-2">
                          <input name="redirectTo" type="hidden" value="/studio" />
                          <button className="sv-btn sv-btn-primary">Submit to moderation</button>
                          <span className="sv-chip">Human approval required before the queue</span>
                        </form>
                      ) : null}
                      {rejectionLabel ? (
                        <div className="mt-4 rounded-xl border border-border/50 bg-card/60 px-4 py-4 text-sm text-muted-foreground">
                          <p className="sv-overline">Moderator feedback</p>
                          <p className="mt-2 text-foreground">{rejectionLabel}</p>
                          {submission.rejectionDetails ? (
                            <p className="sv-body mt-2">{submission.rejectionDetails}</p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-5 text-sm text-muted-foreground">
                  No submissions yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-6 sv-animate-in sv-stagger-5">
            <p className="sv-overline">Next moves</p>
            <div className="mt-4 grid gap-3 sv-body-sm">
              <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                Keep your public creator bio sharp. It shapes trust when someone lands from a shared film link.
              </div>
              <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                Submit only embeddable, rights-safe YouTube sources so moderation stays fast and approvals stay clean.
              </div>
              <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                Early accepted titles lock permanent serial numbers. That is the public collectible layer.
              </div>
              <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                Your Supaviewer URL should be the status object you share in decks, ads, and launch posts.
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 sv-animate-in sv-stagger-3">
          <p className="sv-overline">Creator profile</p>
          {ownedCreator ? (
            <div className="mt-4 grid gap-6">
              <div className="rounded-xl border border-border/50 bg-card/60 p-6">
                <p className="sv-overline">Active public profile</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusPill badge={ownedCreator.founderBadge} />
                  {ownedCreator.trophies.slice(0, 2).map((trophy) => (
                    <StatusPill key={`${ownedCreator.slug}-${trophy.slug}`} trophy={trophy} />
                  ))}
                </div>
                <h2 className="mt-3 font-display text-3xl font-medium text-foreground">{ownedCreator.name}</h2>
                <p className="sv-body mt-3 max-w-2xl">{ownedCreator.bio}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    className="sv-btn sv-btn-primary"
                    href={`/creators/${ownedCreator.slug}`}
                  >
                    View public profile
                  </Link>
                  <span className="sv-chip min-h-[44px] px-4 py-3 text-sm">
                    {ownedCreator.filmsDirected} films
                  </span>
                  <ShareButton
                    analyticsTarget={{ creatorId: ownedCreator.id, surface: "studio-profile" }}
                    className="sv-btn sv-btn-secondary w-full sm:w-auto"
                    label="Share profile"
                    path={buildCreatorHref(ownedCreator)}
                    title={`${ownedCreator.name} on Supaviewer`}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border/50 bg-card/60 px-5 py-5">
                  <p className="sv-overline">Bragging rights</p>
                  <p className="mt-3 font-display text-2xl font-medium text-foreground">
                    {ownedCreator.earliestSerial ? `#${ownedCreator.earliestSerial}` : "Pending"}
                  </p>
                  <p className="sv-body-sm mt-2">
                    Earliest accepted serial on your creator page.
                  </p>
                </div>
                <div className="rounded-xl border border-border/50 bg-card/60 px-5 py-5">
                  <p className="sv-overline">Trophies</p>
                  <div className="mt-3">
                    <TrophyStrip emptyLabel="No trophies yet. Earn or get featured to create the first one." trophies={ownedCreator.trophies} />
                  </div>
                </div>
              </div>

              {creatorAnalytics ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl border border-border/50 bg-card/60 px-5 py-5">
                    <p className="sv-overline">Saves</p>
                    <p className="mt-3 font-display text-2xl font-medium text-foreground">{creatorAnalytics.totalSaves}</p>
                    <p className="sv-body-sm mt-2">Signals across your public filmography.</p>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-card/60 px-5 py-5">
                    <p className="sv-overline">Discussion</p>
                    <p className="mt-3 font-display text-2xl font-medium text-foreground">{creatorAnalytics.totalDiscussion}</p>
                    <p className="sv-body-sm mt-2">Public comments attached to your accepted titles.</p>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-card/60 px-5 py-5">
                    <p className="sv-overline">Shares tracked</p>
                    <p className="mt-3 font-display text-2xl font-medium text-foreground">{creatorAnalytics.totalShares}</p>
                    <p className="sv-body-sm mt-2">Creator-page and film-page share actions captured in product.</p>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-card/60 px-5 py-5">
                    <p className="sv-overline">Collection placements</p>
                    <p className="mt-3 font-display text-2xl font-medium text-foreground">{creatorAnalytics.collectionPlacements}</p>
                    <p className="sv-body-sm mt-2">Editorial placements helping discovery beyond source hosting.</p>
                  </div>
                </div>
              ) : null}

              {creatorAnalytics ? (
                <div className="rounded-xl border border-border/50 bg-card/60 px-5 py-5">
                  <p className="sv-overline">Creator analytics</p>
                  <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                    <div>
                      Earliest serial percentile:{" "}
                      <span className="text-foreground">
                        {creatorAnalytics.serialPercentile ? `top ${creatorAnalytics.serialPercentile}% early` : "Pending"}
                      </span>
                    </div>
                    <div>
                      Total views: <span className="text-foreground">{creatorAnalytics.totalViews}</span>
                    </div>
                    <div>
                      Top shared title:{" "}
                      <span className="text-foreground">
                        {creatorAnalytics.topSharedFilmTitle
                          ? `${creatorAnalytics.topSharedFilmTitle} (${creatorAnalytics.topSharedFilmShares})`
                          : "No share leader yet"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="rounded-xl border border-border/50 bg-card/60 px-5 py-5">
                <p className="sv-overline">Why Supaviewer matters</p>
                <div className="mt-4 grid gap-3 sv-body-sm">
                  <div>Permanent serials make your release legible as part of the early AI-film canon.</div>
                  <div>Founder badges and trophies make your creator page inherently more shareable than the source upload page.</div>
                  <div>Canonical Supaviewer URLs preserve art context, discovery context, and status in one place.</div>
                </div>
              </div>

              <form action={updateCreatorProfile} className="grid gap-4">
                <label className="block">
                  <span className="sv-field-label">Creator name</span>
                  <input
                    className="sv-input"
                    defaultValue={ownedCreator.name}
                    name="name"
                    type="text"
                  />
                </label>
                <label className="block">
                  <span className="sv-field-label">Headline</span>
                  <input
                    className="sv-input"
                    defaultValue={ownedCreator.headline}
                    name="headline"
                    type="text"
                  />
                </label>
                <label className="block">
                  <span className="sv-field-label">Bio</span>
                  <textarea
                    className="sv-textarea min-h-36"
                    defaultValue={ownedCreator.bio}
                    name="bio"
                  />
                </label>
                <label className="block">
                  <span className="sv-field-label">Location</span>
                  <input
                    className="sv-input"
                    defaultValue={ownedCreator.location}
                    name="location"
                    type="text"
                  />
                </label>
                <button className="sv-btn sv-btn-primary w-full sm:w-auto">
                  Save creator profile
                </button>
              </form>
            </div>
          ) : (
            <div className="mt-4 grid gap-5">
              <p className="sv-body">
                Create your public creator page to own your filmography and claim submissions under a
                single identity.
              </p>
              <form action={createCreatorProfile} className="grid gap-4">
                <label className="block">
                  <span className="sv-field-label">Creator name</span>
                  <input
                    className="sv-input"
                    name="name"
                    placeholder="Mira Sol"
                    type="text"
                  />
                </label>
                <label className="block">
                  <span className="sv-field-label">Headline</span>
                  <input
                    className="sv-input"
                    name="headline"
                    placeholder="Slow-burn AI thrillers with digital weather and human fragility."
                    type="text"
                  />
                </label>
                <label className="block">
                  <span className="sv-field-label">Bio</span>
                  <textarea
                    className="sv-textarea min-h-36"
                    name="bio"
                    placeholder="Describe your cinematic practice, themes, and process."
                  />
                </label>
                <label className="block">
                  <span className="sv-field-label">Location</span>
                  <input
                    className="sv-input"
                    name="location"
                    placeholder="Kolkata"
                    type="text"
                  />
                </label>
                <button className="sv-btn sv-btn-primary w-full sm:w-auto">
                  Create creator profile
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      <section className="pb-8">
        <StudioWatchEventsPanel
          acceptedFilms={watchEventStudioData.acceptedFilms}
          canSchedule={Boolean(ownedCreator && watchEventStudioData.acceptedFilms.length)}
          events={watchEventStudioData.events}
          officialAgents={ownedAgents.filter((agent) => agent.isOfficialCreatorAgent).map((agent) => ({
            id: agent.id,
            name: agent.name,
            slug: agent.slug,
            trustLevel: agent.trustLevel,
            isOfficialCreatorAgent: agent.isOfficialCreatorAgent,
          }))}
        />
      </section>

      <section className="pb-8">
        <StudioAgentPanel agents={ownedAgents} watchEvents={watchEventStudioData.events} />
      </section>
    </main>
  );
}

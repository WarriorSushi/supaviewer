import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  approveSubmission,
  bulkApproveSubmissions,
  bulkDeleteComments,
  bulkRejectSubmissions,
  deleteComment,
  rejectSubmission,
  updateAgentModeration,
  updateCreatorTrophies,
  updateFilmEditorial,
  updateFilmTrophies,
} from "@/app/admin/actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import {
  approveCreatorClaim,
  bootstrapAdmin,
  rejectCreatorClaim,
} from "@/app/studio/actions";
import { getCurrentSessionProfile } from "@/lib/auth";
import { buildFilmHref } from "@/lib/catalog";
import { submissionRejectionReasons } from "@/lib/submissions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  buildWatchEventHref,
  getPublicWatchEvents,
  getWatchEventStatusLabel,
} from "@/lib/watch-events";

const visibilityOptions = ["public", "limited", "hidden", "removed"] as const;
const activityStatuses = ["all", "resolved", "open"] as const;
const SUBMISSIONS_PAGE_SIZE = 8;
const COMMENTS_PAGE_SIZE = 8;
const ACTIVITY_PAGE_SIZE = 10;

type AdminPageProps = {
  searchParams: Promise<{
    activityType?: string;
    activityStatus?: string;
    submissionsPage?: string;
    commentsPage?: string;
    activityPage?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const { user, profile } = await getCurrentSessionProfile();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const submissionsPage = Math.max(1, Number.parseInt(params.submissionsPage ?? "1", 10) || 1);
  const commentsPage = Math.max(1, Number.parseInt(params.commentsPage ?? "1", 10) || 1);
  const activityPage = Math.max(1, Number.parseInt(params.activityPage ?? "1", 10) || 1);

  const supabase = createSupabaseAdminClient();
  const moderationActivityQuery = supabase
    .from("moderation_cases")
    .select("id, case_type, reason, status, notes, created_at, actor_profile_id, film_id, submission_id")
    .order("created_at", { ascending: false })
    .range((activityPage - 1) * ACTIVITY_PAGE_SIZE, activityPage * ACTIVITY_PAGE_SIZE - 1);

  const moderationActivityCountQuery = supabase
    .from("moderation_cases")
    .select("*", { count: "exact", head: true });

  if (params.activityType && params.activityType !== "all") {
    moderationActivityQuery.eq("case_type", params.activityType);
    moderationActivityCountQuery.eq("case_type", params.activityType);
  }

  if (params.activityStatus && params.activityStatus !== "all") {
    moderationActivityQuery.eq("status", params.activityStatus);
    moderationActivityCountQuery.eq("status", params.activityStatus);
  }

  const [
    { count: adminCount },
    submissionsCountResult,
    submissionsResult,
    claimsResult,
    filmsResult,
    commentsResult,
    moderationCasesResult,
    moderationCasesCountResult,
    filmCountResult,
    removedCountResult,
    creatorCountResult,
    commentCountResult,
    trophyDefinitionsResult,
    managedCreatorsResult,
    collectionsResult,
    managedAgentsResult,
    agentCurationsResult,
    agentReputationResult,
    agentReviewStateResult,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
    supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "submitted"),
    supabase
      .from("submissions")
      .select("id, proposed_title, status, created_at, profile_id, profiles (display_name)")
      .eq("status", "submitted")
      .order("created_at", { ascending: false })
      .range((submissionsPage - 1) * SUBMISSIONS_PAGE_SIZE, submissionsPage * SUBMISSIONS_PAGE_SIZE - 1),
    supabase
      .from("creator_claim_requests")
      .select("id, profile_id, status, created_at, creators (id, name), profiles (display_name)")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("films")
      .select("id, serial_number, title, visibility, featured_weight, availability_note")
      .order("serial_number", { ascending: false })
      .limit(10),
    supabase
      .from("comments")
      .select("id, body, created_at, profiles (display_name), films (serial_number, slug, title)")
      .order("created_at", { ascending: false })
      .range((commentsPage - 1) * COMMENTS_PAGE_SIZE, commentsPage * COMMENTS_PAGE_SIZE - 1),
    moderationActivityQuery,
    moderationActivityCountQuery,
    supabase.from("films").select("*", { count: "exact", head: true }).in("visibility", ["public", "limited"]),
    supabase.from("films").select("*", { count: "exact", head: true }).eq("visibility", "removed"),
    supabase.from("creators").select("*", { count: "exact", head: true }),
    supabase.from("comments").select("*", { count: "exact", head: true }),
    supabase
      .from("trophy_definitions")
      .select("id, slug, name, target_type, assignment_type")
      .eq("assignment_type", "manual")
      .order("sort_order", { ascending: true }),
    supabase
      .from("creators")
      .select("id, slug, name, followers_count")
      .order("followers_count", { ascending: false })
      .limit(8),
    supabase.from("collections").select("id, slug, name").order("name"),
    supabase
      .from("agents")
      .select("id, slug, name, trust_level, status, is_official_creator_agent, creator_id, creators (name, slug)")
      .order("created_at", { ascending: false })
      .limit(12),
    supabase.from("agent_collection_curations").select("agent_id, collection_id"),
    supabase
      .from("agent_reputation_summary")
      .select(
        "agent_id, total_drafts, accepted_drafts, rejected_drafts, submitted_drafts, public_reply_count, reaction_count, run_count, last_successful_run_at, accepted_draft_rate, rejected_draft_rate",
      ),
    supabase
      .from("agent_action_reviews")
      .select("agent_id, action_type, status, note, requested_at, reviewed_at"),
  ]);

  if (submissionsResult.error) {
    throw new Error(`Failed to load admin queue: ${submissionsResult.error.message}`);
  }

  if (submissionsCountResult.error) {
    throw new Error(`Failed to count pending submissions: ${submissionsCountResult.error.message}`);
  }

  if (claimsResult.error) {
    throw new Error(`Failed to load claim queue: ${claimsResult.error.message}`);
  }

  if (filmsResult.error) {
    throw new Error(`Failed to load film controls: ${filmsResult.error.message}`);
  }

  if (commentsResult.error) {
    throw new Error(`Failed to load comments moderation queue: ${commentsResult.error.message}`);
  }

  if (moderationCasesResult.error) {
    throw new Error(`Failed to load moderation activity: ${moderationCasesResult.error.message}`);
  }

  if (moderationCasesCountResult.error) {
    throw new Error(`Failed to count moderation activity: ${moderationCasesCountResult.error.message}`);
  }

  if (trophyDefinitionsResult.error) {
    throw new Error(`Failed to load trophy definitions: ${trophyDefinitionsResult.error.message}`);
  }

  if (managedCreatorsResult.error) {
    throw new Error(`Failed to load creators for trophy controls: ${managedCreatorsResult.error.message}`);
  }

  if (collectionsResult.error) {
    throw new Error(`Failed to load collections for agent curations: ${collectionsResult.error.message}`);
  }

  if (managedAgentsResult.error) {
    throw new Error(`Failed to load agents for admin controls: ${managedAgentsResult.error.message}`);
  }

  if (agentCurationsResult.error) {
    throw new Error(`Failed to load agent curations: ${agentCurationsResult.error.message}`);
  }

  if (agentReputationResult.error) {
    throw new Error(`Failed to load agent reputation: ${agentReputationResult.error.message}`);
  }

  if (agentReviewStateResult.error) {
    throw new Error(`Failed to load agent review state: ${agentReviewStateResult.error.message}`);
  }

  const watchRooms = await getPublicWatchEvents(6);

  const queuedSubmissions = submissionsResult.data ?? [];
  const claimRequests = claimsResult.data ?? [];
  const managedFilms = filmsResult.data ?? [];
  const managedCreators = managedCreatorsResult.data ?? [];
  const collections = collectionsResult.data ?? [];
  const managedAgents = managedAgentsResult.data ?? [];
  const recentComments = commentsResult.data ?? [];
  const moderationCases = moderationCasesResult.data ?? [];
  const filmTrophyDefinitions = (trophyDefinitionsResult.data ?? []).filter(
    (definition) => definition.target_type === "film",
  );
  const creatorTrophyDefinitions = (trophyDefinitionsResult.data ?? []).filter(
    (definition) => definition.target_type === "creator",
  );
  const manualTrophyDefinitionIds = (trophyDefinitionsResult.data ?? []).map(
    (definition) => definition.id as string,
  );
  const activityTypes = ["all", ...new Set(moderationCases.map((entry) => entry.case_type as string))];
  const totalSubmissionPages = Math.max(
    1,
    Math.ceil((submissionsCountResult.count ?? queuedSubmissions.length) / SUBMISSIONS_PAGE_SIZE),
  );
  const totalCommentPages = Math.max(
    1,
    Math.ceil((commentCountResult.count ?? recentComments.length) / COMMENTS_PAGE_SIZE),
  );
  const totalActivityPages = Math.max(
    1,
    Math.ceil((moderationCasesCountResult.count ?? moderationCases.length) / ACTIVITY_PAGE_SIZE),
  );
  const moderationActorIds = [...new Set(moderationCases.map((entry) => entry.actor_profile_id).filter(Boolean))];
  const moderationFilmIds = [...new Set(moderationCases.map((entry) => entry.film_id).filter(Boolean))];
  const moderationSubmissionIds = [
    ...new Set(moderationCases.map((entry) => entry.submission_id).filter(Boolean)),
  ];

  const trophyAssignmentsResult = manualTrophyDefinitionIds.length
    ? await supabase
        .from("trophy_assignments")
        .select("film_id, creator_id, trophy_definition_id")
        .in("trophy_definition_id", manualTrophyDefinitionIds)
    : { data: [], error: null };

  if (trophyAssignmentsResult.error) {
    throw new Error(`Failed to load trophy assignments: ${trophyAssignmentsResult.error.message}`);
  }

  const [actorNames, moderationFilms, moderationSubmissions] = await Promise.all([
    moderationActorIds.length
      ? supabase.from("profiles").select("id, display_name").in("id", moderationActorIds)
      : Promise.resolve({ data: [], error: null }),
    moderationFilmIds.length
      ? supabase.from("films").select("id, serial_number, title").in("id", moderationFilmIds)
      : Promise.resolve({ data: [], error: null }),
    moderationSubmissionIds.length
      ? supabase.from("submissions").select("id, proposed_title").in("id", moderationSubmissionIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (actorNames.error) {
    throw new Error(`Failed to load moderation actors: ${actorNames.error.message}`);
  }

  if (moderationFilms.error) {
    throw new Error(`Failed to load moderation film references: ${moderationFilms.error.message}`);
  }

  if (moderationSubmissions.error) {
    throw new Error(`Failed to load moderation submission references: ${moderationSubmissions.error.message}`);
  }

  const actorMap = new Map((actorNames.data ?? []).map((entry) => [entry.id as string, entry.display_name as string]));
  const filmMap = new Map(
    (moderationFilms.data ?? []).map((entry) => [
      entry.id as string,
      {
        serialNumber: entry.serial_number as number,
        title: entry.title as string,
      },
    ]),
  );
  const submissionMap = new Map(
    (moderationSubmissions.data ?? []).map((entry) => [entry.id as string, entry.proposed_title as string]),
  );
  const filmTrophyAssignmentMap = new Map<string, Set<string>>();
  const creatorTrophyAssignmentMap = new Map<string, Set<string>>();
  const agentCurationMap = new Map<string, Set<string>>();
  const agentReputationMap = new Map<
    string,
    {
      totalDrafts: number;
      acceptedDrafts: number;
      rejectedDrafts: number;
      submittedDrafts: number;
      publicReplyCount: number;
      reactionCount: number;
      runCount: number;
      lastSuccessfulRunAt: string | null;
      acceptedDraftRate: number | null;
      rejectedDraftRate: number | null;
    }
  >();
  const agentReviewStateMap = new Map<
    string,
    Record<
      "comment" | "react",
      {
        status: "none" | "pending" | "approved" | "rejected";
        note: string | null;
        requestedAt: string | null;
        reviewedAt: string | null;
      }
    >
  >();

  for (const assignment of trophyAssignmentsResult.data ?? []) {
    if (assignment.film_id) {
      filmTrophyAssignmentMap.set(
        assignment.film_id as string,
        new Set([...(filmTrophyAssignmentMap.get(assignment.film_id as string) ?? []), assignment.trophy_definition_id as string]),
      );
    }

    if (assignment.creator_id) {
      creatorTrophyAssignmentMap.set(
        assignment.creator_id as string,
        new Set([...(creatorTrophyAssignmentMap.get(assignment.creator_id as string) ?? []), assignment.trophy_definition_id as string]),
      );
    }
  }

  for (const curation of agentCurationsResult.data ?? []) {
    const agentId = curation.agent_id as string;
    const collectionId = curation.collection_id as string;

    agentCurationMap.set(
      agentId,
      new Set([...(agentCurationMap.get(agentId) ?? []), collectionId]),
    );
  }

  for (const row of agentReputationResult.data ?? []) {
    const acceptedRate =
      typeof row.accepted_draft_rate === "number"
        ? row.accepted_draft_rate
        : typeof row.accepted_draft_rate === "string"
          ? Number.parseFloat(row.accepted_draft_rate)
          : null;
    const rejectedRate =
      typeof row.rejected_draft_rate === "number"
        ? row.rejected_draft_rate
        : typeof row.rejected_draft_rate === "string"
          ? Number.parseFloat(row.rejected_draft_rate)
          : null;

    agentReputationMap.set(row.agent_id as string, {
      totalDrafts: Number(row.total_drafts ?? 0),
      acceptedDrafts: Number(row.accepted_drafts ?? 0),
      rejectedDrafts: Number(row.rejected_drafts ?? 0),
      submittedDrafts: Number(row.submitted_drafts ?? 0),
      publicReplyCount: Number(row.public_reply_count ?? 0),
      reactionCount: Number(row.reaction_count ?? 0),
      runCount: Number(row.run_count ?? 0),
      lastSuccessfulRunAt: (row.last_successful_run_at as string | null) ?? null,
      acceptedDraftRate: Number.isFinite(acceptedRate ?? Number.NaN) ? acceptedRate : null,
      rejectedDraftRate: Number.isFinite(rejectedRate ?? Number.NaN) ? rejectedRate : null,
    });
  }

  for (const row of agentReviewStateResult.data ?? []) {
    const agentId = row.agent_id as string;
    const current =
      agentReviewStateMap.get(agentId) ?? {
        comment: {
          status: "none" as const,
          note: null,
          requestedAt: null,
          reviewedAt: null,
        },
        react: {
          status: "none" as const,
          note: null,
          requestedAt: null,
          reviewedAt: null,
        },
      };

    current[row.action_type as "comment" | "react"] = {
      status: (row.status as "pending" | "approved" | "rejected") ?? "none",
      note: (row.note as string | null) ?? null,
      requestedAt: (row.requested_at as string | null) ?? null,
      reviewedAt: (row.reviewed_at as string | null) ?? null,
    };
    agentReviewStateMap.set(agentId, current);
  }

  function buildAdminHref(overrides: Record<string, string | number | null | undefined>) {
    const nextParams = new URLSearchParams();

    for (const [key, value] of Object.entries({
      activityType: params.activityType ?? "all",
      activityStatus: params.activityStatus ?? "all",
      submissionsPage,
      commentsPage,
      activityPage,
      ...overrides,
    })) {
      if (value === undefined || value === null || value === "" || value === "all" || value === 1) {
        continue;
      }

      nextParams.set(key, String(value));
    }

    const query = nextParams.toString();
    return query ? `/admin?${query}` : "/admin";
  }

  if (profile?.role !== "admin") {
    if ((adminCount ?? 0) === 0) {
      return (
        <main className="mx-auto w-full max-w-[96rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
          <section className="rounded-xl border border-border/50 bg-card p-6 sm:p-8 sv-animate-in">
            <p className="sv-overline">Admin bootstrap</p>
            <h1 className="mt-3 font-display text-4xl font-medium text-foreground sm:text-5xl">
              Claim the first admin seat.
            </h1>
            <p className="sv-body mt-4 max-w-2xl">
              This project has no admin yet. The first signed-in operator can initialize the admin
              role once.
            </p>
            <form action={bootstrapAdmin} className="mt-8">
              <button className="sv-btn sv-btn-primary">
                Become the initial admin
              </button>
            </form>
          </section>
        </main>
      );
    }

    redirect("/");
  }

  return (
    <main className="mx-auto w-full max-w-[96rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="rounded-xl border border-border/50 bg-card p-6 sm:p-8 sv-animate-in">
        <p className="sv-overline">Admin</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-4xl font-medium text-foreground sm:text-5xl">
              Operations and catalog control
            </h1>
            <p className="sv-body mt-4 max-w-2xl">
              Moderate submissions, remove harmful comments, manage creator claims, and control film
              visibility without breaking permanent serial history.
            </p>
          </div>
          <div className="sv-chip">
            Signed in as {profile.displayName}
          </div>
        </div>
      </section>

      <section className="grid gap-4 py-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border/50 bg-card/60 px-5 py-5 sv-animate-in sv-stagger-1">
          <p className="sv-overline">Pending submissions</p>
          <p className="mt-3 font-display text-3xl font-medium text-foreground">{queuedSubmissions.length}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/60 px-5 py-5 sv-animate-in sv-stagger-2">
          <p className="sv-overline">Public catalog</p>
          <p className="mt-3 font-display text-3xl font-medium text-foreground">{filmCountResult.count ?? 0}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/60 px-5 py-5 sv-animate-in sv-stagger-3">
          <p className="sv-overline">Removed titles</p>
          <p className="mt-3 font-display text-3xl font-medium text-foreground">{removedCountResult.count ?? 0}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/60 px-5 py-5 sv-animate-in sv-stagger-4">
          <p className="sv-overline">Creators / comments</p>
          <p className="mt-3 font-display text-3xl font-medium text-foreground">
            {creatorCountResult.count ?? 0} / {commentCountResult.count ?? 0}
          </p>
        </div>
      </section>

      <section className="grid gap-6 py-2 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
        <div className="grid gap-6">
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="sv-overline">Review queue</p>
                <h2 className="mt-2 font-display text-3xl font-medium text-foreground">
                  Submission approvals
                </h2>
              </div>
              <div className="sv-chip">{queuedSubmissions.length} open</div>
            </div>
            <form className="rounded-xl border border-border/50 bg-card/60 mb-4 grid gap-3 rounded-xl px-4 py-4" id="bulk-submissions-form">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Bulk submission actions</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Select multiple queued submissions, then approve or reject them together.
                  </p>
                </div>
                <div className="sv-chip">Page {submissionsPage}</div>
              </div>
              <textarea
                className="sv-textarea min-h-24"
                name="bulkNotes"
                placeholder="Optional note applied to all selected submission actions"
              />
              <label className="block">
                <span className="sv-field-label">Structured rejection reason</span>
                <select className="sv-select" defaultValue="" name="reason">
                  <option value="">Optional for bulk rejection</option>
                  {submissionRejectionReasons.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex flex-wrap gap-2">
                <ConfirmSubmitButton
                  className="sv-btn sv-btn-primary"
                  confirmMessage="Approve all selected submissions and publish them to the catalog?"
                  formAction={bulkApproveSubmissions}
                >
                  Approve selected
                </ConfirmSubmitButton>
                <ConfirmSubmitButton
                  className="sv-btn sv-btn-secondary"
                  confirmMessage="Reject all selected submissions?"
                  formAction={bulkRejectSubmissions}
                >
                  Reject selected
                </ConfirmSubmitButton>
              </div>
            </form>
            <div className="grid gap-3">
              {queuedSubmissions.length ? (
                queuedSubmissions.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border/50 bg-card/60 flex flex-col gap-4 rounded-xl px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <label className="mb-3 flex items-center gap-3 text-sm text-muted-foreground">
                        <input form="bulk-submissions-form" name="submissionIds" type="checkbox" value={item.id as string} />
                        Select for bulk actions
                      </label>
                      <p className="text-lg font-medium tracking-[-0.02em] text-foreground">{item.proposed_title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        queued {new Date(item.created_at).toLocaleDateString("en-US")} by{" "}
                        {((item.profiles as { display_name?: string }[] | null) ?? [])[0]?.display_name ?? "viewer"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <form action={approveSubmission.bind(null, item.id as string)}>
                        <ConfirmSubmitButton
                          className="sv-btn sv-btn-primary"
                          confirmMessage={`Approve "${item.proposed_title}" and publish it to the catalog?`}
                        >
                          Approve
                        </ConfirmSubmitButton>
                      </form>
                      <form action={rejectSubmission.bind(null, item.id as string)} className="grid gap-2">
                        <select className="sv-select" defaultValue="" name="reason">
                          <option value="">Select rejection reason</option>
                          {submissionRejectionReasons.map((reason) => (
                            <option key={`${item.id}-${reason.value}`} value={reason.value}>
                              {reason.label}
                            </option>
                          ))}
                        </select>
                        <textarea
                          className="sv-textarea min-h-20"
                          name="notes"
                          placeholder="Visible note for the creator"
                        />
                        <ConfirmSubmitButton
                          className="sv-btn sv-btn-secondary"
                          confirmMessage={`Reject "${item.proposed_title}"?`}
                        >
                          Reject
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-5 text-sm text-muted-foreground">
                  No queued submissions right now.
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Page {submissionsPage} of {totalSubmissionPages}
              </p>
              <div className="flex gap-2">
                <a
                  aria-disabled={submissionsPage <= 1}
                  className={`sv-btn sv-btn-secondary ${submissionsPage <= 1 ? "pointer-events-none opacity-45" : ""}`}
                  href={buildAdminHref({ submissionsPage: submissionsPage - 1 })}
                >
                  Previous
                </a>
                <a
                  aria-disabled={submissionsPage >= totalSubmissionPages}
                  className={`sv-btn sv-btn-secondary ${submissionsPage >= totalSubmissionPages ? "pointer-events-none opacity-45" : ""}`}
                  href={buildAdminHref({ submissionsPage: submissionsPage + 1 })}
                >
                  Next
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-6">
            <div className="mb-5">
              <p className="sv-overline">Catalog controls</p>
              <h2 className="mt-2 font-display text-3xl font-medium text-foreground">
                Visibility and featuring
              </h2>
            </div>
            <div className="grid gap-4">
              {managedFilms.map((film) => (
                <form
                  key={film.id}
                  action={updateFilmEditorial.bind(null, film.id as string)}
                  className="rounded-xl border border-border/50 bg-card/60 grid gap-4 rounded-xl px-4 py-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="sv-overline">#{film.serial_number}</p>
                      <p className="mt-1 text-lg font-medium tracking-[-0.02em] text-foreground">{film.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Current visibility: {film.visibility}</p>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,0.68fr)_auto]">
                    <label className="block">
                      <span className="sv-field-label">Availability note</span>
                      <input
                        className="sv-input"
                        defaultValue={(film.availability_note as string | null) ?? ""}
                        name="availabilityNote"
                        placeholder="Optional note shown on removed titles"
                        type="text"
                      />
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="sv-field-label">Visibility</span>
                        <select
                          className="sv-select"
                          defaultValue={film.visibility as string}
                          name="visibility"
                        >
                          {visibilityOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="sv-field-label">Featured weight</span>
                        <input
                          className="sv-input"
                          defaultValue={String(film.featured_weight ?? 0)}
                          name="featuredWeight"
                          type="number"
                        />
                      </label>
                    </div>
                    <div className="flex items-end">
                      <button className="sv-btn sv-btn-secondary w-full">Save</button>
                    </div>
                  </div>
                </form>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-6">
            <div className="mb-5">
              <p className="sv-overline">Status awards</p>
              <h2 className="mt-2 font-display text-3xl font-medium text-foreground">
                Manual trophy assignment
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                Signal trophies calculate themselves. Use these controls for editorial status like
                Staff Select, Festival Contender, and creator recognition.
              </p>
            </div>
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="grid gap-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-medium tracking-[-0.02em] text-foreground">Film trophies</p>
                  <span className="sv-chip">{filmTrophyDefinitions.length} options</span>
                </div>
                {managedFilms.map((film) => {
                  const assignedTrophyIds = filmTrophyAssignmentMap.get(film.id as string) ?? new Set<string>();

                  return (
                    <form
                      key={`film-trophy-${film.id}`}
                      action={updateFilmTrophies.bind(null, film.id as string)}
                      className="rounded-xl border border-border/50 bg-card/60 grid gap-4 rounded-xl px-4 py-4"
                    >
                      <div>
                        <p className="sv-overline">#{film.serial_number}</p>
                        <p className="mt-1 text-lg font-medium tracking-[-0.02em] text-foreground">{film.title}</p>
                      </div>
                      <div className="grid gap-2">
                        {filmTrophyDefinitions.map((definition) => (
                          <label key={`${film.id}-${definition.id}`} className="flex items-center gap-3 text-sm text-muted-foreground">
                            <input
                              defaultChecked={assignedTrophyIds.has(definition.id as string)}
                              name="trophyIds"
                              type="checkbox"
                              value={definition.id as string}
                            />
                            <span>{definition.name as string}</span>
                          </label>
                        ))}
                      </div>
                      <div className="flex justify-end">
                        <button className="sv-btn sv-btn-secondary w-full sm:w-auto">Save trophies</button>
                      </div>
                    </form>
                  );
                })}
              </div>

              <div className="grid gap-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-medium tracking-[-0.02em] text-foreground">Creator trophies</p>
                  <span className="sv-chip">{creatorTrophyDefinitions.length} options</span>
                </div>
                {managedCreators.map((creator) => {
                  const assignedTrophyIds = creatorTrophyAssignmentMap.get(creator.id as string) ?? new Set<string>();

                  return (
                    <form
                      key={`creator-trophy-${creator.id}`}
                      action={updateCreatorTrophies.bind(null, creator.id as string, creator.slug as string)}
                      className="rounded-xl border border-border/50 bg-card/60 grid gap-4 rounded-xl px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-lg font-medium tracking-[-0.02em] text-foreground">{creator.name as string}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {(creator.followers_count as number) ?? 0} followers
                          </p>
                        </div>
                        <a className="sv-btn sv-btn-secondary" href={`/creators/${creator.slug as string}`}>
                          Open
                        </a>
                      </div>
                      <div className="grid gap-2">
                        {creatorTrophyDefinitions.map((definition) => (
                          <label key={`${creator.id}-${definition.id}`} className="flex items-center gap-3 text-sm text-muted-foreground">
                            <input
                              defaultChecked={assignedTrophyIds.has(definition.id as string)}
                              name="trophyIds"
                              type="checkbox"
                              value={definition.id as string}
                            />
                            <span>{definition.name as string}</span>
                          </label>
                        ))}
                      </div>
                      <div className="flex justify-end">
                        <button className="sv-btn sv-btn-secondary w-full sm:w-auto">Save trophies</button>
                      </div>
                    </form>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-6">
            <div className="mb-5">
              <p className="sv-overline">Agent operations</p>
              <h2 className="mt-2 font-display text-3xl font-medium text-foreground">
                Trust and curator rails
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                Moderate public agent identity, disable weak actors, and assign curated rails through the same collection objects used everywhere else.
              </p>
            </div>
            <div className="grid gap-4">
              {managedAgents.length ? (
                managedAgents.map((agent) => {
                  const assignedCollectionIds = agentCurationMap.get(agent.id as string) ?? new Set<string>();
                  const creator = ((agent.creators as { name?: string; slug?: string }[] | null) ?? [])[0];
                  const reputation = agentReputationMap.get(agent.id as string) ?? {
                    totalDrafts: 0,
                    acceptedDrafts: 0,
                    rejectedDrafts: 0,
                    submittedDrafts: 0,
                    publicReplyCount: 0,
                    reactionCount: 0,
                    runCount: 0,
                    lastSuccessfulRunAt: null,
                    acceptedDraftRate: null,
                    rejectedDraftRate: null,
                  };
                  const reviewState = agentReviewStateMap.get(agent.id as string) ?? {
                    comment: {
                      status: "none" as const,
                      note: null,
                      requestedAt: null,
                      reviewedAt: null,
                    },
                    react: {
                      status: "none" as const,
                      note: null,
                      requestedAt: null,
                      reviewedAt: null,
                    },
                  };

                  return (
                    <form
                      key={`agent-controls-${agent.id}`}
                      action={updateAgentModeration.bind(null, agent.id as string, agent.slug as string)}
                      className="rounded-xl border border-border/50 bg-card/60 grid gap-4 rounded-xl px-4 py-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-medium tracking-[-0.02em] text-foreground">{agent.name as string}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            /agents/{agent.slug as string}
                            {creator?.slug ? ` / creator: ${creator.name}` : ""}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="sv-chip">{agent.trust_level as string}</span>
                          <span className="sv-chip">{agent.status as string}</span>
                          <span className="sv-chip">
                            {reputation.acceptedDraftRate !== null
                              ? `${Math.round(reputation.acceptedDraftRate * 100)}% accepted`
                              : "No reviewed drafts"}
                          </span>
                        </div>
                      </div>
                      <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                          {reputation.totalDrafts} drafts / {reputation.acceptedDrafts} accepted
                        </div>
                        <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                          {reputation.publicReplyCount} replies / {reputation.reactionCount} reactions
                        </div>
                        <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                          {reputation.runCount} logged runs
                        </div>
                        <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                          {reputation.lastSuccessfulRunAt
                            ? `Last success ${new Date(reputation.lastSuccessfulRunAt).toLocaleDateString("en-US")}`
                            : "No successful runs yet"}
                        </div>
                      </div>
                      <div className="grid gap-4 lg:grid-cols-3">
                        <label className="block">
                          <span className="sv-field-label">Trust level</span>
                          <select className="sv-select" defaultValue={agent.trust_level as string} name="trustLevel">
                            <option value="sandbox">sandbox</option>
                            <option value="trusted">trusted</option>
                            <option value="official">official</option>
                            <option value="editorial">editorial</option>
                          </select>
                        </label>
                        <label className="block">
                          <span className="sv-field-label">Status</span>
                          <select className="sv-select" defaultValue={agent.status as string} name="status">
                            <option value="active">active</option>
                            <option value="disabled">disabled</option>
                          </select>
                        </label>
                        <label className="flex items-end gap-3 rounded-xl border border-border/50 bg-card/60 px-4 py-3 text-sm text-muted-foreground">
                          <input
                            defaultChecked={Boolean(agent.is_official_creator_agent)}
                            name="isOfficialCreatorAgent"
                            type="checkbox"
                          />
                          Mark as official creator companion
                        </label>
                      </div>
                      <div className="grid gap-4 lg:grid-cols-2">
                        <label className="block">
                          <span className="sv-field-label">Public reply review</span>
                          <select className="sv-select" defaultValue={reviewState.comment.status} name="commentReviewStatus">
                            <option value="none">none</option>
                            <option value="pending">pending</option>
                            <option value="approved">approved</option>
                            <option value="rejected">rejected</option>
                          </select>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {reviewState.comment.requestedAt
                              ? `requested ${new Date(reviewState.comment.requestedAt).toLocaleDateString("en-US")}`
                              : "No review request yet"}
                          </p>
                        </label>
                        <label className="block">
                          <span className="sv-field-label">Reaction review</span>
                          <select className="sv-select" defaultValue={reviewState.react.status} name="reactionReviewStatus">
                            <option value="none">none</option>
                            <option value="pending">pending</option>
                            <option value="approved">approved</option>
                            <option value="rejected">rejected</option>
                          </select>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {reviewState.react.requestedAt
                              ? `requested ${new Date(reviewState.react.requestedAt).toLocaleDateString("en-US")}`
                              : "No review request yet"}
                          </p>
                        </label>
                      </div>
                      <div>
                        <p className="sv-field-label">Curated rails</p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                          {collections.map((collection) => (
                            <label
                              key={`${agent.id}-${collection.id}`}
                              className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/60 px-4 py-3 text-sm text-muted-foreground"
                            >
                              <input
                                defaultChecked={assignedCollectionIds.has(collection.id as string)}
                                name="collectionIds"
                                type="checkbox"
                                value={collection.id as string}
                              />
                              <span>{collection.name as string}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <textarea
                        className="sv-textarea min-h-24"
                        name="note"
                        placeholder="Optional internal moderation note"
                      />
                      <div className="flex justify-end">
                        <button className="sv-btn sv-btn-secondary w-full sm:w-auto">Save agent controls</button>
                      </div>
                    </form>
                  );
                })
              ) : (
                <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-5 text-sm text-muted-foreground">
                  No registered agents yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <div className="mb-5">
              <p className="sv-overline">Watch room oversight</p>
              <h2 className="mt-2 font-display text-3xl font-medium text-foreground">
                Live rooms and replay stewardship
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                Track which public watch rooms are live, where moderation is happening, and whether replay/story surfaces are being maintained instead of drifting.
              </p>
            </div>
            <div className="grid gap-3">
              {watchRooms.length ? (
                watchRooms.map((room) => (
                  <div key={room.id} className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          <span className="sv-chip">{getWatchEventStatusLabel(room)}</span>
                          {room.officialAgent ? <span className="sv-chip">{room.officialAgent.name}</span> : null}
                        </div>
                        <p className="mt-3 text-lg font-medium tracking-[-0.02em] text-foreground">{room.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          #{room.film.serial} {room.film.title}
                        </p>
                      </div>
                      <a className="sv-btn sv-btn-secondary" href={buildWatchEventHref(room)}>
                        Open room
                      </a>
                    </div>
                    <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                        {room.liveHumanCount} humans live / {room.liveAgentCount} agents live
                      </div>
                      <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                        {room.replayHighlightCount} replay markers / {room.analytics.replayInterestCount} replay requests
                      </div>
                      <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                        {room.moderationActionCount} moderator actions / {room.analytics.shareCount} shares
                      </div>
                      <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                        Latest activity {new Date(room.latestActivityAt).toLocaleDateString("en-US")}
                      </div>
                    </div>
                    <div className="mt-3 rounded-xl border border-border/50 bg-card/60 px-4 py-4 text-sm leading-6 text-muted-foreground">
                      <span className="text-foreground">
                        {room.latestModerationEntry
                          ? `${room.latestModerationEntry.actorDisplayName} last touched the room with ${room.latestModerationEntry.action}.`
                          : "No visible moderation action logged yet."}
                      </span>{" "}
                      {room.topReplayHighlight
                        ? `Top replay lead: ${room.topReplayHighlight.title}.`
                        : "Replay dossier still needs a lead moment."}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-5 text-sm text-muted-foreground">
                  No watch rooms yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-6">
            <p className="sv-overline">Creator claims</p>
            <div className="mt-4 grid gap-3">
              {claimRequests.length ? (
                claimRequests.map((claim) => {
                  const creator = ((claim.creators as { id?: string; name?: string }[] | null) ?? [])[0];
                  const claimant = ((claim.profiles as { display_name?: string }[] | null) ?? [])[0];

                  return (
                    <div
                      key={claim.id}
                      className="rounded-xl border border-border/50 bg-card/60 px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-lg font-medium tracking-[-0.02em] text-foreground">
                            {creator?.name ?? "Unknown creator"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            requested by {claimant?.display_name ?? "viewer"}
                          </p>
                        </div>
                        <p className="font-mono text-sm text-[var(--color-highlight)]">{claim.status}</p>
                      </div>
                      {claim.status === "pending" && creator?.id ? (
                        <div className="mt-4 grid gap-2">
                          <form
                            action={approveCreatorClaim.bind(
                              null,
                              claim.id as string,
                              creator.id,
                              claim.profile_id as string,
                            )}
                            className="grid gap-2"
                          >
                            <textarea
                              className="sv-textarea min-h-20"
                              name="notes"
                              placeholder="Optional approval note"
                            />
                            <ConfirmSubmitButton
                              className="sv-btn sv-btn-primary"
                              confirmMessage={`Approve the claim for "${creator?.name ?? "this creator"}"?`}
                            >
                              Approve
                            </ConfirmSubmitButton>
                          </form>
                          <form action={rejectCreatorClaim.bind(null, claim.id as string)} className="grid gap-2">
                            <textarea
                              className="sv-textarea min-h-20"
                              name="notes"
                              placeholder="Optional rejection note"
                            />
                            <ConfirmSubmitButton
                              className="sv-btn sv-btn-secondary"
                              confirmMessage={`Reject the claim for "${creator?.name ?? "this creator"}"?`}
                            >
                              Reject
                            </ConfirmSubmitButton>
                          </form>
                        </div>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-5 text-sm text-muted-foreground">
                  No claim requests yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-6">
            <p className="sv-overline">Comment moderation</p>
            <form className="rounded-xl border border-border/50 bg-card/60 mt-4 grid gap-3 rounded-xl px-4 py-4" id="bulk-comments-form">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Bulk comment actions</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Select multiple comments on this page and remove them in one action.
                  </p>
                </div>
                <div className="sv-chip">Page {commentsPage}</div>
              </div>
              <textarea
                className="sv-textarea min-h-24"
                name="bulkNotes"
                placeholder="Optional note applied to all selected comment deletions"
              />
              <div className="flex flex-wrap gap-2">
                <ConfirmSubmitButton
                  className="sv-btn sv-btn-secondary"
                  confirmMessage="Delete all selected comments?"
                  formAction={bulkDeleteComments}
                >
                  Delete selected
                </ConfirmSubmitButton>
              </div>
            </form>
            <div className="mt-4 grid gap-3">
              {recentComments.length ? (
                recentComments.map((comment) => {
                  const film =
                    ((comment.films as { serial_number?: number; slug?: string; title?: string }[] | null) ?? [])[0];
                  const author = ((comment.profiles as { display_name?: string }[] | null) ?? [])[0];

                  return (
                    <div
                      key={comment.id}
                      className="rounded-xl border border-border/50 bg-card/60 px-4 py-4"
                    >
                      {typeof film?.serial_number === "number" && film?.slug ? (
                        <label className="mb-3 flex items-center gap-3 text-sm text-muted-foreground">
                          <input
                            form="bulk-comments-form"
                            name="commentTargets"
                            type="checkbox"
                            value={`${comment.id as string}::${buildFilmHref({ serial: film.serial_number, slug: film.slug })}`}
                          />
                          Select for bulk deletion
                        </label>
                      ) : null}
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-[var(--color-highlight)]">
                            #{film?.serial_number ?? "?"} {film?.title ?? "Unknown film"}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {author?.display_name ?? "viewer"} • {new Date(comment.created_at as string).toLocaleDateString("en-US")}
                          </p>
                        </div>
                        {typeof film?.serial_number === "number" && film?.slug ? (
                          <form
                            action={deleteComment.bind(
                              null,
                              comment.id as string,
                              buildFilmHref({ serial: film.serial_number, slug: film.slug }),
                            )}
                            className="grid gap-2"
                          >
                            <textarea
                              className="sv-textarea min-h-20"
                              name="notes"
                              placeholder="Optional moderation note"
                            />
                            <ConfirmSubmitButton
                              className="sv-btn sv-btn-secondary"
                              confirmMessage="Delete this comment?"
                            >
                              Delete
                            </ConfirmSubmitButton>
                          </form>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{comment.body as string}</p>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-5 text-sm text-muted-foreground">
                  No recent comments to moderate.
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Page {commentsPage} of {totalCommentPages}
              </p>
              <div className="flex gap-2">
                <a
                  aria-disabled={commentsPage <= 1}
                  className={`sv-btn sv-btn-secondary ${commentsPage <= 1 ? "pointer-events-none opacity-45" : ""}`}
                  href={buildAdminHref({ commentsPage: commentsPage - 1 })}
                >
                  Previous
                </a>
                <a
                  aria-disabled={commentsPage >= totalCommentPages}
                  className={`sv-btn sv-btn-secondary ${commentsPage >= totalCommentPages ? "pointer-events-none opacity-45" : ""}`}
                  href={buildAdminHref({ commentsPage: commentsPage + 1 })}
                >
                  Next
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-6">
            <p className="sv-overline">Moderation rules</p>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
              <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                Removing a film never frees its serial for reuse.
              </div>
              <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                Hidden titles leave browse surfaces without creating public tombstones.
              </div>
              <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                Removed titles keep direct serial history and show an unavailable state.
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-6">
            <p className="sv-overline">Moderation activity</p>
            <form className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <label className="block">
                <span className="sv-field-label">Type</span>
                <select className="sv-select" defaultValue={params.activityType ?? "all"} name="activityType">
              {activityTypes.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="sv-field-label">Status</span>
                <select className="sv-select" defaultValue={params.activityStatus ?? "all"} name="activityStatus">
                  {activityStatuses.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-end gap-2">
                <button className="sv-btn sv-btn-secondary w-full sm:w-auto">Filter</button>
              </div>
            </form>
            <div className="mt-4 grid gap-3">
              {moderationCases.length ? (
                moderationCases.map((entry) => {
                  const film = entry.film_id ? filmMap.get(entry.film_id as string) : null;
                  const submissionTitle = entry.submission_id
                    ? submissionMap.get(entry.submission_id as string)
                    : null;
                  const actorName = entry.actor_profile_id
                    ? actorMap.get(entry.actor_profile_id as string)
                    : "admin";

                  return (
                    <div key={entry.id} className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{entry.reason as string}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {actorName ?? "admin"} • {new Date(entry.created_at as string).toLocaleDateString("en-US")}
                          </p>
                        </div>
                        <span className="sv-chip">{entry.status as string}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground">
                        <span>{entry.case_type as string}</span>
                        {film ? <span>/ #{film.serialNumber} {film.title}</span> : null}
                        {submissionTitle ? <span>/ {submissionTitle}</span> : null}
                      </div>
                      {entry.notes ? (
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">{entry.notes as string}</p>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-5 text-sm text-muted-foreground">
                  No moderation activity has been logged yet.
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Page {activityPage} of {totalActivityPages}
              </p>
              <div className="flex gap-2">
                <a
                  aria-disabled={activityPage <= 1}
                  className={`sv-btn sv-btn-secondary ${activityPage <= 1 ? "pointer-events-none opacity-45" : ""}`}
                  href={buildAdminHref({ activityPage: activityPage - 1 })}
                >
                  Previous
                </a>
                <a
                  aria-disabled={activityPage >= totalActivityPages}
                  className={`sv-btn sv-btn-secondary ${activityPage >= totalActivityPages ? "pointer-events-none opacity-45" : ""}`}
                  href={buildAdminHref({ activityPage: activityPage + 1 })}
                >
                  Next
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

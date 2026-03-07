"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAgentAccessToken,
  createUniqueAgentSlug,
  getOwnedAgents,
} from "@/lib/agents";
import { getCurrentSessionProfile } from "@/lib/auth";
import { logModerationCase } from "@/lib/moderation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildWatchEventHref,
  createUniqueWatchEventSlug,
  getOwnedWatchEventForHost,
} from "@/lib/watch-events";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getSafeRedirectPath(value: string | null | undefined, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

export type AgentStudioActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  token?: string | null;
};

function normalizeAgentCapabilities(values: FormDataEntryValue[]) {
  const capabilities = values
    .map((value) => String(value).trim())
    .filter(Boolean);

  return [...new Set(capabilities)].sort();
}

function parseFutureDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function revalidateOwnedWatchEventPaths(event: { slug: string; film_id: string }) {
  const supabase = createSupabaseAdminClient();
  const { data: film } = await supabase
    .from("films")
    .select("serial_number, slug")
    .eq("id", event.film_id)
    .maybeSingle();

  revalidatePath("/studio");
  revalidatePath("/watch");
  revalidatePath(buildWatchEventHref({ slug: event.slug }));

  if (film) {
    revalidatePath(`/films/${film.serial_number}-${film.slug}`);
  }
}

export async function createCreatorProfile(formData: FormData) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    redirect("/login?next=/studio");
  }

  const name = String(formData.get("name") ?? "").trim();
  const headline = String(formData.get("headline") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();

  if (!name || !headline || !bio) {
    redirect("/studio?error=missing-fields");
  }

  const supabase = await createSupabaseServerClient();
  const slug = slugify(name);
  const { error } = await supabase.from("creators").insert({
    profile_id: profile.id,
    slug,
    name,
    headline,
    bio,
    location,
  });

  if (error) {
    redirect("/studio?error=create-failed");
  }

  revalidatePath("/studio");
  revalidatePath("/creators");
  redirect("/studio?created=1");
}

export async function updateViewerProfile(formData: FormData) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    redirect("/login?next=/studio");
  }

  const displayName = String(formData.get("displayName") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  if (!displayName) {
    redirect("/studio?error=profile-missing-fields");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      bio,
    })
    .eq("id", profile.id);

  if (error) {
    redirect("/studio?error=profile-update-failed");
  }

  revalidatePath("/studio");
  revalidatePath("/");
  redirect("/studio?profile=updated");
}

export async function updateCreatorProfile(formData: FormData) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    redirect("/login?next=/studio");
  }

  const name = String(formData.get("name") ?? "").trim();
  const headline = String(formData.get("headline") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();

  if (!name || !headline || !bio) {
    redirect("/studio?error=creator-missing-fields");
  }

  const supabase = await createSupabaseServerClient();
  const { data: creator, error: creatorError } = await supabase
    .from("creators")
    .select("id, slug")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (creatorError || !creator) {
    redirect("/studio?error=creator-not-found");
  }

  const { error } = await supabase
    .from("creators")
    .update({
      name,
      headline,
      bio,
      location,
    })
    .eq("id", creator.id);

  if (error) {
    redirect("/studio?error=creator-update-failed");
  }

  revalidatePath("/studio");
  revalidatePath(`/creators/${creator.slug}`);
  revalidatePath("/creators");
  redirect("/studio?creator=updated");
}

export async function requestCreatorClaim(creatorId: string) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("creator_claim_requests").insert({
    creator_id: creatorId,
    profile_id: profile.id,
  });

  if (error) {
    redirect("/library?claim=request-failed");
  }

  revalidatePath("/library");
  revalidatePath("/admin");
  redirect("/library?claim=sent");
}

export async function bootstrapAdmin() {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    redirect("/login?next=/admin");
  }

  const supabase = createSupabaseAdminClient();
  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  if ((count ?? 0) > 0) {
    redirect("/admin?error=bootstrap-closed");
  }

  await supabase.from("profiles").update({ role: "admin" }).eq("id", profile.id);
  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function approveCreatorClaim(
  claimId: string,
  creatorId: string,
  profileId: string,
  formData: FormData,
) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile || profile.role !== "admin") {
    redirect("/login?next=/admin");
  }

  const supabase = createSupabaseAdminClient();
  const notes = String(formData.get("notes") ?? "").trim();
  const { data: claimRecord, error: claimError } = await supabase
    .from("creator_claim_requests")
    .select("creator_id")
    .eq("id", claimId)
    .maybeSingle();

  if (claimError) {
    throw new Error(`Failed to read creator claim: ${claimError.message}`);
  }

  await supabase.from("creators").update({ profile_id: profileId }).eq("id", creatorId);
  await supabase.from("creator_claim_requests").update({ status: "approved" }).eq("id", claimId);
  await logModerationCase({
    actorProfileId: profile.id,
    caseType: "creator-claim-approved",
    reason: "Creator claim approved.",
    notes: notes || null,
    metadata: {
      creatorId,
      claimedProfileId: profileId,
    },
  });
  revalidatePath("/admin");
  revalidatePath("/creators");
  if (claimRecord?.creator_id) {
    revalidatePath("/library");
  }
}

export async function rejectCreatorClaim(claimId: string, formData: FormData) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile || profile.role !== "admin") {
    redirect("/login?next=/admin");
  }

  const supabase = createSupabaseAdminClient();
  const notes = String(formData.get("notes") ?? "").trim();
  const { data: claimRecord, error: claimError } = await supabase
    .from("creator_claim_requests")
    .select("creator_id, profile_id")
    .eq("id", claimId)
    .maybeSingle();

  if (claimError) {
    throw new Error(`Failed to read creator claim: ${claimError.message}`);
  }

  await supabase.from("creator_claim_requests").update({ status: "rejected" }).eq("id", claimId);
  await logModerationCase({
    actorProfileId: profile.id,
    caseType: "creator-claim-rejected",
    reason: "Creator claim rejected.",
    notes: notes || null,
    metadata: {
      creatorId: claimRecord?.creator_id ?? null,
      claimantProfileId: claimRecord?.profile_id ?? null,
    },
  });
  revalidatePath("/admin");
  revalidatePath("/library");
}

export async function createOwnedAgent(
  _previousState: AgentStudioActionState,
  formData: FormData,
): Promise<AgentStudioActionState> {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    return {
      status: "error",
      message: "Sign in before creating an agent.",
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const agentType = String(formData.get("agentType") ?? "companion").trim();
  const isOfficialCreatorAgent = formData.get("isOfficialCreatorAgent") === "on";
  const capabilities = normalizeAgentCapabilities(formData.getAll("capabilities"));

  if (!name || !description || !capabilities.length) {
    return {
      status: "error",
      message: "Name, description, and at least one capability are required.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data: creator } = await supabase
    .from("creators")
    .select("id, slug")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (isOfficialCreatorAgent && !creator) {
    return {
      status: "error",
      message: "Create or claim your creator profile before attaching an official creator agent.",
    };
  }

  const slug = await createUniqueAgentSlug(name);
  const token = createAgentAccessToken();
  const trustLevel = isOfficialCreatorAgent ? "official" : "sandbox";

  const { data: createdAgent, error: agentError } = await supabase
    .from("agents")
    .insert({
      owner_profile_id: profile.id,
      creator_id: creator?.id ?? null,
      name,
      slug,
      description,
      agent_type: agentType,
      trust_level: trustLevel,
      status: "active",
      is_official_creator_agent: isOfficialCreatorAgent,
      capabilities,
    })
    .select("id")
    .maybeSingle();

  if (agentError || !createdAgent) {
    return {
      status: "error",
      message: "The agent could not be created.",
    };
  }

  const scopes = [
    "submit_drafts",
    ...(capabilities.includes("comment") ? ["comment"] : []),
    ...(capabilities.includes("react") ? ["react"] : []),
  ];

  const { error: credentialError } = await supabase.from("agent_credentials").insert({
    agent_id: createdAgent.id,
    label: "Initial credential",
    token_prefix: token.prefix,
    token_hash: token.hash,
    scopes,
  });

  if (credentialError) {
    await supabase.from("agents").delete().eq("id", createdAgent.id);

    return {
      status: "error",
      message: "The agent was created, but the credential could not be issued.",
    };
  }

  revalidatePath("/studio");
  revalidatePath("/agents");
  if (creator?.slug) {
    revalidatePath(`/creators/${creator.slug}`);
  }

  return {
    status: "success",
    message: "Agent created. This token is shown once.",
    token: token.secret,
  };
}

export async function rotateOwnedAgentToken(
  _previousState: AgentStudioActionState,
  formData: FormData,
): Promise<AgentStudioActionState> {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    return {
      status: "error",
      message: "Sign in before rotating an agent token.",
    };
  }

  const agentId = String(formData.get("agentId") ?? "").trim();

  if (!agentId) {
    return {
      status: "error",
      message: "Agent identifier is missing.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const agents = await getOwnedAgents(profile.id);
  const agent = agents.find((entry) => entry.id === agentId);

  if (!agent) {
    return {
      status: "error",
      message: "That agent does not belong to this account.",
    };
  }

  const token = createAgentAccessToken();
  const scopes = [
    "submit_drafts",
    ...(agent.capabilities.includes("comment") ? ["comment"] : []),
    ...(agent.capabilities.includes("react") ? ["react"] : []),
  ];

  const revokedAt = new Date().toISOString();
  const [{ error: revokeError }, { error: insertError }] = await Promise.all([
    supabase
      .from("agent_credentials")
      .update({ revoked_at: revokedAt })
      .eq("agent_id", agentId)
      .is("revoked_at", null),
    supabase.from("agent_credentials").insert({
      agent_id: agentId,
      label: "Rotated credential",
      token_prefix: token.prefix,
      token_hash: token.hash,
      scopes,
    }),
  ]);

  if (revokeError || insertError) {
    return {
      status: "error",
      message: "The token could not be rotated.",
    };
  }

  revalidatePath("/studio");

  return {
    status: "success",
    message: "Agent token rotated. This token is shown once.",
    token: token.secret,
  };
}

export async function submitAgentDraftSubmission(submissionId: string, formData: FormData) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    redirect("/login?next=/library");
  }

  const redirectPath = getSafeRedirectPath(String(formData.get("redirectTo") ?? ""), "/library");
  const supabase = createSupabaseAdminClient();
  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select("id, profile_id, proposed_title, status, agent_submissions (agent_id, draft_status, agents (name))")
    .eq("id", submissionId)
    .maybeSingle();

  if (submissionError || !submission) {
    redirect(`${redirectPath}?submission=submit-failed`);
  }

  if (submission.profile_id !== profile.id || submission.status !== "draft") {
    redirect(`${redirectPath}?submission=submit-failed`);
  }

  const agentSubmission = Array.isArray(submission.agent_submissions)
    ? submission.agent_submissions[0]
    : submission.agent_submissions;

  if (!agentSubmission || agentSubmission.draft_status !== "draft") {
    redirect(`${redirectPath}?submission=submit-failed`);
  }

  const agentName = Array.isArray(agentSubmission.agents)
    ? (agentSubmission.agents[0] as { name?: string } | undefined)?.name ?? null
    : ((agentSubmission.agents as { name?: string } | null | undefined)?.name ?? null);

  const submittedAt = new Date().toISOString();
  const [{ error: updateSubmissionError }, { error: updateAgentSubmissionError }] = await Promise.all([
    supabase
      .from("submissions")
      .update({
        status: "submitted",
        rejection_reason: null,
        rejection_details: null,
        reviewed_at: null,
      })
      .eq("id", submissionId)
      .eq("profile_id", profile.id)
      .eq("status", "draft"),
    supabase
      .from("agent_submissions")
      .update({
        draft_status: "submitted",
        promoted_at: submittedAt,
      })
      .eq("submission_id", submissionId)
      .eq("owner_profile_id", profile.id),
  ]);

  if (updateSubmissionError || updateAgentSubmissionError) {
    redirect(`${redirectPath}?submission=submit-failed`);
  }

  await logModerationCase({
    actorProfileId: profile.id,
    caseType: "agent-draft-submitted",
    submissionId,
    reason: "Agent draft submitted to moderation by the human owner.",
    metadata: {
      submissionTitle: submission.proposed_title ?? null,
      agentId: agentSubmission.agent_id ?? null,
      agentName,
    },
  });

  revalidatePath("/studio");
  revalidatePath("/library");
  revalidatePath("/admin");
  redirect(`${redirectPath}?submission=submitted`);
}

export async function scheduleWatchEvent(formData: FormData) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    redirect("/login?next=/studio");
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const filmId = String(formData.get("filmId") ?? "").trim();
  const startsAtInput = String(formData.get("startsAt") ?? "").trim();
  const officialAgentId = String(formData.get("officialAgentId") ?? "").trim() || null;
  const durationMinutes = Math.max(15, Number.parseInt(String(formData.get("durationMinutes") ?? "105"), 10) || 105);
  const startsAt = parseFutureDate(startsAtInput);

  if (!title || !description || !filmId || !startsAt) {
    redirect("/studio?error=watch-event-invalid");
  }

  const adminSupabase = createSupabaseAdminClient();
  const serverSupabase = await createSupabaseServerClient();
  const { data: creator } = await adminSupabase
    .from("creators")
    .select("id, slug")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!creator) {
    redirect("/studio?error=watch-event-no-creator");
  }

  const { data: film, error: filmError } = await adminSupabase
    .from("films")
    .select("id, slug, serial_number, creator_id, title, visibility")
    .eq("id", filmId)
    .maybeSingle();

  if (filmError || !film || film.creator_id !== creator.id || film.visibility === "removed") {
    redirect("/studio?error=watch-event-film");
  }

  let validatedAgentId: string | null = null;
  if (officialAgentId) {
    const { data: agent } = await adminSupabase
      .from("agents")
      .select("id, slug, owner_profile_id, is_official_creator_agent, status")
      .eq("id", officialAgentId)
      .maybeSingle();

    if (
      !agent ||
      agent.owner_profile_id !== profile.id ||
      !agent.is_official_creator_agent ||
      agent.status !== "active"
    ) {
      redirect("/studio?error=watch-event-agent");
    }

    validatedAgentId = agent.id;
  }

  const slug = await createUniqueWatchEventSlug(`${film.slug} ${title}`);
  const startsAtIso = startsAt.toISOString();
  const endsAtIso = new Date(startsAt.getTime() + durationMinutes * 60 * 1000).toISOString();
  const status = startsAt.getTime() <= Date.now() ? "live" : "scheduled";
  const { data: event, error } = await serverSupabase
    .from("watch_events")
    .insert({
      slug,
      title,
      description,
      film_id: film.id,
      creator_id: creator.id,
      host_profile_id: profile.id,
      official_agent_id: validatedAgentId,
      starts_at: startsAtIso,
      ends_at: endsAtIso,
      status,
    })
    .select("slug")
    .maybeSingle();

  if (error || !event) {
    redirect("/studio?error=watch-event-failed");
  }

  revalidatePath("/studio");
  revalidatePath(`/films/${film.serial_number}-${film.slug}`);
  revalidatePath("/watch");
  revalidatePath(buildWatchEventHref({ slug: event.slug }));
  redirect("/studio?watchEvent=scheduled");
}

export async function updateWatchEvent(formData: FormData) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    redirect("/login?next=/studio");
  }

  const eventId = String(formData.get("eventId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const startsAt = parseFutureDate(String(formData.get("startsAt") ?? "").trim());
  const durationMinutes = Math.max(15, Number.parseInt(String(formData.get("durationMinutes") ?? "105"), 10) || 105);
  const officialAgentId = String(formData.get("officialAgentId") ?? "").trim() || null;

  if (!eventId || !title || !description || !startsAt) {
    redirect("/studio?error=watch-event-update-failed");
  }

  const event = await getOwnedWatchEventForHost(eventId, profile.id);

  if (!event) {
    redirect("/studio?error=watch-event-update-failed");
  }

  const supabase = createSupabaseAdminClient();
  let validatedAgentId: string | null = null;
  if (officialAgentId) {
    const { data: agent } = await supabase
      .from("agents")
      .select("id, owner_profile_id, is_official_creator_agent, status")
      .eq("id", officialAgentId)
      .maybeSingle();

    if (
      !agent ||
      agent.owner_profile_id !== profile.id ||
      !agent.is_official_creator_agent ||
      agent.status !== "active"
    ) {
      redirect("/studio?error=watch-event-agent");
    }

    validatedAgentId = agent.id;
  }

  const startsAtIso = startsAt.toISOString();
  const endsAtIso = new Date(startsAt.getTime() + durationMinutes * 60 * 1000).toISOString();
  const nextStatus = event.status === "cancelled" ? "scheduled" : event.status;
  const { error } = await supabase
    .from("watch_events")
    .update({
      title,
      description,
      official_agent_id: validatedAgentId,
      starts_at: startsAtIso,
      ends_at: endsAtIso,
      status: nextStatus,
      cancelled_at: null,
    })
    .eq("id", event.id);

  if (error) {
    redirect("/studio?error=watch-event-update-failed");
  }

  await revalidateOwnedWatchEventPaths(event);
  redirect("/studio?watchEvent=updated");
}

export async function startWatchEventNow(eventId: string) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    redirect("/login?next=/studio");
  }

  const event = await getOwnedWatchEventForHost(eventId, profile.id);

  if (!event) {
    redirect("/studio?error=watch-event-update-failed");
  }

  const nowIso = new Date().toISOString();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("watch_events")
    .update({
      status: "live",
      starts_at: nowIso,
      actual_started_at: nowIso,
      cancelled_at: null,
    })
    .eq("id", event.id);

  if (error) {
    redirect("/studio?error=watch-event-update-failed");
  }

  await revalidateOwnedWatchEventPaths(event);
  redirect("/studio?watchEvent=started");
}

export async function endWatchEventNow(eventId: string) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    redirect("/login?next=/studio");
  }

  const event = await getOwnedWatchEventForHost(eventId, profile.id);

  if (!event) {
    redirect("/studio?error=watch-event-update-failed");
  }

  const nowIso = new Date().toISOString();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("watch_events")
    .update({
      status: "ended",
      ends_at: nowIso,
      actual_ended_at: nowIso,
    })
    .eq("id", event.id);

  if (error) {
    redirect("/studio?error=watch-event-update-failed");
  }

  await revalidateOwnedWatchEventPaths(event);
  redirect("/studio?watchEvent=ended");
}

export async function cancelWatchEvent(eventId: string) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    redirect("/login?next=/studio");
  }

  const event = await getOwnedWatchEventForHost(eventId, profile.id);

  if (!event) {
    redirect("/studio?error=watch-event-update-failed");
  }

  const nowIso = new Date().toISOString();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("watch_events")
    .update({
      status: "cancelled",
      cancelled_at: nowIso,
    })
    .eq("id", event.id);

  if (error) {
    redirect("/studio?error=watch-event-update-failed");
  }

  await revalidateOwnedWatchEventPaths(event);
  redirect("/studio?watchEvent=cancelled");
}

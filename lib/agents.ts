import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import type { Collection } from "@/lib/catalog";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AgentPublicAction = "comment" | "react";
export type AgentActionReviewStatus = "none" | "pending" | "approved" | "rejected";

export type AgentActionReview = {
  status: AgentActionReviewStatus;
  note: string | null;
  requestedAt: string | null;
  reviewedAt: string | null;
};

export type AgentActionReviewMap = Record<AgentPublicAction, AgentActionReview>;

export type AgentReputation = {
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
};

export type Agent = {
  id: string;
  ownerProfileId: string;
  creatorId: string | null;
  name: string;
  slug: string;
  description: string;
  agentType: string;
  trustLevel: "sandbox" | "trusted" | "official" | "editorial";
  status: "active" | "disabled";
  isOfficialCreatorAgent: boolean;
  capabilities: string[];
  createdAt: string;
  reputation: AgentReputation;
  actionReviews: AgentActionReviewMap;
};

export type OwnedAgent = Agent & {
  credentials: AgentCredential[];
};

export type AgentCredential = {
  id: string;
  agentId: string;
  label: string | null;
  tokenPrefix: string;
  scopes: string[];
  createdAt: string;
  rotatedAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

export type AgentComment = {
  id: string;
  body: string;
  createdAt: string;
  author: string;
  trustLevel: Agent["trustLevel"];
  isOfficial: boolean;
};

export type FilmAgentPresence = {
  id: string;
  name: string;
  slug: string;
  trustLevel: Agent["trustLevel"];
  isOfficialCreatorAgent: boolean;
  activityLabel: string;
};

export type AgentCuration = {
  id: string;
  note: string | null;
  createdAt: string;
  collection: Pick<Collection, "id" | "slug" | "name" | "description" | "countLabel">;
};

type AgentRow = {
  id: string;
  owner_profile_id: string;
  creator_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  agent_type: string;
  trust_level: Agent["trustLevel"];
  status: Agent["status"];
  is_official_creator_agent: boolean;
  capabilities: string[] | null;
  created_at: string;
};

type AgentCredentialRow = {
  id: string;
  agent_id: string;
  label: string | null;
  token_prefix: string;
  scopes: string[] | null;
  created_at: string;
  rotated_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

type AgentLookupRow = AgentRow & {
  agent_credentials:
    | ({
        id: string;
        scopes: string[] | null;
        token_hash: string;
        revoked_at: string | null;
      } | null)
    | ({
        id: string;
        scopes: string[] | null;
        token_hash: string;
        revoked_at: string | null;
      })[];
};

type AgentCommentRow = {
  id: string;
  body: string;
  created_at: string;
  agents:
    | {
        name: string;
        trust_level: Agent["trustLevel"];
        is_official_creator_agent: boolean;
      }
    | {
        name: string;
        trust_level: Agent["trustLevel"];
        is_official_creator_agent: boolean;
      }[]
    | null;
};

type AgentCurationRow = {
  id: string;
  note: string | null;
  created_at: string;
  collection_id: string;
  collections:
    | {
        id: string;
        slug: string;
        name: string;
        description: string | null;
      }
    | {
        id: string;
        slug: string;
        name: string;
        description: string | null;
      }[]
    | null;
};

type AgentReviewRow = {
  agent_id: string;
  action_type: AgentPublicAction;
  status: Exclude<AgentActionReviewStatus, "none">;
  note: string | null;
  requested_at: string;
  reviewed_at: string | null;
};

type AgentReputationRow = {
  agent_id: string;
  total_drafts: number;
  accepted_drafts: number;
  rejected_drafts: number;
  submitted_drafts: number;
  public_reply_count: number;
  reaction_count: number;
  run_count: number;
  last_successful_run_at: string | null;
  accepted_draft_rate: string | number | null;
  rejected_draft_rate: string | number | null;
};

type PublicActionPolicyResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      statusCode: number;
      reason: string;
      error: string;
    };

const publicActionRateLimits: Record<
  AgentPublicAction,
  { perTenMinutes: number; perHour: number }
> = {
  comment: {
    perTenMinutes: 2,
    perHour: 6,
  },
  react: {
    perTenMinutes: 8,
    perHour: 24,
  },
};

function firstRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hashAgentToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createEmptyAgentActionReviewMap(): AgentActionReviewMap {
  return {
    comment: {
      status: "none",
      note: null,
      requestedAt: null,
      reviewedAt: null,
    },
    react: {
      status: "none",
      note: null,
      requestedAt: null,
      reviewedAt: null,
    },
  };
}

function createEmptyAgentReputation(): AgentReputation {
  return {
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
}

function normalizeRate(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function mapAgent(
  row: AgentRow,
  reputation: AgentReputation = createEmptyAgentReputation(),
  actionReviews: AgentActionReviewMap = createEmptyAgentActionReviewMap(),
): Agent {
  return {
    id: row.id,
    ownerProfileId: row.owner_profile_id,
    creatorId: row.creator_id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    agentType: row.agent_type,
    trustLevel: row.trust_level,
    status: row.status,
    isOfficialCreatorAgent: row.is_official_creator_agent,
    capabilities: row.capabilities ?? [],
    createdAt: row.created_at,
    reputation,
    actionReviews,
  };
}

function mapCredential(row: AgentCredentialRow): AgentCredential {
  return {
    id: row.id,
    agentId: row.agent_id,
    label: row.label,
    tokenPrefix: row.token_prefix,
    scopes: row.scopes ?? [],
    createdAt: row.created_at,
    rotatedAt: row.rotated_at,
    lastUsedAt: row.last_used_at,
    revokedAt: row.revoked_at,
  };
}

async function getAgentReputationMap(agentIds: string[]) {
  const reputationMap = new Map<string, AgentReputation>();

  if (!agentIds.length) {
    return reputationMap;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("agent_reputation_summary")
    .select(
      "agent_id, total_drafts, accepted_drafts, rejected_drafts, submitted_drafts, public_reply_count, reaction_count, run_count, last_successful_run_at, accepted_draft_rate, rejected_draft_rate",
    )
    .in("agent_id", agentIds);

  if (error) {
    throw new Error(`Failed to load agent reputation: ${error.message}`);
  }

  for (const row of (data ?? []) as AgentReputationRow[]) {
    reputationMap.set(row.agent_id, {
      totalDrafts: row.total_drafts ?? 0,
      acceptedDrafts: row.accepted_drafts ?? 0,
      rejectedDrafts: row.rejected_drafts ?? 0,
      submittedDrafts: row.submitted_drafts ?? 0,
      publicReplyCount: row.public_reply_count ?? 0,
      reactionCount: row.reaction_count ?? 0,
      runCount: row.run_count ?? 0,
      lastSuccessfulRunAt: row.last_successful_run_at,
      acceptedDraftRate: normalizeRate(row.accepted_draft_rate),
      rejectedDraftRate: normalizeRate(row.rejected_draft_rate),
    });
  }

  return reputationMap;
}

async function getAgentActionReviewMap(agentIds: string[]) {
  const reviewMap = new Map<string, AgentActionReviewMap>();

  if (!agentIds.length) {
    return reviewMap;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("agent_action_reviews")
    .select("agent_id, action_type, status, note, requested_at, reviewed_at")
    .in("agent_id", agentIds);

  if (error) {
    throw new Error(`Failed to load agent action reviews: ${error.message}`);
  }

  for (const row of (data ?? []) as AgentReviewRow[]) {
    const current = reviewMap.get(row.agent_id) ?? createEmptyAgentActionReviewMap();
    current[row.action_type] = {
      status: row.status,
      note: row.note,
      requestedAt: row.requested_at,
      reviewedAt: row.reviewed_at,
    };
    reviewMap.set(row.agent_id, current);
  }

  return reviewMap;
}

function buildAgentCollectionCountMap(rows: { collection_id: string }[]) {
  const countMap = new Map<string, number>();

  for (const row of rows) {
    countMap.set(row.collection_id, (countMap.get(row.collection_id) ?? 0) + 1);
  }

  return countMap;
}

function logOptionalPublicAgentFailure(label: string, error: unknown) {
  const detail = error instanceof Error ? error.message : String(error);
  console.warn(`[agents] ${label} unavailable for public pages: ${detail}`);
}

async function loadOptionalPublicAgentData<T>(
  label: string,
  loader: () => Promise<T>,
  fallback: T,
) {
  try {
    return await loader();
  } catch (error) {
    logOptionalPublicAgentFailure(label, error);
    return fallback;
  }
}

async function getOptionalPublicAgentDecorators(agentIds: string[]) {
  const [reputationMap, actionReviewMap] = await Promise.all([
    loadOptionalPublicAgentData(
      "agent reputation",
      () => getAgentReputationMap(agentIds),
      new Map<string, AgentReputation>(),
    ),
    loadOptionalPublicAgentData(
      "agent action reviews",
      () => getAgentActionReviewMap(agentIds),
      new Map<string, AgentActionReviewMap>(),
    ),
  ]);

  return {
    reputationMap,
    actionReviewMap,
  };
}

function getPublicActionLabel(actionType: AgentPublicAction) {
  return actionType === "comment" ? "public replies" : "public reactions";
}

async function getRecentActionCount(agentId: string, actionType: AgentPublicAction, sinceIso: string) {
  const supabase = createSupabaseAdminClient();
  const { count, error } = await supabase
    .from("agent_runs")
    .select("*", { count: "exact", head: true })
    .eq("agent_id", agentId)
    .eq("endpoint", actionType)
    .gte("created_at", sinceIso);

  if (error) {
    throw new Error(`Failed to inspect agent rate limits: ${error.message}`);
  }

  return count ?? 0;
}

async function ensurePendingActionReview(agentId: string, actionType: AgentPublicAction) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("agent_action_reviews").insert({
    agent_id: agentId,
    action_type: actionType,
    status: "pending",
  });

  if (error && error.code !== "23505") {
    throw new Error(`Failed to queue agent review: ${error.message}`);
  }
}

export function createAgentAccessToken() {
  const secret = `svagent_${randomBytes(24).toString("base64url")}`;

  return {
    secret,
    prefix: secret.slice(0, 12),
    hash: hashAgentToken(secret),
  };
}

export async function getOwnedAgents(ownerProfileId: string): Promise<OwnedAgent[]> {
  const supabase = createSupabaseAdminClient();
  const { data: agentsData, error: agentsError } = await supabase
    .from("agents")
    .select(
      "id, owner_profile_id, creator_id, name, slug, description, agent_type, trust_level, status, is_official_creator_agent, capabilities, created_at",
    )
    .eq("owner_profile_id", ownerProfileId)
    .order("created_at", { ascending: false });

  if (agentsError) {
    throw new Error(`Failed to load owned agents: ${agentsError.message}`);
  }

  const agentIds = (agentsData ?? []).map((row) => row.id as string);
  const [{ data: credentialsData, error: credentialsError }, reputationMap, actionReviewMap] =
    await Promise.all([
      agentIds.length
        ? supabase
            .from("agent_credentials")
            .select("id, agent_id, label, token_prefix, scopes, created_at, rotated_at, last_used_at, revoked_at")
            .in("agent_id", agentIds)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
      getAgentReputationMap(agentIds),
      getAgentActionReviewMap(agentIds),
    ]);

  if (credentialsError) {
    throw new Error(`Failed to load agent credentials: ${credentialsError.message}`);
  }

  const agents = (agentsData ?? []).map((row) =>
    mapAgent(
      row as AgentRow,
      reputationMap.get(row.id as string),
      actionReviewMap.get(row.id as string),
    ),
  );
  const credentialsByAgentId = new Map<string, AgentCredential[]>();

  for (const credential of (credentialsData ?? []) as AgentCredentialRow[]) {
    credentialsByAgentId.set(credential.agent_id, [
      ...(credentialsByAgentId.get(credential.agent_id) ?? []),
      mapCredential(credential),
    ]);
  }

  return agents.map((agent) => ({
    ...agent,
    credentials: credentialsByAgentId.get(agent.id) ?? [],
  }));
}

export async function getOfficialAgentsForCreator(creatorId: string | null | undefined) {
  if (!creatorId) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("agents")
    .select(
      "id, owner_profile_id, creator_id, name, slug, description, agent_type, trust_level, status, is_official_creator_agent, capabilities, created_at",
    )
    .eq("creator_id", creatorId)
    .eq("status", "active")
    .eq("is_official_creator_agent", true)
    .order("trust_level", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load official agents: ${error.message}`);
  }

  const agentIds = (data ?? []).map((row) => row.id as string);
  const { reputationMap, actionReviewMap } = await getOptionalPublicAgentDecorators(agentIds);

  return (data ?? []).map((row) =>
    mapAgent(
      row as AgentRow,
      reputationMap.get(row.id as string),
      actionReviewMap.get(row.id as string),
    ),
  );
}

export async function getPublicAgents(limit?: number) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("agents")
    .select(
      "id, owner_profile_id, creator_id, name, slug, description, agent_type, trust_level, status, is_official_creator_agent, capabilities, created_at",
    )
    .eq("status", "active")
    .order("is_official_creator_agent", { ascending: false })
    .order("created_at", { ascending: false });

  if (typeof limit === "number") {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load public agents: ${error.message}`);
  }

  const agentIds = (data ?? []).map((row) => row.id as string);
  const { reputationMap, actionReviewMap } = await getOptionalPublicAgentDecorators(agentIds);

  return (data ?? []).map((row) =>
    mapAgent(
      row as AgentRow,
      reputationMap.get(row.id as string),
      actionReviewMap.get(row.id as string),
    ),
  );
}

export async function getAgentCurations(agentId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("agent_collection_curations")
    .select("id, note, created_at, collection_id, collections (id, slug, name, description)")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load agent curations: ${error.message}`);
  }

  const collectionIds = (data ?? []).map((row) => row.collection_id as string);
  const { data: membershipRows, error: membershipError } = collectionIds.length
    ? await supabase.from("collection_films").select("collection_id").in("collection_id", collectionIds)
    : { data: [], error: null };

  if (membershipError) {
    throw new Error(`Failed to count curated collection films: ${membershipError.message}`);
  }

  const countMap = buildAgentCollectionCountMap(
    ((membershipRows ?? []) as { collection_id: string }[]),
  );

  return ((data ?? []) as AgentCurationRow[]).map((row) => {
    const collection = firstRelation(row.collections);

    return {
      id: row.id,
      note: row.note,
      createdAt: row.created_at,
      collection: {
        id: collection?.id ?? row.collection_id,
        slug: collection?.slug ?? "collection",
        name: collection?.name ?? "Collection",
        description: collection?.description ?? "",
        countLabel: `${countMap.get(row.collection_id) ?? 0} films`,
      },
    } satisfies AgentCuration;
  });
}

export async function getPublicAgentCuratorRails(limit?: number) {
  const agents = await getPublicAgents();
  const curationsByAgent = await Promise.all(
    agents.map(async (agent) => ({
      agent,
      curations: await getAgentCurations(agent.id),
    })),
  );

  const rails = curationsByAgent
    .filter((entry) => entry.curations.length > 0)
    .map((entry) => ({
      agent: entry.agent,
      curations: entry.curations,
    }));

  return typeof limit === "number" ? rails.slice(0, limit) : rails;
}

export async function getAgentBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("agents")
    .select(
      "id, owner_profile_id, creator_id, name, slug, description, agent_type, trust_level, status, is_official_creator_agent, capabilities, created_at",
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error(`Failed to load agent: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const { reputationMap, actionReviewMap } = await getOptionalPublicAgentDecorators([
    data.id as string,
  ]);

  return mapAgent(
    data as AgentRow,
    reputationMap.get(data.id as string),
    actionReviewMap.get(data.id as string),
  );
}

export async function getFilmAgentState(filmId: string, creatorId?: string | null) {
  const supabase = await createSupabaseServerClient();
  const [officialAgents, agentCommentsResult, reactionResult] = await Promise.all([
    getOfficialAgentsForCreator(creatorId),
    supabase
      .from("comments")
      .select(
        "id, body, created_at, agents (name, trust_level, is_official_creator_agent)",
      )
      .eq("film_id", filmId)
      .eq("author_type", "agent")
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("agent_reactions")
      .select(
        "created_at, signal_type, agents (id, owner_profile_id, creator_id, name, slug, description, agent_type, trust_level, status, is_official_creator_agent, capabilities, created_at)",
      )
      .eq("film_id", filmId),
  ]);

  if (agentCommentsResult.error) {
    throw new Error(`Failed to load agent replies: ${agentCommentsResult.error.message}`);
  }

  if (reactionResult.error) {
    throw new Error(`Failed to load agent reactions: ${reactionResult.error.message}`);
  }

  const agentComments = ((agentCommentsResult.data ?? []) as AgentCommentRow[]).map((row) => {
    const agent = firstRelation(row.agents);

    return {
      id: row.id,
      body: row.body,
      createdAt: row.created_at,
      author: agent?.name ?? "Agent",
      trustLevel: agent?.trust_level ?? "sandbox",
      isOfficial: agent?.is_official_creator_agent ?? false,
    } satisfies AgentComment;
  });

  const presenceMap = new Map<string, FilmAgentPresence>();
  for (const agent of officialAgents) {
    presenceMap.set(agent.id, {
      id: agent.id,
      name: agent.name,
      slug: agent.slug,
      trustLevel: agent.trustLevel,
      isOfficialCreatorAgent: agent.isOfficialCreatorAgent,
      activityLabel: "creator companion",
    });
  }

  for (const reaction of reactionResult.data ?? []) {
    const agent = firstRelation(
      reaction.agents as AgentRow | AgentRow[] | null,
    );

    if (!agent) {
      continue;
    }

    presenceMap.set(agent.id, {
      id: agent.id,
      name: agent.name,
      slug: agent.slug,
      trustLevel: agent.trust_level,
      isOfficialCreatorAgent: agent.is_official_creator_agent,
      activityLabel: reaction.signal_type === "interested" ? "signaled interest" : "active",
    });
  }

  for (const comment of agentComments) {
    const existing = [...presenceMap.values()].find((entry) => entry.name === comment.author);
    if (existing) {
      existing.activityLabel = "replying";
    }
  }

  return {
    officialAgents,
    agentComments,
    reactionCount: reactionResult.data?.length ?? 0,
    agentsWatching: [...presenceMap.values()].slice(0, 6),
  };
}

export async function authenticateAgentRequest(requiredScope: string) {
  const requestHeaders = await headers();
  const authorization = requestHeaders.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("agents")
    .select(
      "id, owner_profile_id, creator_id, name, slug, description, agent_type, trust_level, status, is_official_creator_agent, capabilities, created_at, agent_credentials!inner (id, scopes, token_hash, revoked_at)",
    )
    .eq("status", "active")
    .eq("agent_credentials.token_hash", hashAgentToken(token))
    .is("agent_credentials.revoked_at", null)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as AgentLookupRow;
  const credential = firstRelation(row.agent_credentials);

  if (!credential) {
    return null;
  }

  const scopes = credential.scopes ?? [];

  if (!scopes.includes(requiredScope)) {
    return null;
  }

  const agent = mapAgent(row);

  await supabase
    .from("agent_credentials")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", credential.id);

  return {
    agent,
    scopes,
    credentialId: credential.id,
  };
}

export async function checkAgentPublicActionPolicy(
  agent: Agent,
  actionType: AgentPublicAction,
): Promise<PublicActionPolicyResult> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("agent_action_reviews")
    .select("status, note, requested_at, reviewed_at")
    .eq("agent_id", agent.id)
    .eq("action_type", actionType)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to inspect agent action review state: ${error.message}`);
  }

  const review = data as
    | {
        status: Exclude<AgentActionReviewStatus, "none">;
        note: string | null;
        requested_at: string;
        reviewed_at: string | null;
      }
    | null;

  if (!review) {
    await ensurePendingActionReview(agent.id, actionType);

    return {
      ok: false,
      statusCode: 403,
      reason: `${actionType}-review-pending`,
      error: `This agent's ${getPublicActionLabel(actionType)} are pending first-action admin review.`,
    };
  }

  if (review.status === "pending") {
    return {
      ok: false,
      statusCode: 403,
      reason: `${actionType}-review-pending`,
      error: `This agent's ${getPublicActionLabel(actionType)} are still pending admin review.`,
    };
  }

  if (review.status === "rejected") {
    return {
      ok: false,
      statusCode: 403,
      reason: `${actionType}-review-rejected`,
      error: review.note
        ? `Public ${actionType} access is disabled for this agent: ${review.note}`
        : `Public ${actionType} access is disabled for this agent.`,
    };
  }

  const limits = publicActionRateLimits[actionType];
  const now = Date.now();
  const [recentTenMinuteCount, recentHourCount] = await Promise.all([
    getRecentActionCount(agent.id, actionType, new Date(now - 10 * 60 * 1000).toISOString()),
    getRecentActionCount(agent.id, actionType, new Date(now - 60 * 60 * 1000).toISOString()),
  ]);

  if (
    recentTenMinuteCount >= limits.perTenMinutes ||
    recentHourCount >= limits.perHour
  ) {
    return {
      ok: false,
      statusCode: 429,
      reason: `${actionType}-rate-limited`,
      error: `Rate limit reached for ${getPublicActionLabel(actionType)}. Try again later.`,
    };
  }

  return { ok: true };
}

export async function logAgentRun(
  agentId: string,
  endpoint: string,
  status: string,
  metadata: Record<string, unknown>,
) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("agent_runs").insert({
    agent_id: agentId,
    endpoint,
    status,
    metadata,
  });
}

export async function createUniqueAgentSlug(baseName: string) {
  const supabase = createSupabaseAdminClient();
  const baseSlug = slugify(baseName) || "agent";
  let slug = baseSlug;
  let suffix = 2;

  for (;;) {
    const { data, error } = await supabase
      .from("agents")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to check agent slug: ${error.message}`);
    }

    if (!data) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

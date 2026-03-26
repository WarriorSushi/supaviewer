import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentSessionProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildYouTubeThumbnailUrl } from "@/lib/youtube";

export type WatchEventStatus = "scheduled" | "live" | "ended" | "cancelled";
export type WatchAttendeeType = "human" | "agent";
export type WatchPresenceState = "watching" | "taking-notes" | "answering-questions" | "hosting" | "away";
export type WatchEventModerationAction =
  | "remove-message"
  | "mute-attendee"
  | "unmute-attendee"
  | "highlight-message"
  | "remove-highlight";

export type WatchEventFilm = {
  id: string;
  serial: number;
  slug: string;
  title: string;
  creatorName: string;
  creatorSlug: string;
  runtimeMinutes: number;
  releaseYear: number | null;
  genre: string;
  youtubeUrl: string;
  thumbnailUrl: string;
};

export type WatchEventAgent = {
  id: string;
  name: string;
  slug: string;
  trustLevel: "sandbox" | "trusted" | "official" | "editorial";
  isOfficialCreatorAgent: boolean;
};

export type WatchEventAttendee = {
  id: string;
  eventId: string;
  attendeeType: WatchAttendeeType;
  displayName: string;
  profileId: string | null;
  presenceState: WatchPresenceState;
  trustLevel: WatchEventAgent["trustLevel"] | null;
  isOfficialCreatorAgent: boolean;
  isHost: boolean;
  isMuted: boolean;
  joinedAt: string;
  lastSeenAt: string;
  agentSlug: string | null;
};

export type WatchEventMessage = {
  id: string;
  eventId: string;
  authorType: WatchAttendeeType;
  displayName: string;
  profileId: string | null;
  body: string;
  trustLevel: WatchEventAgent["trustLevel"] | null;
  isOfficialCreatorAgent: boolean;
  createdAt: string;
  agentSlug: string | null;
};

export type WatchEventAnalytics = {
  peakHumanCount: number;
  peakAgentCount: number;
  totalMessages: number;
  humanMessageCount: number;
  agentMessageCount: number;
  replayInterestCount: number;
  shareCount: number;
};

export type WatchEventAnalyticsSnapshot = {
  id: string;
  eventId: string;
  humanCount: number;
  agentCount: number;
  totalMessageCount: number;
  replayInterestCount: number;
  shareCount: number;
  capturedAt: string;
};

export type WatchEventReplayHighlight = {
  id: string;
  eventId: string;
  sourceMessageId: string | null;
  sourceAuthorType: WatchAttendeeType | null;
  sourceDisplayName: string | null;
  sourceBody: string | null;
  title: string;
  note: string;
  createdByProfileId: string | null;
  createdByDisplayName: string;
  highlightedAt: string;
};

export type WatchEventModerationEntry = {
  id: string;
  eventId: string;
  actorProfileId: string | null;
  actorDisplayName: string;
  action: WatchEventModerationAction;
  targetProfileId: string | null;
  targetMessageId: string | null;
  targetDisplayName: string | null;
  reason: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type WatchEventSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string | null;
  status: WatchEventStatus;
  phase: WatchEventStatus;
  film: Pick<WatchEventFilm, "id" | "serial" | "slug" | "title" | "thumbnailUrl">;
  officialAgent: WatchEventAgent | null;
  humanAttendeeCount: number;
  agentAttendeeCount: number;
  liveHumanCount: number;
  liveAgentCount: number;
  analytics: WatchEventAnalytics;
  latestSnapshot: WatchEventAnalyticsSnapshot | null;
  latestActivityAt: string;
  topReplayHighlight: WatchEventReplayHighlight | null;
  latestModerationEntry: WatchEventModerationEntry | null;
  replayHighlightCount: number;
  moderationActionCount: number;
};

export type WatchEvent = WatchEventSummary & {
  createdAt: string;
  film: WatchEventFilm;
  creator: {
    id: string;
    slug: string;
    name: string;
  } | null;
  host: {
    id: string;
    displayName: string;
  } | null;
  attendees: WatchEventAttendee[];
  messages: WatchEventMessage[];
  analyticsHistory: WatchEventAnalyticsSnapshot[];
  replayHighlights: WatchEventReplayHighlight[];
  moderationHistory: WatchEventModerationEntry[];
  canModerate: boolean;
};

export type StudioWatchFilmOption = Pick<
  WatchEventFilm,
  "id" | "serial" | "slug" | "title" | "thumbnailUrl"
> & {
  runtimeMinutes: number;
};

type WatchEventRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  film_id: string;
  creator_id: string | null;
  host_profile_id: string | null;
  official_agent_id: string | null;
  starts_at: string;
  ends_at: string | null;
  status: WatchEventStatus;
  created_at: string;
  actual_started_at: string | null;
  actual_ended_at: string | null;
  cancelled_at: string | null;
  peak_human_count: number;
  peak_agent_count: number;
};

type WatchEventAttendeeRow = {
  id: string;
  event_id: string;
  attendee_type: WatchAttendeeType;
  display_name: string;
  profile_id: string | null;
  agent_slug: string | null;
  presence_state: WatchPresenceState;
  trust_level: WatchEventAgent["trustLevel"] | null;
  is_official_creator_agent: boolean;
  is_host: boolean;
  joined_at: string;
  last_seen_at: string;
  agent_id: string | null;
};

type WatchEventMessageRow = {
  id: string;
  event_id: string;
  author_type: WatchAttendeeType;
  display_name: string;
  profile_id: string | null;
  agent_slug: string | null;
  body: string;
  trust_level: WatchEventAgent["trustLevel"] | null;
  is_official_creator_agent: boolean;
  created_at: string;
  agent_id: string | null;
};

type WatchEventAnalyticsMessageRow = {
  event_id: string;
  author_type: WatchAttendeeType;
};

type WatchEventMuteRow = {
  event_id: string;
  profile_id: string;
};

type WatchEventLifecycleRow = {
  id: string;
  slug: string;
  film_id: string;
  host_profile_id: string | null;
  official_agent_id: string | null;
  status: WatchEventStatus;
  starts_at: string;
  ends_at: string | null;
  actual_started_at: string | null;
  actual_ended_at: string | null;
  cancelled_at: string | null;
};

type WatchEventAnalyticsSnapshotRow = {
  id: string;
  event_id: string;
  human_count: number;
  agent_count: number;
  total_message_count: number;
  replay_interest_count: number;
  share_count: number;
  captured_at: string;
};

type WatchEventReplayHighlightRow = {
  id: string;
  event_id: string;
  source_message_id: string | null;
  source_author_type: WatchAttendeeType | null;
  source_display_name: string | null;
  source_body: string | null;
  title: string;
  note: string;
  created_by_profile_id: string | null;
  created_by_display_name: string;
  highlighted_at: string;
};

type WatchEventModerationEntryRow = {
  id: string;
  event_id: string;
  actor_profile_id: string | null;
  actor_display_name: string;
  action: WatchEventModerationAction;
  target_profile_id: string | null;
  target_message_id: string | null;
  target_display_name: string | null;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type CreatorRow = {
  id: string;
  slug: string;
  name: string;
};

type ProfileRow = {
  id: string;
  display_name: string;
};

type AgentRow = {
  id: string;
  name: string;
  slug: string;
  trust_level: WatchEventAgent["trustLevel"];
  is_official_creator_agent: boolean;
};

type FilmRow = {
  id: string;
  serial_number: number;
  slug: string;
  title: string;
  runtime_minutes: number;
  release_year: number | null;
  genre: string;
  youtube_url: string;
  creators:
    | {
        slug: string;
        name: string;
      }
    | {
        slug: string;
        name: string;
      }[]
    | null;
};

export type WatchEventLifecycleRecord = {
  id: string;
  slug: string;
  filmId: string;
  hostProfileId: string | null;
  officialAgentId: string | null;
  status: WatchEventStatus;
  phase: WatchEventStatus;
  startsAt: string;
  endsAt: string | null;
  actualStartedAt: string | null;
  actualEndedAt: string | null;
  cancelledAt: string | null;
};

type WatchEventInteractionKind = "presence" | "message" | "replay-interest";
type WatchEventActorType = "human" | "agent";

const WATCH_EVENT_LIFECYCLE_SELECT =
  "id, slug, film_id, host_profile_id, official_agent_id, status, starts_at, ends_at, actual_started_at, actual_ended_at, cancelled_at";

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

export function buildWatchEventHref(event: Pick<WatchEventSummary, "slug">) {
  return `/watch/${event.slug}`;
}

export function getWatchEventStatusLabel(event: Pick<WatchEventSummary, "phase">) {
  if (event.phase === "live") {
    return "Premiere now";
  }

  if (event.phase === "ended") {
    return "Replay requested";
  }

  if (event.phase === "cancelled") {
    return "Premiere cancelled";
  }

  return "Premiere scheduled";
}

export function getWatchEventPrimaryAction(
  event: Pick<WatchEventSummary, "phase" | "startsAt" | "officialAgent" | "topReplayHighlight">,
) {
  if (event.phase === "live") {
    return {
      eyebrow: "Do this first",
      title: "Press play, then keep the human rail open.",
      description:
        "Start inside the room with humans visible. Open the agent layer only when you want companion context, not background noise.",
      ctaLabel: "Open live room",
    };
  }

  if (event.phase === "ended") {
    return {
      eyebrow: "Do this first",
      title: "Re-enter through the replay dossier.",
      description: event.topReplayHighlight
        ? `${event.topReplayHighlight.sourceDisplayName ?? "The room"} pinned the strongest moment so you can pick up the story fast.`
        : "Open the room archive for replay markers, room curve, and visible moderator history.",
      ctaLabel: "Open replay room",
    };
  }

  if (event.phase === "cancelled") {
    return {
      eyebrow: "Do this first",
      title: "Check the archive before resharing this room.",
      description:
        "This room is no longer going live, but the canonical page still preserves what was scheduled and any replay context already attached.",
      ctaLabel: "Open room archive",
    };
  }

  return {
    eyebrow: "Do this first",
    title: "Save the canonical room URL and show up on time.",
    description: event.officialAgent
      ? `The room is already live as a shareable object, with ${event.officialAgent.name} attached as the official companion once the premiere starts.`
      : "Share the room URL now so the audience lands in the canonical premiere object instead of a raw source link.",
    ctaLabel: "Open scheduled room",
  };
}

export function getWatchEventAudienceSummary(
  event: Pick<
    WatchEventSummary,
    "phase" | "startsAt" | "liveHumanCount" | "liveAgentCount" | "humanAttendeeCount" | "agentAttendeeCount" | "analytics"
  >,
) {
  if (event.phase === "live") {
    return `${event.liveHumanCount} humans live with ${event.liveAgentCount} agents in the companion rail.`;
  }

  if (event.phase === "scheduled") {
    return `${event.humanAttendeeCount} humans and ${event.agentAttendeeCount} agents have already touched the room before kickoff.`;
  }

  return `Peak room load reached ${event.analytics.peakHumanCount} humans and ${event.analytics.peakAgentCount} agents.`;
}

export function getWatchEventConversationSummary(
  event: Pick<WatchEventSummary, "analytics" | "replayHighlightCount" | "moderationActionCount">,
) {
  const { humanMessageCount, agentMessageCount, replayInterestCount, shareCount } = event.analytics;

  if (humanMessageCount === 0 && agentMessageCount === 0) {
    return replayInterestCount
      ? `${replayInterestCount} replay request${replayInterestCount === 1 ? "" : "s"} so far.`
      : "The room is still waiting for its first readable reaction.";
  }

  return `${humanMessageCount} human reactions, ${agentMessageCount} companion notes, ${event.replayHighlightCount} replay markers, and ${shareCount} room share${shareCount === 1 ? "" : "s"}.`;
}

export function getWatchEventReplayLead(
  event: Pick<WatchEventSummary, "topReplayHighlight" | "replayHighlightCount" | "moderationActionCount" | "latestModerationEntry">,
) {
  if (event.topReplayHighlight?.sourceBody) {
    return event.topReplayHighlight.sourceBody;
  }

  if (event.topReplayHighlight) {
    return event.topReplayHighlight.note || "Pinned into the replay dossier for fast re-entry.";
  }

  if (event.latestModerationEntry?.reason) {
    return event.latestModerationEntry.reason;
  }

  if (event.replayHighlightCount > 0) {
    return `${event.replayHighlightCount} replay marker${event.replayHighlightCount === 1 ? "" : "s"} saved from the room.`;
  }

  if (event.moderationActionCount > 0) {
    return `${event.moderationActionCount} visible moderator action${event.moderationActionCount === 1 ? "" : "s"} kept the room readable.`;
  }

  return "No replay dossier yet. The room still keeps the canonical attendance curve and watch context together.";
}

export function getWatchEventModerationActionLabel(action: WatchEventModerationAction) {
  switch (action) {
    case "remove-message":
      return "Message removed";
    case "mute-attendee":
      return "Attendee muted";
    case "unmute-attendee":
      return "Attendee unmuted";
    case "highlight-message":
      return "Replay marker pinned";
    case "remove-highlight":
      return "Replay marker removed";
    default:
      return "Moderator action";
  }
}

export function getWatchEventPhase(
  status: WatchEventStatus,
  startsAt: string,
  endsAt: string | null,
  now = new Date(),
): WatchEventStatus {
  if (status === "cancelled") {
    return "cancelled";
  }

  if (status === "ended") {
    return "ended";
  }

  const start = new Date(startsAt);
  const end = endsAt ? new Date(endsAt) : null;

  if (end && now >= end) {
    return "ended";
  }

  if (now >= start) {
    return "live";
  }

  return "scheduled";
}

function mapWatchEventLifecycle(row: WatchEventLifecycleRow): WatchEventLifecycleRecord {
  return {
    id: row.id,
    slug: row.slug,
    filmId: row.film_id,
    hostProfileId: row.host_profile_id,
    officialAgentId: row.official_agent_id,
    status: row.status,
    phase: getWatchEventPhase(row.status, row.starts_at, row.ends_at),
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    actualStartedAt: row.actual_started_at,
    actualEndedAt: row.actual_ended_at,
    cancelledAt: row.cancelled_at,
  };
}

export async function resolveWatchEventRecord(input: {
  eventId?: string | null;
  eventSlug?: string | null;
}) {
  const eventId = input.eventId?.trim() ?? "";
  const eventSlug = input.eventSlug?.trim() ?? "";

  if (!eventId && !eventSlug) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const query = supabase.from("watch_events").select(WATCH_EVENT_LIFECYCLE_SELECT).limit(1);
  const { data, error } = eventId
    ? await query.eq("id", eventId).maybeSingle()
    : await query.eq("slug", eventSlug).maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to resolve watch event: ${error.message}`);
  }

  return data ? mapWatchEventLifecycle(data as WatchEventLifecycleRow) : null;
}

export function getWatchEventInteractionError(
  event: Pick<WatchEventLifecycleRecord, "phase">,
  input: {
    actorType: WatchEventActorType;
    kind: WatchEventInteractionKind;
  },
) {
  if (input.kind === "replay-interest") {
    if (event.phase === "scheduled" || event.phase === "live") {
      return {
        statusCode: 409,
        error: "Replay requests open after the live premiere ends.",
      };
    }

    return null;
  }

  if (event.phase === "ended") {
    return {
      statusCode: 409,
      error:
        input.kind === "presence"
          ? "This room is now in replay mode. Live presence is closed."
          : input.actorType === "agent"
            ? "This room is now in replay mode. Companion posting is closed."
            : "This room is now in replay mode. Live chat is closed.",
    };
  }

  if (event.phase === "cancelled") {
    return {
      statusCode: 409,
      error:
        input.actorType === "agent"
          ? "Cancelled rooms do not accept companion activity."
          : "Cancelled rooms do not accept live room activity.",
    };
  }

  return null;
}

export async function upsertHumanWatchEventAttendee(input: {
  event: Pick<WatchEventLifecycleRecord, "id" | "hostProfileId">;
  profileId: string;
  displayName: string;
  presenceState: WatchPresenceState;
}) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("watch_event_attendees")
    .upsert(
      {
        event_id: input.event.id,
        profile_id: input.profileId,
        attendee_type: "human",
        display_name: input.displayName,
        agent_slug: null,
        presence_state: input.presenceState,
        trust_level: null,
        is_official_creator_agent: false,
        is_host: input.event.hostProfileId === input.profileId,
        last_seen_at: new Date().toISOString(),
      },
      {
        onConflict: "event_id,profile_id",
      },
    )
    .select(
      "id, event_id, attendee_type, display_name, profile_id, agent_slug, presence_state, trust_level, is_official_creator_agent, is_host, joined_at, last_seen_at, agent_id",
    )
    .maybeSingle();

  if (error || !data) {
    throw new Error(`Failed to upsert human watch attendee: ${error?.message ?? "upsert-failed"}`);
  }

  return data as WatchEventAttendeeRow;
}

export async function upsertAgentWatchEventAttendee(input: {
  event: Pick<WatchEventLifecycleRecord, "id" | "officialAgentId">;
  agentId: string;
  agentSlug: string;
  displayName: string;
  presenceState: WatchPresenceState;
  trustLevel: WatchEventAgent["trustLevel"];
  isOfficialCreatorAgent: boolean;
}) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("watch_event_attendees")
    .upsert(
      {
        event_id: input.event.id,
        agent_id: input.agentId,
        agent_slug: input.agentSlug,
        attendee_type: "agent",
        display_name: input.displayName,
        presence_state: input.presenceState,
        trust_level: input.trustLevel,
        is_official_creator_agent: input.isOfficialCreatorAgent,
        is_host: input.event.officialAgentId === input.agentId,
        last_seen_at: new Date().toISOString(),
      },
      {
        onConflict: "event_id,agent_id",
      },
    )
    .select(
      "id, event_id, attendee_type, display_name, profile_id, agent_slug, presence_state, trust_level, is_official_creator_agent, is_host, joined_at, last_seen_at, agent_id",
    )
    .maybeSingle();

  if (error || !data) {
    throw new Error(`Failed to upsert agent watch attendee: ${error?.message ?? "upsert-failed"}`);
  }

  return data as WatchEventAttendeeRow;
}

export async function finalizeWatchEventActivity(
  eventId: string,
  options?: {
    refreshPeaks?: boolean;
    captureSnapshot?: boolean;
  },
) {
  const refreshPeaks = options?.refreshPeaks ?? true;
  const captureSnapshot = options?.captureSnapshot ?? true;

  if (captureSnapshot) {
    await captureWatchEventAnalyticsSnapshot(eventId);
    return;
  }

  if (refreshPeaks) {
    await refreshWatchEventPeakCounts(eventId);
  }
}

export async function getWatchEventModeratorContext(eventId: string) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    return { profile: null, event: null } as const;
  }

  const event = await resolveWatchEventRecord({ eventId });

  if (!event) {
    return { profile, event: null } as const;
  }

  if (profile.role !== "admin" && event.hostProfileId !== profile.id) {
    return { profile: null, event: null } as const;
  }

  return { profile, event } as const;
}

export function getWatchEventHostMutationError(
  event: Pick<WatchEventLifecycleRecord, "phase">,
  action: "update-schedule" | "start-now" | "end-now" | "cancel",
) {
  if (action === "update-schedule") {
    if (event.phase === "ended") {
      return "Ended rooms can be polished, but not rescheduled.";
    }

    return null;
  }

  if (action === "start-now") {
    if (event.phase === "live") {
      return "This room is already live.";
    }

    if (event.phase === "ended") {
      return "Ended rooms cannot be restarted.";
    }

    if (event.phase === "cancelled") {
      return "Reschedule this room before starting it again.";
    }

    return null;
  }

  if (action === "end-now") {
    return event.phase === "live" ? null : "Only live rooms can be ended.";
  }

  if (event.phase === "ended") {
    return "Ended rooms cannot be cancelled.";
  }

  if (event.phase === "cancelled") {
    return "This room is already cancelled.";
  }

  return null;
}

export function buildScheduledWatchEventLifecycle(
  startsAtIso: string,
  endsAtIso: string,
  now = new Date(),
) {
  const nextPhase = getWatchEventPhase("scheduled", startsAtIso, endsAtIso, now);

  return {
    starts_at: startsAtIso,
    ends_at: endsAtIso,
    status: nextPhase === "live" ? ("live" satisfies WatchEventStatus) : ("scheduled" satisfies WatchEventStatus),
    actual_started_at: nextPhase === "live" ? startsAtIso : null,
    actual_ended_at: null,
    cancelled_at: null,
  };
}

export function buildUpdatedWatchEventLifecycle(
  event: Pick<
    WatchEventLifecycleRecord,
    "phase" | "status" | "startsAt" | "endsAt" | "actualStartedAt" | "actualEndedAt" | "cancelledAt"
  >,
  startsAtIso: string,
  endsAtIso: string,
  now = new Date(),
) {
  if (event.phase === "scheduled" || event.phase === "cancelled") {
    const nextPhase = getWatchEventPhase("scheduled", startsAtIso, endsAtIso, now);

    return {
      starts_at: startsAtIso,
      ends_at: endsAtIso,
      status: nextPhase === "live" ? ("live" satisfies WatchEventStatus) : ("scheduled" satisfies WatchEventStatus),
      actual_started_at: nextPhase === "live" ? event.actualStartedAt ?? startsAtIso : null,
      actual_ended_at: null,
      cancelled_at: null,
    };
  }

  if (event.phase === "live") {
    return {
      starts_at: event.startsAt,
      ends_at: endsAtIso,
      status: "live" satisfies WatchEventStatus,
      actual_started_at: event.actualStartedAt ?? event.startsAt,
      actual_ended_at: null,
      cancelled_at: null,
    };
  }

  return {
    starts_at: event.startsAt,
    ends_at: event.actualEndedAt ?? event.endsAt,
    status: "ended" satisfies WatchEventStatus,
    actual_started_at: event.actualStartedAt,
    actual_ended_at: event.actualEndedAt ?? event.endsAt,
    cancelled_at: event.cancelledAt,
  };
}

export function isActiveWatchAttendee(lastSeenAt: string, now = new Date()) {
  return now.getTime() - new Date(lastSeenAt).getTime() <= 1000 * 60 * 8;
}

function mapAgent(row: AgentRow | null | undefined): WatchEventAgent | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    trustLevel: row.trust_level,
    isOfficialCreatorAgent: row.is_official_creator_agent,
  };
}

function mapFilm(row: FilmRow): WatchEventFilm {
  const creator = firstRelation(row.creators);

  return {
    id: row.id,
    serial: row.serial_number,
    slug: row.slug,
    title: row.title,
    creatorName: creator?.name ?? "Unknown creator",
    creatorSlug: creator?.slug ?? "creator",
    runtimeMinutes: row.runtime_minutes,
    releaseYear: row.release_year,
    genre: row.genre,
    youtubeUrl: row.youtube_url,
    thumbnailUrl: buildYouTubeThumbnailUrl(row.youtube_url),
  };
}

function mapAttendee(
  row: WatchEventAttendeeRow,
  mutedProfileIds: Set<string>,
): WatchEventAttendee {
  return {
    id: row.id,
    eventId: row.event_id,
    attendeeType: row.attendee_type,
    displayName: row.display_name,
    profileId: row.profile_id,
    presenceState: row.presence_state,
    trustLevel: row.trust_level,
    isOfficialCreatorAgent: row.is_official_creator_agent,
    isHost: row.is_host,
    isMuted: row.profile_id ? mutedProfileIds.has(row.profile_id) : false,
    joinedAt: row.joined_at,
    lastSeenAt: row.last_seen_at,
    agentSlug: row.agent_slug,
  };
}

function mapMessage(
  row: WatchEventMessageRow,
): WatchEventMessage {
  return {
    id: row.id,
    eventId: row.event_id,
    authorType: row.author_type,
    displayName: row.display_name,
    profileId: row.profile_id,
    body: row.body,
    trustLevel: row.trust_level,
    isOfficialCreatorAgent: row.is_official_creator_agent,
    createdAt: row.created_at,
    agentSlug: row.agent_slug,
  };
}

function mapAnalyticsSnapshot(
  row: WatchEventAnalyticsSnapshotRow,
): WatchEventAnalyticsSnapshot {
  return {
    id: row.id,
    eventId: row.event_id,
    humanCount: row.human_count,
    agentCount: row.agent_count,
    totalMessageCount: row.total_message_count,
    replayInterestCount: row.replay_interest_count,
    shareCount: row.share_count,
    capturedAt: row.captured_at,
  };
}

function mapReplayHighlight(
  row: WatchEventReplayHighlightRow,
): WatchEventReplayHighlight {
  return {
    id: row.id,
    eventId: row.event_id,
    sourceMessageId: row.source_message_id,
    sourceAuthorType: row.source_author_type,
    sourceDisplayName: row.source_display_name,
    sourceBody: row.source_body,
    title: row.title,
    note: row.note,
    createdByProfileId: row.created_by_profile_id,
    createdByDisplayName: row.created_by_display_name,
    highlightedAt: row.highlighted_at,
  };
}

function mapModerationEntry(
  row: WatchEventModerationEntryRow,
): WatchEventModerationEntry {
  return {
    id: row.id,
    eventId: row.event_id,
    actorProfileId: row.actor_profile_id,
    actorDisplayName: row.actor_display_name,
    action: row.action,
    targetProfileId: row.target_profile_id,
    targetMessageId: row.target_message_id,
    targetDisplayName: row.target_display_name,
    reason: row.reason,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

function createEmptyAnalytics(): WatchEventAnalytics {
  return {
    peakHumanCount: 0,
    peakAgentCount: 0,
    totalMessages: 0,
    humanMessageCount: 0,
    agentMessageCount: 0,
    replayInterestCount: 0,
    shareCount: 0,
  };
}

async function getFilmMapByIds(filmIds: string[]) {
  const filmMap = new Map<string, WatchEventFilm>();

  if (!filmIds.length) {
    return filmMap;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("films")
    .select("id, serial_number, slug, title, runtime_minutes, release_year, genre, youtube_url, creators (slug, name)")
    .in("id", filmIds);

  if (error) {
    throw new Error(`Failed to load watch-event films: ${error.message}`);
  }

  for (const row of (data ?? []) as FilmRow[]) {
    filmMap.set(row.id, mapFilm(row));
  }

  return filmMap;
}

async function getCreatorMapByIds(creatorIds: string[]) {
  const creatorMap = new Map<string, CreatorRow>();

  if (!creatorIds.length) {
    return creatorMap;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("creators")
    .select("id, slug, name")
    .in("id", creatorIds);

  if (error) {
    throw new Error(`Failed to load watch-event creators: ${error.message}`);
  }

  for (const row of (data ?? []) as CreatorRow[]) {
    creatorMap.set(row.id, row);
  }

  return creatorMap;
}

async function getProfileMapByIds(profileIds: string[]) {
  const profileMap = new Map<string, ProfileRow>();

  if (!profileIds.length) {
    return profileMap;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", profileIds);

  if (error) {
    throw new Error(`Failed to load watch-event host profiles: ${error.message}`);
  }

  for (const row of (data ?? []) as ProfileRow[]) {
    profileMap.set(row.id, row);
  }

  return profileMap;
}

async function getAgentMapByIds(agentIds: string[]) {
  const agentMap = new Map<string, AgentRow>();

  if (!agentIds.length) {
    return agentMap;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("agents")
    .select("id, name, slug, trust_level, is_official_creator_agent")
    .in("id", agentIds)
    .eq("status", "active");

  if (error) {
    throw new Error(`Failed to load watch-event agents: ${error.message}`);
  }

  for (const row of (data ?? []) as AgentRow[]) {
    agentMap.set(row.id, row);
  }

  return agentMap;
}

async function getMutedProfileIdsByEvent(eventIds: string[]) {
  const muteMap = new Map<string, Set<string>>();

  if (!eventIds.length) {
    return muteMap;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("watch_event_mutes")
    .select("event_id, profile_id")
    .in("event_id", eventIds);

  if (error) {
    throw new Error(`Failed to load watch-event mutes: ${error.message}`);
  }

  for (const row of (data ?? []) as WatchEventMuteRow[]) {
    const list = muteMap.get(row.event_id) ?? new Set<string>();
    list.add(row.profile_id);
    muteMap.set(row.event_id, list);
  }

  return muteMap;
}

async function getWatchEventAnalyticsMap(eventRows: WatchEventRow[]) {
  const analyticsMap = new Map<string, WatchEventAnalytics>();
  const eventIds = eventRows.map((row) => row.id);

  if (!eventIds.length) {
    return analyticsMap;
  }

  const supabase = createSupabaseAdminClient();
  const [messagesResult, replayResult, shareResult] = await Promise.all([
    supabase
      .from("watch_event_messages")
      .select("event_id, author_type")
      .in("event_id", eventIds),
    supabase
      .from("watch_event_replay_interests")
      .select("event_id")
      .in("event_id", eventIds),
    supabase
      .from("share_events")
      .select("watch_event_id")
      .in("watch_event_id", eventIds),
  ]);

  if (messagesResult.error) {
    throw new Error(`Failed to load watch-event message analytics: ${messagesResult.error.message}`);
  }

  if (replayResult.error) {
    throw new Error(`Failed to load watch-event replay analytics: ${replayResult.error.message}`);
  }

  if (shareResult.error) {
    throw new Error(`Failed to load watch-event share analytics: ${shareResult.error.message}`);
  }

  for (const row of eventRows) {
    analyticsMap.set(row.id, {
      peakHumanCount: row.peak_human_count ?? 0,
      peakAgentCount: row.peak_agent_count ?? 0,
      totalMessages: 0,
      humanMessageCount: 0,
      agentMessageCount: 0,
      replayInterestCount: 0,
      shareCount: 0,
    });
  }

  for (const row of (messagesResult.data ?? []) as WatchEventAnalyticsMessageRow[]) {
    const eventId = row.event_id as string;
    const current = analyticsMap.get(eventId) ?? createEmptyAnalytics();
    current.totalMessages += 1;
    if (row.author_type === "agent") {
      current.agentMessageCount += 1;
    } else {
      current.humanMessageCount += 1;
    }
    analyticsMap.set(eventId, current);
  }

  for (const row of replayResult.data ?? []) {
    const eventId = row.event_id as string;
    const current = analyticsMap.get(eventId) ?? createEmptyAnalytics();
    current.replayInterestCount += 1;
    analyticsMap.set(eventId, current);
  }

  for (const row of shareResult.data ?? []) {
    const eventId = row.watch_event_id as string;
    const current = analyticsMap.get(eventId) ?? createEmptyAnalytics();
    current.shareCount += 1;
    analyticsMap.set(eventId, current);
  }

  return analyticsMap;
}

async function getWatchEventAnalyticsHistoryMap(eventIds: string[], limitPerEvent = 12) {
  const historyMap = new Map<string, WatchEventAnalyticsSnapshot[]>();

  if (!eventIds.length) {
    return historyMap;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("watch_event_analytics_snapshots")
    .select("id, event_id, human_count, agent_count, total_message_count, replay_interest_count, share_count, captured_at")
    .in("event_id", eventIds)
    .order("captured_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load watch-event analytics history: ${error.message}`);
  }

  for (const row of (data ?? []) as WatchEventAnalyticsSnapshotRow[]) {
    const list = historyMap.get(row.event_id) ?? [];
    if (list.length >= limitPerEvent) {
      continue;
    }

    list.push(mapAnalyticsSnapshot(row));
    historyMap.set(row.event_id, list);
  }

  for (const [eventId, snapshots] of historyMap.entries()) {
    historyMap.set(eventId, [...snapshots].reverse());
  }

  return historyMap;
}

async function getWatchEventReplayHighlightsMap(eventIds: string[], limitPerEvent = 10) {
  const highlightMap = new Map<string, WatchEventReplayHighlight[]>();

  if (!eventIds.length) {
    return highlightMap;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("watch_event_replay_highlights")
    .select("id, event_id, source_message_id, source_author_type, source_display_name, source_body, title, note, created_by_profile_id, created_by_display_name, highlighted_at")
    .in("event_id", eventIds)
    .order("highlighted_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load watch-event replay highlights: ${error.message}`);
  }

  for (const row of (data ?? []) as WatchEventReplayHighlightRow[]) {
    const list = highlightMap.get(row.event_id) ?? [];
    if (list.length >= limitPerEvent) {
      continue;
    }

    list.push(mapReplayHighlight(row));
    highlightMap.set(row.event_id, list);
  }

  return highlightMap;
}

async function getWatchEventModerationHistoryMap(eventIds: string[], limitPerEvent = 12) {
  const historyMap = new Map<string, WatchEventModerationEntry[]>();

  if (!eventIds.length) {
    return historyMap;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("watch_event_moderation_history")
    .select("id, event_id, actor_profile_id, actor_display_name, action, target_profile_id, target_message_id, target_display_name, reason, metadata, created_at")
    .in("event_id", eventIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load watch-event moderation history: ${error.message}`);
  }

  for (const row of (data ?? []) as WatchEventModerationEntryRow[]) {
    const list = historyMap.get(row.event_id) ?? [];
    if (list.length >= limitPerEvent) {
      continue;
    }

    list.push(mapModerationEntry(row));
    historyMap.set(row.event_id, list);
  }

  return historyMap;
}

export async function refreshWatchEventPeakCounts(eventId: string) {
  const supabase = createSupabaseAdminClient();
  const cutoff = new Date(Date.now() - 1000 * 60 * 8).toISOString();
  const { data, error } = await supabase
    .from("watch_event_attendees")
    .select("attendee_type")
    .eq("event_id", eventId)
    .gte("last_seen_at", cutoff);

  if (error) {
    throw new Error(`Failed to refresh watch-event peaks: ${error.message}`);
  }

  const currentHumanCount = (data ?? []).filter((row) => row.attendee_type === "human").length;
  const currentAgentCount = (data ?? []).filter((row) => row.attendee_type === "agent").length;

  const { data: event, error: eventError } = await supabase
    .from("watch_events")
    .select("peak_human_count, peak_agent_count")
    .eq("id", eventId)
    .maybeSingle();

  if (eventError || !event) {
    throw new Error(`Failed to load watch-event peak counters: ${eventError?.message ?? "missing-event"}`);
  }

  const nextPeakHumanCount = Math.max(event.peak_human_count ?? 0, currentHumanCount);
  const nextPeakAgentCount = Math.max(event.peak_agent_count ?? 0, currentAgentCount);

  if (nextPeakHumanCount !== event.peak_human_count || nextPeakAgentCount !== event.peak_agent_count) {
    const { error: updateError } = await supabase
      .from("watch_events")
      .update({
        peak_human_count: nextPeakHumanCount,
        peak_agent_count: nextPeakAgentCount,
      })
      .eq("id", eventId);

    if (updateError) {
      throw new Error(`Failed to update watch-event peak counters: ${updateError.message}`);
    }
  }

  return {
    currentHumanCount,
    currentAgentCount,
    peakHumanCount: nextPeakHumanCount,
    peakAgentCount: nextPeakAgentCount,
  };
}

export async function captureWatchEventAnalyticsSnapshot(eventId: string) {
  const supabase = createSupabaseAdminClient();
  const [presence, messagesResult, replayResult, shareResult, latestSnapshotResult] = await Promise.all([
    refreshWatchEventPeakCounts(eventId),
    supabase.from("watch_event_messages").select("id", { count: "exact", head: true }).eq("event_id", eventId),
    supabase.from("watch_event_replay_interests").select("id", { count: "exact", head: true }).eq("event_id", eventId),
    supabase.from("share_events").select("id", { count: "exact", head: true }).eq("watch_event_id", eventId),
    supabase
      .from("watch_event_analytics_snapshots")
      .select("id, human_count, agent_count, total_message_count, replay_interest_count, share_count, captured_at")
      .eq("event_id", eventId)
      .order("captured_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (messagesResult.error || replayResult.error || shareResult.error) {
    throw new Error("Failed to capture watch-event analytics snapshot.");
  }

  if (latestSnapshotResult.error && latestSnapshotResult.error.code !== "PGRST116") {
    throw new Error(`Failed to read the latest watch-event analytics snapshot: ${latestSnapshotResult.error.message}`);
  }

  const nextSnapshot = {
    human_count: presence.currentHumanCount,
    agent_count: presence.currentAgentCount,
    total_message_count: messagesResult.count ?? 0,
    replay_interest_count: replayResult.count ?? 0,
    share_count: shareResult.count ?? 0,
  };

  const latestSnapshot = latestSnapshotResult.data as
    | {
        id: string;
        human_count: number;
        agent_count: number;
        total_message_count: number;
        replay_interest_count: number;
        share_count: number;
        captured_at: string;
      }
    | null;

  if (latestSnapshot) {
    const withinRecentWindow =
      Date.now() - new Date(latestSnapshot.captured_at).getTime() < 1000 * 60 * 2;
    const unchanged =
      latestSnapshot.human_count === nextSnapshot.human_count &&
      latestSnapshot.agent_count === nextSnapshot.agent_count &&
      latestSnapshot.total_message_count === nextSnapshot.total_message_count &&
      latestSnapshot.replay_interest_count === nextSnapshot.replay_interest_count &&
      latestSnapshot.share_count === nextSnapshot.share_count;

    if (withinRecentWindow && unchanged) {
      return latestSnapshot.id;
    }
  }

  const { data, error } = await supabase
    .from("watch_event_analytics_snapshots")
    .insert({
      event_id: eventId,
      ...nextSnapshot,
      captured_at: new Date().toISOString(),
    })
    .select("id")
    .maybeSingle();

  if (error || !data) {
    throw new Error(`Failed to persist watch-event analytics snapshot: ${error?.message ?? "insert-failed"}`);
  }

  return data.id as string;
}

export async function logWatchEventModerationAction(input: {
  eventId: string;
  actorProfileId: string;
  actorDisplayName: string;
  action: WatchEventModerationAction;
  reason?: string | null;
  targetProfileId?: string | null;
  targetMessageId?: string | null;
  targetDisplayName?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("watch_event_moderation_history")
    .insert({
      event_id: input.eventId,
      actor_profile_id: input.actorProfileId,
      actor_display_name: input.actorDisplayName,
      action: input.action,
      reason: input.reason ?? null,
      target_profile_id: input.targetProfileId ?? null,
      target_message_id: input.targetMessageId ?? null,
      target_display_name: input.targetDisplayName ?? null,
      metadata: input.metadata ?? {},
    })
    .select("id, event_id, actor_profile_id, actor_display_name, action, target_profile_id, target_message_id, target_display_name, reason, metadata, created_at")
    .maybeSingle();

  if (error || !data) {
    throw new Error(`Failed to log watch-event moderation history: ${error?.message ?? "insert-failed"}`);
  }

  return mapModerationEntry(data as WatchEventModerationEntryRow);
}

function buildSummary(
  row: WatchEventRow,
  film: WatchEventFilm,
  officialAgent: WatchEventAgent | null,
  attendees: WatchEventAttendee[],
  analytics: WatchEventAnalytics = createEmptyAnalytics(),
  analyticsHistory: WatchEventAnalyticsSnapshot[] = [],
  replayHighlights: WatchEventReplayHighlight[] = [],
  moderationHistory: WatchEventModerationEntry[] = [],
): WatchEventSummary {
  const phase = getWatchEventPhase(row.status, row.starts_at, row.ends_at);
  const humanAttendees = attendees.filter((attendee) => attendee.attendeeType === "human");
  const agentAttendees = attendees.filter((attendee) => attendee.attendeeType === "agent");
  const liveHumanCount = humanAttendees.filter((attendee) => isActiveWatchAttendee(attendee.lastSeenAt)).length;
  const liveAgentCount = agentAttendees.filter((attendee) => isActiveWatchAttendee(attendee.lastSeenAt)).length;
  const latestSnapshot = analyticsHistory.at(-1) ?? null;
  const topReplayHighlight = replayHighlights[0] ?? null;
  const latestModerationEntry = moderationHistory[0] ?? null;
  const latestActivityAt =
    [
      latestSnapshot?.capturedAt,
      topReplayHighlight?.highlightedAt,
      latestModerationEntry?.createdAt,
      row.actual_ended_at,
      row.cancelled_at,
      row.actual_started_at,
      row.starts_at,
    ]
      .filter(Boolean)
      .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())[0] ?? row.starts_at;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    phase,
    film: {
      id: film.id,
      serial: film.serial,
      slug: film.slug,
      title: film.title,
      thumbnailUrl: film.thumbnailUrl,
    },
    officialAgent,
    humanAttendeeCount: humanAttendees.length,
    agentAttendeeCount: agentAttendees.length,
    liveHumanCount,
    liveAgentCount,
    analytics,
    latestSnapshot,
    latestActivityAt,
    topReplayHighlight,
    latestModerationEntry,
    replayHighlightCount: replayHighlights.length,
    moderationActionCount: moderationHistory.length,
  };
}

type WatchEventSummaryHydrationOptions = {
  historyLimit?: number;
  replayLimit?: number;
  moderationLimit?: number;
};

async function hydrateWatchEventSummaries(
  rows: WatchEventRow[],
  options: WatchEventSummaryHydrationOptions = {},
) {
  if (!rows.length) {
    return [] as WatchEventSummary[];
  }

  const supabase = await createSupabaseServerClient();
  const historyLimit = options.historyLimit ?? 4;
  const replayLimit = options.replayLimit ?? 3;
  const moderationLimit = options.moderationLimit ?? 3;

  const [
    { data: attendeeData, error: attendeeError },
    filmMap,
    agentMap,
    mutedProfileIdsByEvent,
    analyticsMap,
    analyticsHistoryMap,
    replayHighlightsMap,
    moderationHistoryMap,
  ] = await Promise.all([
    supabase
      .from("watch_event_attendees")
      .select("id, event_id, attendee_type, display_name, profile_id, agent_slug, presence_state, trust_level, is_official_creator_agent, is_host, joined_at, last_seen_at, agent_id")
      .in("event_id", rows.map((row) => row.id)),
    getFilmMapByIds([...new Set(rows.map((row) => row.film_id))]),
    getAgentMapByIds([...new Set(rows.map((row) => row.official_agent_id).filter(Boolean) as string[])]),
    getMutedProfileIdsByEvent(rows.map((row) => row.id)),
    getWatchEventAnalyticsMap(rows),
    getWatchEventAnalyticsHistoryMap(rows.map((row) => row.id), historyLimit),
    getWatchEventReplayHighlightsMap(rows.map((row) => row.id), replayLimit),
    getWatchEventModerationHistoryMap(rows.map((row) => row.id), moderationLimit),
  ]);

  if (attendeeError) {
    throw new Error(`Failed to load public watch-event attendees: ${attendeeError.message}`);
  }

  const attendeesByEvent = new Map<string, WatchEventAttendee[]>();
  for (const attendeeRow of (attendeeData ?? []) as WatchEventAttendeeRow[]) {
    const list = attendeesByEvent.get(attendeeRow.event_id) ?? [];
    list.push(mapAttendee(attendeeRow, mutedProfileIdsByEvent.get(attendeeRow.event_id) ?? new Set()));
    attendeesByEvent.set(attendeeRow.event_id, list);
  }

  return rows
    .map((row) => {
      const film = filmMap.get(row.film_id);

      if (!film) {
        return null;
      }

      return buildSummary(
        row,
        film,
        mapAgent(row.official_agent_id ? agentMap.get(row.official_agent_id) ?? null : null),
        attendeesByEvent.get(row.id) ?? [],
        analyticsMap.get(row.id) ?? createEmptyAnalytics(),
        analyticsHistoryMap.get(row.id) ?? [],
        replayHighlightsMap.get(row.id) ?? [],
        moderationHistoryMap.get(row.id) ?? [],
      );
    })
    .filter((event): event is WatchEventSummary => Boolean(event));
}

export async function createUniqueWatchEventSlug(baseName: string) {
  const supabase = createSupabaseAdminClient();
  const baseSlug = slugify(baseName) || "watch-event";
  let slug = baseSlug;
  let suffix = 2;

  for (;;) {
    const { data, error } = await supabase
      .from("watch_events")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to check watch event slug: ${error.message}`);
    }

    if (!data) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export async function getCreatorWatchEventStudioData(profileId: string, creatorId: string | null) {
  if (!creatorId) {
    return {
      acceptedFilms: [] as StudioWatchFilmOption[],
      events: [] as WatchEventSummary[],
    };
  }

  const supabase = await createSupabaseServerClient();
  const [{ data: filmRows, error: filmError }, { data: eventRows, error: eventError }] = await Promise.all([
    supabase
      .from("films")
      .select("id, serial_number, slug, title, runtime_minutes, release_year, genre, youtube_url, creators (slug, name)")
      .eq("creator_id", creatorId)
      .neq("visibility", "removed")
      .order("serial_number", { ascending: true }),
    supabase
      .from("watch_events")
      .select("id, slug, title, description, film_id, creator_id, host_profile_id, official_agent_id, starts_at, ends_at, status, created_at, actual_started_at, actual_ended_at, cancelled_at, peak_human_count, peak_agent_count")
      .eq("host_profile_id", profileId)
      .order("starts_at", { ascending: true }),
  ]);

  if (filmError) {
    throw new Error(`Failed to load creator films for watch events: ${filmError.message}`);
  }

  if (eventError) {
    throw new Error(`Failed to load creator watch events: ${eventError.message}`);
  }

  const acceptedFilms = ((filmRows ?? []) as FilmRow[]).map((row) => {
    const film = mapFilm(row);

    return {
      id: film.id,
      serial: film.serial,
      slug: film.slug,
      title: film.title,
      thumbnailUrl: film.thumbnailUrl,
      runtimeMinutes: film.runtimeMinutes,
    } satisfies StudioWatchFilmOption;
  });

  const rows = (eventRows ?? []) as WatchEventRow[];
  if (!rows.length) {
    return {
      acceptedFilms,
      events: [],
    };
  }
  const events = await hydrateWatchEventSummaries(rows, {
    historyLimit: 8,
    replayLimit: 4,
    moderationLimit: 6,
  });

  return {
    acceptedFilms,
    events,
  };
}

export async function getPublicWatchEventBySlug(slug: string): Promise<WatchEvent | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("watch_events")
    .select("id, slug, title, description, film_id, creator_id, host_profile_id, official_agent_id, starts_at, ends_at, status, created_at, actual_started_at, actual_ended_at, cancelled_at, peak_human_count, peak_agent_count")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error(`Failed to load watch event: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const eventRow = data as WatchEventRow;
  const [
    { data: attendeeData, error: attendeeError },
    { data: messageData, error: messageError },
    mutedProfileIdsByEvent,
    analyticsMap,
    analyticsHistoryMap,
    replayHighlightsMap,
    moderationHistoryMap,
  ] = await Promise.all([
    supabase
      .from("watch_event_attendees")
      .select("id, event_id, attendee_type, display_name, profile_id, agent_slug, presence_state, trust_level, is_official_creator_agent, is_host, joined_at, last_seen_at, agent_id")
      .eq("event_id", eventRow.id)
      .order("last_seen_at", { ascending: false }),
    supabase
      .from("watch_event_messages")
      .select("id, event_id, author_type, display_name, profile_id, agent_slug, body, trust_level, is_official_creator_agent, created_at, agent_id")
      .eq("event_id", eventRow.id)
      .order("created_at", { ascending: false })
      .limit(60),
    getMutedProfileIdsByEvent([eventRow.id]),
    getWatchEventAnalyticsMap([eventRow]),
    getWatchEventAnalyticsHistoryMap([eventRow.id], 14),
    getWatchEventReplayHighlightsMap([eventRow.id], 8),
    getWatchEventModerationHistoryMap([eventRow.id], 12),
  ]);

  if (attendeeError) {
    throw new Error(`Failed to load watch-event attendees: ${attendeeError.message}`);
  }

  if (messageError) {
    throw new Error(`Failed to load watch-event messages: ${messageError.message}`);
  }

  const attendeeRows = (attendeeData ?? []) as WatchEventAttendeeRow[];
  const messageRows = (messageData ?? []) as WatchEventMessageRow[];
  const agentIds = [
    ...new Set(
      [
        eventRow.official_agent_id,
        ...attendeeRows.map((attendee) => attendee.agent_id),
        ...messageRows.map((message) => message.agent_id),
      ].filter(Boolean) as string[],
    ),
  ];

  const [filmMap, creatorMap, profileMap, agentMap] = await Promise.all([
    getFilmMapByIds([eventRow.film_id]),
    getCreatorMapByIds(eventRow.creator_id ? [eventRow.creator_id] : []),
    getProfileMapByIds(eventRow.host_profile_id ? [eventRow.host_profile_id] : []),
    getAgentMapByIds(agentIds),
  ]);

  const film = filmMap.get(eventRow.film_id);
  if (!film) {
    return null;
  }

  const attendees = attendeeRows.map((row) => mapAttendee(row, mutedProfileIdsByEvent.get(eventRow.id) ?? new Set()));
  const messages = messageRows.map((row) => mapMessage(row));
  const analyticsHistory = analyticsHistoryMap.get(eventRow.id) ?? [];
  const replayHighlights = replayHighlightsMap.get(eventRow.id) ?? [];
  const moderationHistory = moderationHistoryMap.get(eventRow.id) ?? [];
  const summary = buildSummary(
    eventRow,
    film,
    mapAgent(eventRow.official_agent_id ? agentMap.get(eventRow.official_agent_id) ?? null : null),
    attendees,
    analyticsMap.get(eventRow.id) ?? createEmptyAnalytics(),
    analyticsHistory,
    replayHighlights,
    moderationHistory,
  );

  const { profile } = await getCurrentSessionProfile();

  return {
    ...summary,
    createdAt: eventRow.created_at,
    film,
    creator: eventRow.creator_id ? creatorMap.get(eventRow.creator_id) ?? null : null,
    host: eventRow.host_profile_id
      ? (() => {
          const host = profileMap.get(eventRow.host_profile_id) ?? null;
          return host
            ? {
                id: host.id,
                displayName: host.display_name,
              }
            : null;
        })()
      : null,
    attendees,
    messages,
    analyticsHistory,
    replayHighlights,
    moderationHistory,
    canModerate: Boolean(profile && (profile.role === "admin" || profile.id === eventRow.host_profile_id)),
  };
}

export async function getPrimaryWatchEventForFilm(filmId: string): Promise<WatchEventSummary | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("watch_events")
    .select("id, slug, title, description, film_id, creator_id, host_profile_id, official_agent_id, starts_at, ends_at, status, created_at, actual_started_at, actual_ended_at, cancelled_at, peak_human_count, peak_agent_count")
    .eq("film_id", filmId)
    .order("starts_at", { ascending: true })
    .limit(12);

  if (error) {
    throw new Error(`Failed to load film watch events: ${error.message}`);
  }

  const rows = (data ?? []) as WatchEventRow[];
  const liveOrScheduled = rows.filter((row) => {
    const phase = getWatchEventPhase(row.status, row.starts_at, row.ends_at);
    return phase === "live" || phase === "scheduled";
  });
  const primaryRow = liveOrScheduled[0] ?? rows.at(-1) ?? null;

  if (!primaryRow) {
    return null;
  }

  const [event] = await hydrateWatchEventSummaries([primaryRow], {
    historyLimit: 4,
    replayLimit: 3,
    moderationLimit: 3,
  });

  return event ?? null;
}

export async function getUpcomingWatchEventForFilm(filmId: string): Promise<WatchEventSummary | null> {
  const event = await getPrimaryWatchEventForFilm(filmId);
  if (!event || (event.phase !== "live" && event.phase !== "scheduled")) {
    return null;
  }

  return event;
}

export async function getPublicWatchEventsForCreator(
  creatorId: string,
  limit = 4,
): Promise<WatchEventSummary[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("watch_events")
    .select("id, slug, title, description, film_id, creator_id, host_profile_id, official_agent_id, starts_at, ends_at, status, created_at, actual_started_at, actual_ended_at, cancelled_at, peak_human_count, peak_agent_count")
    .eq("creator_id", creatorId)
    .order("starts_at", { ascending: false })
    .limit(Math.max(limit, 8));

  if (error) {
    throw new Error(`Failed to load creator watch events: ${error.message}`);
  }

  const events = await hydrateWatchEventSummaries((data ?? []) as WatchEventRow[], {
    historyLimit: 4,
    replayLimit: 3,
    moderationLimit: 3,
  });

  const phaseOrder: Record<WatchEventStatus, number> = {
    live: 0,
    scheduled: 1,
    ended: 2,
    cancelled: 3,
  };

  return [...events]
    .sort((a, b) => {
      const phaseDelta = phaseOrder[a.phase] - phaseOrder[b.phase];
      if (phaseDelta !== 0) {
        return phaseDelta;
      }

      if (a.phase === "live" || a.phase === "scheduled") {
        return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
      }

      return new Date(b.latestActivityAt).getTime() - new Date(a.latestActivityAt).getTime();
    })
    .slice(0, limit);
}

export async function getPublicWatchEvents(limit?: number): Promise<WatchEventSummary[]> {
  const supabase = await createSupabaseServerClient();
  const query = supabase
    .from("watch_events")
    .select("id, slug, title, description, film_id, creator_id, host_profile_id, official_agent_id, starts_at, ends_at, status, created_at, actual_started_at, actual_ended_at, cancelled_at, peak_human_count, peak_agent_count")
    .order("starts_at", { ascending: true });
  const { data, error } =
    typeof limit === "number" ? await query.limit(limit) : await query;

  if (error) {
    throw new Error(`Failed to load public watch events: ${error.message}`);
  }

  return hydrateWatchEventSummaries((data ?? []) as WatchEventRow[], {
    historyLimit: 4,
    replayLimit: 3,
    moderationLimit: 3,
  });
}

export async function getOwnedWatchEventForHost(eventId: string, hostProfileId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("watch_events")
    .select(WATCH_EVENT_LIFECYCLE_SELECT)
    .eq("id", eventId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to load owned watch event: ${error.message}`);
  }

  if (!data || data.host_profile_id !== hostProfileId) {
    return null;
  }

  return mapWatchEventLifecycle(data as WatchEventLifecycleRow);
}

export async function getActiveWatchEventMute(eventId: string, profileId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("watch_event_mutes")
    .select("id, expires_at")
    .eq("event_id", eventId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to load watch-event mute state: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const mute = data as { id: string; expires_at: string | null };
  if (mute.expires_at && new Date(mute.expires_at).getTime() <= Date.now()) {
    return null;
  }

  return mute;
}

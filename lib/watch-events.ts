import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentSessionProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildYouTubeThumbnailUrl } from "@/lib/youtube";

export type WatchEventStatus = "scheduled" | "live" | "ended" | "cancelled";
export type WatchAttendeeType = "human" | "agent";
export type WatchPresenceState = "watching" | "taking-notes" | "answering-questions" | "hosting" | "away";

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
  replayInterestCount: number;
  shareCount: number;
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

type WatchEventMuteRow = {
  event_id: string;
  profile_id: string;
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

function createEmptyAnalytics(): WatchEventAnalytics {
  return {
    peakHumanCount: 0,
    peakAgentCount: 0,
    totalMessages: 0,
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
      .select("event_id")
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
      replayInterestCount: 0,
      shareCount: 0,
    });
  }

  for (const row of messagesResult.data ?? []) {
    const eventId = row.event_id as string;
    const current = analyticsMap.get(eventId) ?? createEmptyAnalytics();
    current.totalMessages += 1;
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

function buildSummary(
  row: WatchEventRow,
  film: WatchEventFilm,
  officialAgent: WatchEventAgent | null,
  attendees: WatchEventAttendee[],
  analytics: WatchEventAnalytics = createEmptyAnalytics(),
): WatchEventSummary {
  const phase = getWatchEventPhase(row.status, row.starts_at, row.ends_at);
  const humanAttendees = attendees.filter((attendee) => attendee.attendeeType === "human");
  const agentAttendees = attendees.filter((attendee) => attendee.attendeeType === "agent");
  const liveHumanCount = humanAttendees.filter((attendee) => isActiveWatchAttendee(attendee.lastSeenAt)).length;
  const liveAgentCount = agentAttendees.filter((attendee) => isActiveWatchAttendee(attendee.lastSeenAt)).length;

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
  };
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

  const [filmMap, agentMap, attendeeRowsResult, mutedProfileIdsByEvent, analyticsMap] = await Promise.all([
    getFilmMapByIds([...new Set(rows.map((row) => row.film_id))]),
    getAgentMapByIds([...new Set(rows.map((row) => row.official_agent_id).filter(Boolean) as string[])]),
    supabase
      .from("watch_event_attendees")
      .select("id, event_id, attendee_type, display_name, profile_id, agent_slug, presence_state, trust_level, is_official_creator_agent, is_host, joined_at, last_seen_at, agent_id")
      .in("event_id", rows.map((row) => row.id)),
    getMutedProfileIdsByEvent(rows.map((row) => row.id)),
    getWatchEventAnalyticsMap(rows),
  ]);

  if (attendeeRowsResult.error) {
    throw new Error(`Failed to load watch-event attendees: ${attendeeRowsResult.error.message}`);
  }

  const attendeeRows = (attendeeRowsResult.data ?? []) as WatchEventAttendeeRow[];
  const attendeesByEvent = new Map<string, WatchEventAttendee[]>();
  for (const attendeeRow of attendeeRows) {
    const list = attendeesByEvent.get(attendeeRow.event_id) ?? [];
    list.push(mapAttendee(attendeeRow, mutedProfileIdsByEvent.get(attendeeRow.event_id) ?? new Set()));
    attendeesByEvent.set(attendeeRow.event_id, list);
  }

  const events = rows
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
      );
    })
    .filter((event): event is WatchEventSummary => Boolean(event));

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
  const [{ data: attendeeData, error: attendeeError }, { data: messageData, error: messageError }, mutedProfileIdsByEvent, analyticsMap] = await Promise.all([
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
  const summary = buildSummary(
    eventRow,
    film,
    mapAgent(eventRow.official_agent_id ? agentMap.get(eventRow.official_agent_id) ?? null : null),
    attendees,
    analyticsMap.get(eventRow.id) ?? createEmptyAnalytics(),
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
    canModerate: Boolean(profile && (profile.role === "admin" || profile.id === eventRow.host_profile_id)),
  };
}

export async function getUpcomingWatchEventForFilm(filmId: string): Promise<WatchEventSummary | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("watch_events")
    .select("id, slug, title, description, film_id, creator_id, host_profile_id, official_agent_id, starts_at, ends_at, status, created_at, actual_started_at, actual_ended_at, cancelled_at, peak_human_count, peak_agent_count")
    .eq("film_id", filmId)
    .order("starts_at", { ascending: true })
    .limit(6);

  if (error) {
    throw new Error(`Failed to load film watch events: ${error.message}`);
  }

  const rows = ((data ?? []) as WatchEventRow[]).filter((row) => {
    const phase = getWatchEventPhase(row.status, row.starts_at, row.ends_at);
    return phase === "scheduled" || phase === "live";
  });

  const nextRow = rows[0];
  if (!nextRow) {
    return null;
  }

  const [{ data: attendeeData, error: attendeeError }, filmMap, agentMap, mutedProfileIdsByEvent, analyticsMap] = await Promise.all([
    supabase
      .from("watch_event_attendees")
      .select("id, event_id, attendee_type, display_name, profile_id, agent_slug, presence_state, trust_level, is_official_creator_agent, is_host, joined_at, last_seen_at, agent_id")
      .eq("event_id", nextRow.id),
    getFilmMapByIds([nextRow.film_id]),
    getAgentMapByIds(nextRow.official_agent_id ? [nextRow.official_agent_id] : []),
    getMutedProfileIdsByEvent([nextRow.id]),
    getWatchEventAnalyticsMap([nextRow]),
  ]);

  if (attendeeError) {
    throw new Error(`Failed to load film watch-event attendees: ${attendeeError.message}`);
  }

  const film = filmMap.get(nextRow.film_id);
  if (!film) {
    return null;
  }

  const attendees = ((attendeeData ?? []) as WatchEventAttendeeRow[]).map((row) =>
    mapAttendee(row, mutedProfileIdsByEvent.get(nextRow.id) ?? new Set()),
  );

  return buildSummary(
    nextRow,
    film,
    mapAgent(nextRow.official_agent_id ? agentMap.get(nextRow.official_agent_id) ?? null : null),
    attendees,
    analyticsMap.get(nextRow.id) ?? createEmptyAnalytics(),
  );
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

  const rows = (data ?? []) as WatchEventRow[];
  if (!rows.length) {
    return [];
  }

  const [{ data: attendeeData, error: attendeeError }, filmMap, agentMap, mutedProfileIdsByEvent, analyticsMap] = await Promise.all([
    supabase
      .from("watch_event_attendees")
      .select("id, event_id, attendee_type, display_name, profile_id, agent_slug, presence_state, trust_level, is_official_creator_agent, is_host, joined_at, last_seen_at, agent_id")
      .in("event_id", rows.map((row) => row.id)),
    getFilmMapByIds([...new Set(rows.map((row) => row.film_id))]),
    getAgentMapByIds([...new Set(rows.map((row) => row.official_agent_id).filter(Boolean) as string[])]),
    getMutedProfileIdsByEvent(rows.map((row) => row.id)),
    getWatchEventAnalyticsMap(rows),
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
      );
    })
    .filter((event): event is WatchEventSummary => Boolean(event));
}

export async function getOwnedWatchEventForHost(eventId: string, hostProfileId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("watch_events")
    .select("id, slug, film_id, host_profile_id, status")
    .eq("id", eventId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to load owned watch event: ${error.message}`);
  }

  if (!data || data.host_profile_id !== hostProfileId) {
    return null;
  }

  return data as {
    id: string;
    slug: string;
    film_id: string;
    host_profile_id: string;
    status: WatchEventStatus;
  };
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

"use client";

import * as React from "react";
import Link from "next/link";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { SessionProfile } from "@/lib/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  WatchEventAttendee,
  WatchEventMessage,
  WatchEventModerationEntry,
  WatchEventReplayHighlight,
  WatchPresenceState,
} from "@/lib/watch-events";

type Props = {
  authPath: string;
  eventId: string;
  initialAttendees: WatchEventAttendee[];
  initialMessages: WatchEventMessage[];
  initialReplayHighlights: WatchEventReplayHighlight[];
  initialModerationHistory: WatchEventModerationEntry[];
  sessionProfile: Pick<SessionProfile, "id" | "displayName"> | null;
  canModerate: boolean;
};

type RailTab = "humans" | "agents" | "replay" | "moderation";

type AttendeeRecord = {
  id: string;
  event_id: string;
  attendee_type: "human" | "agent";
  display_name: string;
  profile_id: string | null;
  agent_slug: string | null;
  presence_state: WatchPresenceState;
  trust_level: WatchEventAttendee["trustLevel"];
  is_official_creator_agent: boolean;
  is_host: boolean;
  joined_at: string;
  last_seen_at: string;
};

type MessageRecord = {
  id: string;
  event_id: string;
  author_type: "human" | "agent";
  display_name: string;
  profile_id: string | null;
  agent_slug: string | null;
  body: string;
  trust_level: WatchEventMessage["trustLevel"];
  is_official_creator_agent: boolean;
  created_at: string;
};

type MuteRecord = { id: string; event_id: string; profile_id: string; expires_at: string | null };

type HighlightRecord = {
  id: string;
  event_id: string;
  source_message_id: string | null;
  source_author_type: "human" | "agent" | null;
  source_display_name: string | null;
  source_body: string | null;
  title: string;
  note: string;
  created_by_profile_id: string | null;
  created_by_display_name: string;
  highlighted_at: string;
};

type ModerationRecord = {
  id: string;
  event_id: string;
  actor_profile_id: string | null;
  actor_display_name: string;
  action: WatchEventModerationEntry["action"];
  target_profile_id: string | null;
  target_message_id: string | null;
  target_display_name: string | null;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

const PRESENCE_OPTIONS: WatchPresenceState[] = [
  "watching",
  "taking-notes",
  "answering-questions",
  "hosting",
  "away",
];

function getModerationActionLabel(action: WatchEventModerationEntry["action"]) {
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

const isActiveAttendee = (lastSeenAt: string) => Date.now() - new Date(lastSeenAt).getTime() <= 1000 * 60 * 8;
const sortByTime = <T extends { createdAt: string }>(items: T[]) =>
  [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

function sortAttendees(items: WatchEventAttendee[]) {
  return [...items].sort((a, b) => {
    const activeDelta = Number(isActiveAttendee(b.lastSeenAt)) - Number(isActiveAttendee(a.lastSeenAt));
    if (activeDelta !== 0) return activeDelta;
    const hostDelta = Number(b.isHost) - Number(a.isHost);
    if (hostDelta !== 0) return hostDelta;
    return new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime();
  });
}

const sortMessages = (items: WatchEventMessage[]) => sortByTime(items.map((item) => ({ ...item, createdAt: item.createdAt })));
const sortHighlights = (items: WatchEventReplayHighlight[]) =>
  [...items].sort((a, b) => new Date(b.highlightedAt).getTime() - new Date(a.highlightedAt).getTime());
const sortModeration = (items: WatchEventModerationEntry[]) => sortByTime(items.map((item) => ({ ...item, createdAt: item.createdAt })));

function upsertById<T extends { id: string }>(items: T[], nextItem: T) {
  return [nextItem, ...items.filter((item) => item.id !== nextItem.id)];
}

const mapAttendee = (record: AttendeeRecord, previous?: WatchEventAttendee): WatchEventAttendee => ({
  id: record.id,
  eventId: record.event_id,
  attendeeType: record.attendee_type,
  displayName: record.display_name,
  profileId: record.profile_id,
  agentSlug: record.agent_slug,
  presenceState: record.presence_state,
  trustLevel: record.trust_level,
  isOfficialCreatorAgent: record.is_official_creator_agent,
  isHost: record.is_host,
  isMuted: previous?.isMuted ?? false,
  joinedAt: record.joined_at,
  lastSeenAt: record.last_seen_at,
});

const mapMessage = (record: MessageRecord): WatchEventMessage => ({
  id: record.id,
  eventId: record.event_id,
  authorType: record.author_type,
  displayName: record.display_name,
  profileId: record.profile_id,
  agentSlug: record.agent_slug,
  body: record.body,
  trustLevel: record.trust_level,
  isOfficialCreatorAgent: record.is_official_creator_agent,
  createdAt: record.created_at,
});

const mapHighlight = (record: HighlightRecord): WatchEventReplayHighlight => ({
  id: record.id,
  eventId: record.event_id,
  sourceMessageId: record.source_message_id,
  sourceAuthorType: record.source_author_type,
  sourceDisplayName: record.source_display_name,
  sourceBody: record.source_body,
  title: record.title,
  note: record.note,
  createdByProfileId: record.created_by_profile_id,
  createdByDisplayName: record.created_by_display_name,
  highlightedAt: record.highlighted_at,
});

const mapModeration = (record: ModerationRecord): WatchEventModerationEntry => ({
  id: record.id,
  eventId: record.event_id,
  actorProfileId: record.actor_profile_id,
  actorDisplayName: record.actor_display_name,
  action: record.action,
  targetProfileId: record.target_profile_id,
  targetMessageId: record.target_message_id,
  targetDisplayName: record.target_display_name,
  reason: record.reason,
  metadata: record.metadata ?? {},
  createdAt: record.created_at,
});

async function postJson<T>(url: string, body: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;
  return { ok: response.ok, payload };
}

export function WatchEventLounge({
  authPath,
  eventId,
  initialAttendees,
  initialMessages,
  initialReplayHighlights,
  initialModerationHistory,
  sessionProfile,
  canModerate,
}: Props) {
  const [supabase] = React.useState(() => createSupabaseBrowserClient());
  const [attendees, setAttendees] = React.useState(() => sortAttendees(initialAttendees));
  const [messages, setMessages] = React.useState(() => sortMessages(initialMessages));
  const [replayHighlights, setReplayHighlights] = React.useState(() => sortHighlights(initialReplayHighlights));
  const [moderationHistory, setModerationHistory] = React.useState(() => sortModeration(initialModerationHistory));
  const [messageBody, setMessageBody] = React.useState("");
  const [messageError, setMessageError] = React.useState<string | null>(null);
  const [presenceError, setPresenceError] = React.useState<string | null>(null);
  const [moderationError, setModerationError] = React.useState<string | null>(null);
  const [moderationReason, setModerationReason] = React.useState("");
  const [muteDurationMinutes, setMuteDurationMinutes] = React.useState("30");
  const [replayTitleDraft, setReplayTitleDraft] = React.useState("");
  const [replayNoteDraft, setReplayNoteDraft] = React.useState("");
  const [isPending, startTransition] = React.useTransition();
  const [presenceState, setPresenceState] = React.useState<WatchPresenceState>(
    initialAttendees.find((attendee) => attendee.profileId === sessionProfile?.id)?.presenceState ?? "watching",
  );
  const [railTab, setRailTab] = React.useState<RailTab>("humans");

  const currentUserMuted = attendees.some((attendee) => attendee.profileId === sessionProfile?.id && attendee.isMuted);
  const highlightedMessageIds = new Set(replayHighlights.map((item) => item.sourceMessageId).filter(Boolean));

  const syncPresence = React.useEffectEvent(async (nextPresenceState: WatchPresenceState) => {
    if (!sessionProfile) return;
    const { ok, payload } = await postJson<{ attendee?: AttendeeRecord }>("/api/watch-events/presence", { eventId, presenceState: nextPresenceState });
    if (!ok) {
      setPresenceError((payload as { error?: string } | null)?.error ?? "Presence could not be refreshed.");
      return;
    }
    setPresenceError(null);
    const attendee = payload && "attendee" in payload ? payload.attendee : undefined;
    if (!attendee) return;
    setAttendees((current) => sortAttendees(upsertById(current, mapAttendee(attendee, current.find((item) => item.id === attendee.id)))));
  });

  React.useEffect(() => {
    if (!sessionProfile) return;
    void syncPresence(presenceState);
    const interval = window.setInterval(() => void syncPresence(presenceState), 45_000);
    return () => window.clearInterval(interval);
  }, [presenceState, sessionProfile]);

  React.useEffect(() => {
    const channel = supabase
      .channel(`watch-lounge-${eventId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "watch_event_attendees", filter: `event_id=eq.${eventId}` }, (payload: RealtimePostgresChangesPayload<AttendeeRecord>) => {
        if (payload.eventType === "DELETE") {
          setAttendees((current) => current.filter((item) => item.id !== payload.old.id));
          return;
        }
        if (!payload.new) return;
        setAttendees((current) => sortAttendees(upsertById(current, mapAttendee(payload.new as AttendeeRecord, current.find((item) => item.id === payload.new.id)))));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "watch_event_messages", filter: `event_id=eq.${eventId}` }, (payload: RealtimePostgresChangesPayload<MessageRecord>) => {
        if (payload.eventType === "DELETE") {
          setMessages((current) => current.filter((item) => item.id !== payload.old.id));
          return;
        }
        if (!payload.new) return;
        setMessages((current) => sortMessages(upsertById(current, mapMessage(payload.new as MessageRecord))));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "watch_event_mutes", filter: `event_id=eq.${eventId}` }, (payload: RealtimePostgresChangesPayload<MuteRecord>) => {
        const profileId = payload.eventType === "DELETE" ? payload.old.profile_id : payload.new?.profile_id;
        if (!profileId) return;
        const isMuted = payload.eventType !== "DELETE" && (!payload.new?.expires_at || new Date(payload.new.expires_at).getTime() > Date.now());
        setAttendees((current) => current.map((item) => (item.profileId === profileId ? { ...item, isMuted } : item)));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "watch_event_replay_highlights", filter: `event_id=eq.${eventId}` }, (payload: RealtimePostgresChangesPayload<HighlightRecord>) => {
        if (payload.eventType === "DELETE") {
          setReplayHighlights((current) => current.filter((item) => item.id !== payload.old.id));
          return;
        }
        if (!payload.new) return;
        setReplayHighlights((current) => sortHighlights(upsertById(current, mapHighlight(payload.new as HighlightRecord))));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "watch_event_moderation_history", filter: `event_id=eq.${eventId}` }, (payload: RealtimePostgresChangesPayload<ModerationRecord>) => {
        if (payload.eventType === "DELETE") {
          setModerationHistory((current) => current.filter((item) => item.id !== payload.old.id));
          return;
        }
        if (!payload.new) return;
        setModerationHistory((current) => sortModeration(upsertById(current, mapModeration(payload.new as ModerationRecord))));
      })
      .subscribe();

    return () => void supabase.removeChannel(channel);
  }, [eventId, supabase]);

  const humanAttendees = sortAttendees(attendees.filter((item) => item.attendeeType === "human"));
  const agentAttendees = sortAttendees(attendees.filter((item) => item.attendeeType === "agent"));
  const humanMessages = sortMessages(messages.filter((item) => item.authorType === "human"));
  const agentMessages = sortMessages(messages.filter((item) => item.authorType === "agent"));
  const activeHumansCount = humanAttendees.filter((item) => isActiveAttendee(item.lastSeenAt)).length;
  const activeAgentsCount = agentAttendees.filter((item) => isActiveAttendee(item.lastSeenAt)).length;
  const officialAgentCount = agentAttendees.filter((item) => item.isOfficialCreatorAgent).length;
  const mutedHumanCount = humanAttendees.filter((item) => item.isMuted).length;
  const mutedHumans = humanAttendees.filter((item) => item.isMuted);
  const latestModerationEntry = moderationHistory[0] ?? null;
  const replayPinHasDraft = Boolean(replayTitleDraft.trim() || replayNoteDraft.trim());
  const moderationTabLabel = canModerate ? "Host tools" : "Room log";

  async function handleModeration(body: Record<string, unknown>, apply: (payload: Record<string, unknown> | null) => void) {
    const { ok, payload } = await postJson<Record<string, unknown>>("/api/watch-events/moderation", body);
    if (!ok) {
      setModerationError((payload as { error?: string } | null)?.error ?? "Moderation action failed.");
      return;
    }
    setModerationError(null);
    apply(payload as Record<string, unknown> | null);
  }

  function pushModeration(entry: WatchEventModerationEntry | undefined) {
    if (!entry) return;
    setModerationHistory((current) => sortModeration(upsertById(current, entry)));
  }

  function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sessionProfile || !messageBody.trim() || currentUserMuted) return;
    startTransition(async () => {
      const { ok, payload } = await postJson<{ message?: MessageRecord }>("/api/watch-events/messages", { eventId, body: messageBody.trim() });
      if (!ok) {
        setMessageError((payload as { error?: string } | null)?.error ?? "Message could not be sent.");
        return;
      }
      const message = payload && "message" in payload ? payload.message : undefined;
      setMessageBody("");
      setMessageError(null);
      if (message) {
        setMessages((current) => sortMessages(upsertById(current, mapMessage(message))));
      }
      await syncPresence(presenceState);
    });
  }

  function toggleMute(attendee: WatchEventAttendee) {
    startTransition(async () => {
      await handleModeration(
        {
          action: attendee.isMuted ? "unmute-attendee" : "mute-attendee",
          eventId,
          attendeeId: attendee.id,
          durationMinutes: Math.max(5, Number.parseInt(muteDurationMinutes, 10) || 30),
          reason: moderationReason.trim() || "Host moderation",
        },
        (payload) => {
          const moderationEntry = payload?.moderationEntry as WatchEventModerationEntry | undefined;
          setAttendees((current) =>
            current.map((item) => (item.id === attendee.id ? { ...item, isMuted: !attendee.isMuted } : item)),
          );
          pushModeration(moderationEntry);
        },
      );
    });
  }

  function moderateMessage(messageId: string) {
    startTransition(async () => {
      await handleModeration(
        {
          action: "remove-message",
          eventId,
          messageId,
          reason: moderationReason.trim() || "Removed from the live human rail.",
        },
        (payload) => {
        setMessages((current) => current.filter((item) => item.id !== messageId));
        pushModeration(payload?.moderationEntry as WatchEventModerationEntry | undefined);
        },
      );
    });
  }

  function toggleReplay(message: WatchEventMessage) {
    const existing = replayHighlights.find((item) => item.sourceMessageId === message.id);
    startTransition(async () => {
      await handleModeration(
        existing
          ? { action: "remove-highlight", eventId, highlightId: existing.id }
          : {
              action: "highlight-message",
              eventId,
              messageId: message.id,
              title: replayTitleDraft.trim() || undefined,
              note: replayNoteDraft.trim() || undefined,
            },
        (payload) => {
          const highlight = payload?.highlight as HighlightRecord | undefined;
          if (existing) {
            setReplayHighlights((current) => current.filter((item) => item.id !== existing.id));
          } else if (highlight) {
            setReplayHighlights((current) => sortHighlights(upsertById(current, mapHighlight(highlight))));
            setReplayTitleDraft("");
            setReplayNoteDraft("");
          }
          pushModeration(payload?.moderationEntry as WatchEventModerationEntry | undefined);
        },
      );
    });
  }

  const tabButtonClass = (tab: RailTab) =>
    `rounded-full border px-3 py-2 text-xs uppercase tracking-[0.16em] transition ${
      railTab === tab
        ? "border-[oklch(0.72_0.14_55_/_40%)] bg-[oklch(0.72_0.14_55_/_10%)] text-foreground"
        : "border-border/70 bg-background/55 text-muted-foreground hover:text-foreground"
    }`;

  return (
    <section className="rounded-xl border border-border/50 bg-card p-5 xl:sticky xl:top-28" data-testid="watch-event-lounge">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="sv-overline">Live side rail</p>
          <h2 className="mt-2 font-display text-[1.35rem] font-medium text-foreground">
            Humans and agents, split cleanly.
          </h2>
          <p className="sv-body mt-2">
            Do one thing first: keep the human rail open while the film plays. Open agents only when you want companion context, then use replay and room log as archive layers.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
          <p className="sv-overline">Readable now</p>
          <p className="mt-2 text-lg font-medium text-foreground">{activeHumansCount} humans live</p>
          <p className="sv-body-sm mt-2">
            Keep this rail open first so the premiere feels inhabited without turning into clutter.
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
          <p className="sv-overline">Companion layer</p>
          <p className="mt-2 text-lg font-medium text-foreground">{activeAgentsCount} agents active</p>
          <p className="sv-body-sm mt-2">
            {officialAgentCount
              ? `${officialAgentCount} official companion${officialAgentCount === 1 ? "" : "s"} can answer questions without muddying human reactions.`
              : "Open this only when you want context, lore, or creator-owned guidance."}
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
          <p className="sv-overline">Archive layer</p>
          <p className="mt-2 text-lg font-medium text-foreground">{replayHighlights.length} replay markers</p>
          <p className="sv-body-sm mt-2">
            {moderationHistory.length} room log entries and {mutedHumanCount} active mute{mutedHumanCount === 1 ? "" : "s"} keep stewardship visible.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button className={tabButtonClass("humans")} onClick={() => setRailTab("humans")} type="button">
          Humans {humanMessages.length}
        </button>
        <button className={tabButtonClass("agents")} onClick={() => setRailTab("agents")} type="button">
          Agents {agentMessages.length}
        </button>
        <button className={tabButtonClass("replay")} onClick={() => setRailTab("replay")} type="button">
          Replay {replayHighlights.length}
        </button>
        <button className={tabButtonClass("moderation")} onClick={() => setRailTab("moderation")} type="button">
          {moderationTabLabel} {moderationHistory.length}
        </button>
      </div>

      {sessionProfile ? (
        <div className="mt-4 grid gap-3">
          <label className="block">
            <span className="sv-field-label">Your lounge state</span>
            <select
              className="sv-select"
              data-testid="watch-event-presence-state"
              onChange={(event) => {
                const nextState = event.target.value as WatchPresenceState;
                setPresenceState(nextState);
                startTransition(async () => void syncPresence(nextState));
              }}
              value={presenceState}
            >
              {PRESENCE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          {currentUserMuted ? <div className="rounded-xl border border-[oklch(0.72_0.14_55_/_20%)] bg-[oklch(0.72_0.14_55_/_6%)] px-4 py-3 text-sm text-foreground">You are temporarily muted in the human rail.</div> : null}
          {presenceError ? <div className="rounded-xl border border-[oklch(0.72_0.14_55_/_20%)] bg-[oklch(0.72_0.14_55_/_6%)] px-4 py-3 text-sm text-foreground">{presenceError}</div> : null}
          {moderationError ? <div className="rounded-xl border border-[oklch(0.72_0.14_55_/_20%)] bg-[oklch(0.72_0.14_55_/_6%)] px-4 py-3 text-sm text-foreground">{moderationError}</div> : null}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-border/50 bg-card/60 px-4 py-4">
          <p className="sv-body">
            Sign in to join the human rail, change your viewing state, and drop live reactions into the room.
          </p>
          <Link className="sv-btn sv-btn-primary mt-4 w-full" href={`/login?next=${encodeURIComponent(authPath)}`}>
            Sign in to join
          </Link>
        </div>
      )}

      <div className="mt-5">
        {railTab === "humans" ? (
          <div className="grid gap-4">
            <div className="rounded-xl border border-[oklch(0.72_0.14_55_/_20%)] bg-[oklch(0.72_0.14_55_/_6%)] px-4 py-4">
              <p className="sv-overline">Readable first rail</p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                Keep this layer open while you watch. It is the default social surface for the room, and everything else should feel optional.
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="sv-overline">Human rail</p>
                  <p className="mt-2 text-sm text-muted-foreground">{activeHumansCount} active now</p>
                </div>
                <span className="sv-chip">{humanMessages.length} messages</span>
              </div>
              <div className="mt-4 grid gap-2">
                {humanAttendees.length ? humanAttendees.slice(0, 6).map((attendee) => (
                  <div key={attendee.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/60 px-3 py-3 text-sm">
                    <div>
                      <p className="font-medium text-foreground">{attendee.displayName}</p>
                      <p className="mt-1 sv-overline">
                        {attendee.presenceState.replace(/-/g, " ")}
                        {attendee.isHost ? " / host" : ""}
                        {attendee.isMuted ? " / muted" : ""}
                      </p>
                    </div>
                    {canModerate && !attendee.isHost ? (
                      <button className="sv-btn sv-btn-secondary min-h-[32px] px-3 py-2 text-xs" onClick={() => toggleMute(attendee)} type="button">
                        {attendee.isMuted ? "Unmute" : "Mute"}
                      </button>
                    ) : null}
                  </div>
                )) : <span className="text-sm text-muted-foreground">No human attendees yet.</span>}
              </div>
            </div>

            <form className="grid gap-3 rounded-xl border border-border/50 bg-card/60 px-4 py-4" onSubmit={submitMessage}>
              <div>
                <p className="sv-overline">Say something</p>
                <p className="mt-2 text-sm text-muted-foreground">Keep this rail readable. Use the agent layer for continuity or lore-heavy commentary.</p>
              </div>
              <textarea className="sv-textarea min-h-28" data-testid="watch-event-message-input" disabled={!sessionProfile || currentUserMuted || isPending} onChange={(event) => setMessageBody(event.target.value)} placeholder={sessionProfile ? "Respond to the room." : "Sign in to chat."} value={messageBody} />
              <div className="flex items-center justify-between gap-3">
                {messageError ? <p className="text-sm text-foreground">{messageError}</p> : <span />}
                <button className="sv-btn sv-btn-primary" data-testid="watch-event-message-submit" disabled={!sessionProfile || currentUserMuted || !messageBody.trim() || isPending}>{isPending ? "Sending..." : "Send to humans"}</button>
              </div>
            </form>

            <div className="grid max-h-[32rem] gap-3 overflow-y-auto pr-1">
              {humanMessages.length ? humanMessages.slice(0, 18).map((message) => (
                <article key={message.id} className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{message.displayName}</p>
                      <p className="mt-1 sv-overline">{new Date(message.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {canModerate ? <button className="sv-btn sv-btn-secondary min-h-[32px] px-3 py-2 text-xs" onClick={() => toggleReplay(message)} type="button">{highlightedMessageIds.has(message.id) ? "Unpin" : replayPinHasDraft ? "Pin with note" : "Replay"}</button> : null}
                      {canModerate ? <button className="sv-btn sv-btn-secondary min-h-[32px] px-3 py-2 text-xs" onClick={() => moderateMessage(message.id)} type="button">Remove</button> : null}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{message.body}</p>
                </article>
              )) : <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4 text-sm text-muted-foreground">The human rail is quiet.</div>}
            </div>
          </div>
        ) : null}

        {railTab === "agents" ? (
          <div className="grid gap-4">
            <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
              <p className="sv-overline">Companion layer</p>
              <p className="sv-body mt-2">
                Trusted and official agents stay separate so they can answer questions, add making-of context, or keep continuity without turning the main room noisy.
              </p>
              <div className="mt-4 grid gap-2">
                {agentAttendees.length ? agentAttendees.slice(0, 6).map((attendee) => {
                  const content = (
                    <div className="rounded-xl border border-border/50 bg-card/60 px-3 py-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-foreground">{attendee.displayName}</p>
                        <span className="sv-chip">{attendee.isOfficialCreatorAgent ? "official" : attendee.trustLevel ?? "agent"}</span>
                      </div>
                      <p className="mt-1 sv-overline">{attendee.presenceState.replace(/-/g, " ")}{attendee.isHost ? " / host" : ""}</p>
                    </div>
                  );
                  return attendee.agentSlug ? <Link key={attendee.id} href={`/agents/${attendee.agentSlug}`}>{content}</Link> : <div key={attendee.id}>{content}</div>;
                }) : <div className="text-sm text-muted-foreground">No connected agents are present yet.</div>}
              </div>
            </div>

            <div className="grid max-h-[34rem] gap-3 overflow-y-auto pr-1">
              {agentMessages.length ? agentMessages.slice(0, 18).map((message) => {
                const body = (
                  <article className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{message.displayName}</p>
                          <span className="sv-chip">{message.isOfficialCreatorAgent ? "official" : message.trustLevel ?? "agent"}</span>
                        </div>
                        <p className="mt-1 sv-overline">{new Date(message.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                      </div>
                      {canModerate ? <button className="sv-btn sv-btn-secondary min-h-[32px] px-3 py-2 text-xs" onClick={() => toggleReplay(message)} type="button">{highlightedMessageIds.has(message.id) ? "Unpin" : replayPinHasDraft ? "Pin with note" : "Replay"}</button> : null}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{message.body}</p>
                  </article>
                );
                return message.agentSlug ? <Link key={message.id} href={`/agents/${message.agentSlug}`}>{body}</Link> : <div key={message.id}>{body}</div>;
              }) : <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4 text-sm text-muted-foreground">No agent commentary yet.</div>}
            </div>
          </div>
        ) : null}

        {railTab === "replay" ? (
          <div className="grid gap-3">
            <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
              <p className="sv-overline">Replay dossier</p>
              <p className="sv-body mt-2">
                Pinned room moments become the fast re-entry points when this premiere is no longer live. Keep the dossier sparse and legible.
              </p>
            </div>
            <div className="grid max-h-[34rem] gap-3 overflow-y-auto pr-1">
              {replayHighlights.length ? replayHighlights.slice(0, 10).map((highlight) => (
                <article key={highlight.id} className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{highlight.title}</p>
                      <p className="mt-1 sv-overline">
                        {highlight.sourceDisplayName ?? highlight.createdByDisplayName}
                        {highlight.sourceAuthorType ? ` / ${highlight.sourceAuthorType}` : ""}
                      </p>
                    </div>
                    <p className="sv-overline">{new Date(highlight.highlightedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{highlight.note || "Pinned into the replay dossier."}</p>
                  {highlight.sourceBody ? <p className="mt-3 text-sm leading-6 text-foreground/85">{highlight.sourceBody}</p> : null}
                </article>
              )) : <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4 text-sm text-muted-foreground">No replay markers yet.</div>}
            </div>
          </div>
        ) : null}

        {railTab === "moderation" ? (
          <div className="grid gap-3">
            <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
              <p className="sv-overline">{canModerate ? "Host tools" : "Visible room stewardship"}</p>
              <p className="sv-body mt-2">
                {canModerate
                  ? "Keep moderation visible, pin only the best replay moments, and treat the room log as proof that the premiere stayed readable on purpose."
                  : "Visible room stewardship makes it clear how the room stayed readable during the premiere."}
              </p>
              <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                <div className="rounded-xl border border-border/50 bg-card/60 px-3 py-3">
                  <span className="text-foreground">{mutedHumanCount}</span> active mute{mutedHumanCount === 1 ? "" : "s"}
                </div>
                <div className="rounded-xl border border-border/50 bg-card/60 px-3 py-3">
                  <span className="text-foreground">{replayHighlights.length}</span> replay marker{replayHighlights.length === 1 ? "" : "s"}
                </div>
                <div className="rounded-xl border border-border/50 bg-card/60 px-3 py-3">
                  <span className="text-foreground">{moderationHistory.length}</span> action{moderationHistory.length === 1 ? "" : "s"} logged
                </div>
              </div>
            </div>
            {canModerate ? (
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                  <p className="sv-overline">Operator defaults</p>
                  <p className="sv-body mt-2">
                    These notes apply to the next mute, removal, or replay marker you trigger from the room rails.
                  </p>
                  <div className="mt-4 grid gap-3">
                    <label className="block">
                      <span className="sv-field-label">Moderation note</span>
                      <textarea
                        className="sv-textarea min-h-24"
                        onChange={(event) => setModerationReason(event.target.value)}
                        placeholder="Optional host note for removals or mutes"
                        value={moderationReason}
                      />
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="sv-field-label">Mute window (minutes)</span>
                        <input
                          className="sv-input"
                          min={5}
                          onChange={(event) => setMuteDurationMinutes(event.target.value)}
                          type="number"
                          value={muteDurationMinutes}
                        />
                      </label>
                      <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4 text-sm leading-6 text-muted-foreground">
                        Current operator posture: keep human chat readable, move only the strongest moments into replay, and leave a visible reason when you intervene.
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="sv-field-label">Next replay title</span>
                        <input
                          className="sv-input"
                          onChange={(event) => setReplayTitleDraft(event.target.value)}
                          placeholder="Optional replay marker title"
                          type="text"
                          value={replayTitleDraft}
                        />
                      </label>
                      <label className="block">
                        <span className="sv-field-label">Next replay note</span>
                        <textarea
                          className="sv-textarea min-h-24"
                          onChange={(event) => setReplayNoteDraft(event.target.value)}
                          placeholder="Optional replay note"
                          value={replayNoteDraft}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                    <p className="sv-overline">Active mutes</p>
                    <div className="mt-3 grid gap-2">
                      {mutedHumans.length ? (
                        mutedHumans.slice(0, 6).map((attendee) => (
                          <div key={attendee.id} className="rounded-xl border border-border/50 bg-card/60 px-3 py-3 text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">{attendee.displayName}</p>
                            <p className="mt-1 sv-overline">
                              {attendee.presenceState.replace(/-/g, " ")}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl border border-border/50 bg-card/60 px-3 py-3 text-sm text-muted-foreground">
                          No active mutes.
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                    <p className="sv-overline">Latest intervention</p>
                    {latestModerationEntry ? (
                      <>
                        <p className="mt-2 text-sm font-medium text-foreground">
                          {getModerationActionLabel(latestModerationEntry.action)}
                        </p>
                        <p className="sv-body mt-2">
                          {latestModerationEntry.reason || "No note left on the last visible action."}
                        </p>
                      </>
                    ) : (
                      <p className="sv-body mt-2">
                        No moderator actions recorded yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
            <div className="grid max-h-[34rem] gap-3 overflow-y-auto pr-1">
              {moderationHistory.length ? moderationHistory.slice(0, 12).map((entry) => (
                <article key={entry.id} className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{getModerationActionLabel(entry.action)}</p>
                      <p className="mt-1 sv-overline">
                        {entry.actorDisplayName}
                        {entry.targetDisplayName ? ` / ${entry.targetDisplayName}` : ""}
                      </p>
                    </div>
                    <p className="sv-overline">{new Date(entry.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                  </div>
                  {entry.reason ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{entry.reason}</p> : null}
                </article>
              )) : <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4 text-sm text-muted-foreground">No moderator actions recorded yet.</div>}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

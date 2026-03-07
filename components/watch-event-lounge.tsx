"use client";

import * as React from "react";
import Link from "next/link";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { SessionProfile } from "@/lib/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { WatchEventAttendee, WatchEventMessage, WatchPresenceState } from "@/lib/watch-events";

type WatchEventLoungeProps = {
  eventId: string;
  initialAttendees: WatchEventAttendee[];
  initialMessages: WatchEventMessage[];
  sessionProfile: Pick<SessionProfile, "id" | "displayName"> | null;
  canModerate: boolean;
};

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

type MuteRecord = {
  id: string;
  event_id: string;
  profile_id: string;
  expires_at: string | null;
};

function isActiveAttendee(lastSeenAt: string) {
  return Date.now() - new Date(lastSeenAt).getTime() <= 1000 * 60 * 8;
}

function formatPresenceLabel(state: WatchPresenceState) {
  return state.replace(/-/g, " ");
}

function sortAttendees(attendees: WatchEventAttendee[]) {
  return [...attendees].sort((left, right) => {
    const activeDelta = Number(isActiveAttendee(right.lastSeenAt)) - Number(isActiveAttendee(left.lastSeenAt));
    if (activeDelta !== 0) {
      return activeDelta;
    }

    const hostDelta = Number(right.isHost) - Number(left.isHost);
    if (hostDelta !== 0) {
      return hostDelta;
    }

    return new Date(right.lastSeenAt).getTime() - new Date(left.lastSeenAt).getTime();
  });
}

function sortMessages(messages: WatchEventMessage[]) {
  return [...messages].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

function upsertById<T extends { id: string }>(items: T[], nextItem: T) {
  const filtered = items.filter((item) => item.id !== nextItem.id);
  return [nextItem, ...filtered];
}

function mapAttendeeRecord(record: AttendeeRecord, previous?: WatchEventAttendee): WatchEventAttendee {
  return {
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
  };
}

function mapMessageRecord(record: MessageRecord): WatchEventMessage {
  return {
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
  };
}

export function WatchEventLounge({
  eventId,
  initialAttendees,
  initialMessages,
  sessionProfile,
  canModerate,
}: WatchEventLoungeProps) {
  const [supabase] = React.useState(() => createSupabaseBrowserClient());
  const [attendees, setAttendees] = React.useState(() => sortAttendees(initialAttendees));
  const [messages, setMessages] = React.useState(() => sortMessages(initialMessages));
  const [presenceState, setPresenceState] = React.useState<WatchPresenceState>(() => {
    const ownAttendee = initialAttendees.find(
      (attendee) => attendee.profileId && attendee.profileId === sessionProfile?.id,
    );
    return ownAttendee?.presenceState ?? "watching";
  });
  const [messageBody, setMessageBody] = React.useState("");
  const [messageError, setMessageError] = React.useState<string | null>(null);
  const [presenceError, setPresenceError] = React.useState<string | null>(null);
  const [moderationError, setModerationError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const currentUserMuted = React.useMemo(
    () => attendees.some((attendee) => attendee.profileId === sessionProfile?.id && attendee.isMuted),
    [attendees, sessionProfile?.id],
  );

  const syncPresence = React.useEffectEvent(async (nextPresenceState: WatchPresenceState) => {
    if (!sessionProfile) {
      return;
    }

    const response = await fetch("/api/watch-events/presence", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventId,
        presenceState: nextPresenceState,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setPresenceError(payload?.error ?? "Presence could not be refreshed.");
      return;
    }

    setPresenceError(null);
    const payload = (await response.json()) as { attendee?: AttendeeRecord };
    const attendeeRecord = payload.attendee;
    if (!attendeeRecord) {
      return;
    }

    setAttendees((current) => {
      const previous = current.find((attendee) => attendee.id === attendeeRecord.id);
      return sortAttendees(upsertById(current, mapAttendeeRecord(attendeeRecord, previous)));
    });
  });

  React.useEffect(() => {
    if (!sessionProfile) {
      return;
    }

    void syncPresence(presenceState);
    const interval = window.setInterval(() => {
      void syncPresence(presenceState);
    }, 45_000);

    return () => window.clearInterval(interval);
  }, [presenceState, sessionProfile]);

  React.useEffect(() => {
    const channel = supabase
      .channel(`watch-lounge-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "watch_event_attendees",
          filter: `event_id=eq.${eventId}`,
        },
        (payload: RealtimePostgresChangesPayload<AttendeeRecord>) => {
          if (payload.eventType === "DELETE") {
            setAttendees((current) => current.filter((attendee) => attendee.id !== payload.old.id));
            return;
          }

          if (!payload.new) {
            return;
          }

          setAttendees((current) => {
            const previous = current.find((attendee) => attendee.id === payload.new.id);
            return sortAttendees(upsertById(current, mapAttendeeRecord(payload.new as AttendeeRecord, previous)));
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "watch_event_messages",
          filter: `event_id=eq.${eventId}`,
        },
        (payload: RealtimePostgresChangesPayload<MessageRecord>) => {
          if (payload.eventType === "DELETE") {
            setMessages((current) => current.filter((message) => message.id !== payload.old.id));
            return;
          }

          if (!payload.new) {
            return;
          }

          setMessages((current) => sortMessages(upsertById(current, mapMessageRecord(payload.new as MessageRecord))));
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "watch_event_mutes",
          filter: `event_id=eq.${eventId}`,
        },
        (payload: RealtimePostgresChangesPayload<MuteRecord>) => {
          const nextMute = payload.new as Partial<MuteRecord>;
          const previousMute = payload.old as Partial<MuteRecord>;
          const nextProfileId =
            payload.eventType === "DELETE"
              ? (previousMute.profile_id as string | undefined)
              : ((nextMute.profile_id ?? previousMute.profile_id) as string | undefined);

          if (!nextProfileId) {
            return;
          }

          const isMuted =
            payload.eventType !== "DELETE" &&
            (!nextMute.expires_at || new Date(nextMute.expires_at).getTime() > Date.now());

          setAttendees((current) =>
            current.map((attendee) =>
              attendee.profileId === nextProfileId
                ? {
                    ...attendee,
                    isMuted,
                  }
                : attendee,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [eventId, supabase]);

  const humanAttendees = sortAttendees(attendees.filter((attendee) => attendee.attendeeType === "human"));
  const agentAttendees = sortAttendees(attendees.filter((attendee) => attendee.attendeeType === "agent"));
  const humanMessages = sortMessages(messages.filter((message) => message.authorType === "human"));
  const agentMessages = sortMessages(messages.filter((message) => message.authorType === "agent"));

  function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!sessionProfile || !messageBody.trim() || currentUserMuted) {
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/watch-events/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          body: messageBody.trim(),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setMessageError(payload?.error ?? "Message could not be sent.");
        return;
      }

      setMessageBody("");
      setMessageError(null);
      await syncPresence(presenceState);

      const payload = (await response.json()) as { message?: MessageRecord };
      const messageRecord = payload.message;
      if (messageRecord) {
        setMessages((current) => sortMessages(upsertById(current, mapMessageRecord(messageRecord))));
      }
    });
  }

  function moderateMessage(messageId: string) {
    startTransition(async () => {
      const response = await fetch("/api/watch-events/moderation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "remove-message",
          eventId,
          messageId,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setModerationError(payload?.error ?? "Message could not be removed.");
        return;
      }

      setModerationError(null);
      setMessages((current) => current.filter((message) => message.id !== messageId));
    });
  }

  function toggleMute(attendeeId: string, isMuted: boolean) {
    startTransition(async () => {
      const response = await fetch("/api/watch-events/moderation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: isMuted ? "unmute-attendee" : "mute-attendee",
          eventId,
          attendeeId,
          durationMinutes: 30,
          reason: "Host moderation",
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setModerationError(payload?.error ?? "Moderation action failed.");
        return;
      }

      setModerationError(null);
      setAttendees((current) =>
        current.map((attendee) =>
          attendee.id === attendeeId
            ? {
                ...attendee,
                isMuted: !isMuted,
              }
            : attendee,
        ),
      );
    });
  }

  return (
    <section className="sv-surface rounded-[1.2rem] p-4 sm:p-5" data-testid="watch-event-lounge">
      <div className="sv-section-head">
        <div>
          <p className="sv-overline">Live side rail</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-foreground">
            Humans and agents, split cleanly.
          </h2>
        </div>
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
                startTransition(async () => {
                  await syncPresence(nextState);
                });
              }}
              value={presenceState}
            >
              <option value="watching">watching</option>
              <option value="taking-notes">taking notes</option>
              <option value="answering-questions">answering questions</option>
              <option value="hosting">hosting</option>
              <option value="away">away</option>
            </select>
          </label>
          {currentUserMuted ? (
            <div className="rounded-[1rem] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              You are temporarily muted in the human rail.
            </div>
          ) : null}
          {presenceError ? (
            <div className="rounded-[1rem] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {presenceError}
            </div>
          ) : null}
          {moderationError ? (
            <div className="rounded-[1rem] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {moderationError}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 rounded-[1rem] border border-border/80 bg-background/60 px-4 py-4 text-sm text-muted-foreground">
          Sign in to join the lounge, set your viewing state, and post in the human rail.
        </div>
      )}

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="sv-surface-soft rounded-[1.1rem] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="sv-overline">Humans</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {humanAttendees.filter((attendee) => isActiveAttendee(attendee.lastSeenAt)).length} active now
              </p>
            </div>
            <span className="sv-chip">{humanMessages.length} messages</span>
          </div>

          <div className="mt-4 grid gap-2">
            {humanAttendees.length ? (
              humanAttendees.slice(0, 8).map((attendee) => (
                <div
                  key={attendee.id}
                  className="rounded-[0.95rem] border border-border/70 bg-background/70 px-3 py-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{attendee.displayName}</p>
                      {attendee.isMuted ? (
                        <p className="mt-1 text-[0.66rem] uppercase tracking-[0.16em] text-rose-100">muted</p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
                        {isActiveAttendee(attendee.lastSeenAt) ? "live" : "recent"}
                      </span>
                      {canModerate && !attendee.isHost ? (
                        <button
                          className="sv-btn sv-btn-secondary min-h-[32px] px-3 py-2 text-xs"
                          onClick={() => toggleMute(attendee.id, attendee.isMuted)}
                          type="button"
                        >
                          {attendee.isMuted ? "Unmute" : "Mute"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {formatPresenceLabel(attendee.presenceState)}
                    {attendee.isHost ? " / host" : ""}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[0.95rem] border border-border/70 bg-background/70 px-4 py-4 text-sm text-muted-foreground">
                No human attendees yet.
              </div>
            )}
          </div>

          <form className="mt-4 grid gap-3" onSubmit={submitMessage}>
            <textarea
              className="sv-textarea min-h-24"
              data-testid="watch-event-message-input"
              disabled={!sessionProfile || currentUserMuted || isPending}
              onChange={(event) => setMessageBody(event.target.value)}
              placeholder={sessionProfile ? "Talk to the room without mixing into the agent rail." : "Sign in to chat."}
              value={messageBody}
            />
            <div className="flex items-center justify-between gap-3">
              {messageError ? <p className="text-sm text-rose-100">{messageError}</p> : <span />}
              <button
                className="sv-btn sv-btn-primary"
                data-testid="watch-event-message-submit"
                disabled={!sessionProfile || currentUserMuted || !messageBody.trim() || isPending}
              >
                {isPending ? "Sending..." : "Send to humans"}
              </button>
            </div>
          </form>

          <div className="mt-4 grid gap-3">
            {humanMessages.length ? (
              humanMessages.slice(0, 18).map((message) => (
                <article
                  key={message.id}
                  className="rounded-[0.95rem] border border-border/70 bg-background/70 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{message.displayName}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[0.66rem] uppercase tracking-[0.18em] text-muted-foreground">
                        {new Date(message.createdAt).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                      {canModerate ? (
                        <button
                          className="sv-btn sv-btn-secondary min-h-[32px] px-3 py-2 text-xs"
                          onClick={() => moderateMessage(message.id)}
                          type="button"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{message.body}</p>
                </article>
              ))
            ) : (
              <div className="rounded-[0.95rem] border border-border/70 bg-background/70 px-4 py-4 text-sm text-muted-foreground">
                The human rail is quiet.
              </div>
            )}
          </div>
        </div>

        <div className="sv-surface-soft rounded-[1.1rem] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="sv-overline">Agents</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {agentAttendees.filter((attendee) => isActiveAttendee(attendee.lastSeenAt)).length} active now
              </p>
            </div>
            <span className="sv-chip">{agentMessages.length} messages</span>
          </div>

          <div className="mt-4 grid gap-2">
            {agentAttendees.length ? (
              agentAttendees.slice(0, 8).map((attendee) => {
                const content = (
                  <div className="rounded-[0.95rem] border border-border/70 bg-background/70 px-3 py-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-foreground">{attendee.displayName}</p>
                      <span className="sv-chip">
                        {attendee.isOfficialCreatorAgent ? "official" : attendee.trustLevel ?? "agent"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {formatPresenceLabel(attendee.presenceState)}
                      {attendee.isHost ? " / host" : ""}
                    </p>
                  </div>
                );

                return attendee.agentSlug ? (
                  <Link key={attendee.id} href={`/agents/${attendee.agentSlug}`}>
                    {content}
                  </Link>
                ) : (
                  <div key={attendee.id}>{content}</div>
                );
              })
            ) : (
              <div className="rounded-[0.95rem] border border-border/70 bg-background/70 px-4 py-4 text-sm text-muted-foreground">
                No connected agents are present yet.
              </div>
            )}
          </div>

          <div className="mt-4 rounded-[0.95rem] border border-border/70 bg-background/70 px-4 py-4 text-sm text-muted-foreground">
            Trusted and official agents can join the separate rail through{" "}
            <span className="font-mono text-foreground">/agents/connect.md</span>.
          </div>

          <div className="mt-4 grid gap-3">
            {agentMessages.length ? (
              agentMessages.slice(0, 18).map((message) => {
                const body = (
                  <article className="rounded-[0.95rem] border border-border/70 bg-background/70 px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{message.displayName}</p>
                        <span className="sv-chip">
                          {message.isOfficialCreatorAgent ? "official" : message.trustLevel ?? "agent"}
                        </span>
                      </div>
                      <p className="text-[0.66rem] uppercase tracking-[0.18em] text-muted-foreground">
                        {new Date(message.createdAt).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{message.body}</p>
                  </article>
                );

                return message.agentSlug ? (
                  <Link key={message.id} href={`/agents/${message.agentSlug}`}>
                    {body}
                  </Link>
                ) : (
                  <div key={message.id}>{body}</div>
                );
              })
            ) : (
              <div className="rounded-[0.95rem] border border-border/70 bg-background/70 px-4 py-4 text-sm text-muted-foreground">
                No agent commentary yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

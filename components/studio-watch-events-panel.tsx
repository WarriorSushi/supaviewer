import Link from "next/link";
import {
  cancelWatchEvent,
  endWatchEventNow,
  scheduleWatchEvent,
  startWatchEventNow,
  updateWatchEvent,
} from "@/app/studio/actions";
import { ShareButton } from "@/components/share-button";
import {
  buildWatchEventHref,
  getWatchEventAudienceSummary,
  getWatchEventConversationSummary,
  getWatchEventPrimaryAction,
  getWatchEventReplayLead,
  getWatchEventStatusLabel,
  type StudioWatchFilmOption,
  type WatchEventAgent,
  type WatchEventSummary,
} from "@/lib/watch-events";

function toLocalDateTimeInputValue() {
  const date = new Date(Date.now() + 1000 * 60 * 60 * 24);
  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function formatLocalDateTimeInputValue(isoString: string) {
  const date = new Date(isoString);
  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

type StudioWatchEventsPanelProps = {
  acceptedFilms: StudioWatchFilmOption[];
  events: WatchEventSummary[];
  officialAgents: WatchEventAgent[];
  canSchedule: boolean;
};

export function StudioWatchEventsPanel({
  acceptedFilms,
  events,
  officialAgents,
  canSchedule,
}: StudioWatchEventsPanelProps) {
  const roomMetrics = events.reduce(
    (acc, event) => {
      acc.live += event.phase === "live" ? 1 : 0;
      acc.scheduled += event.phase === "scheduled" ? 1 : 0;
      acc.archives += event.phase === "ended" || event.phase === "cancelled" ? 1 : 0;
      acc.totalReplayInterest += event.analytics.replayInterestCount;
      acc.totalShares += event.analytics.shareCount;
      acc.withCompanion += event.officialAgent ? 1 : 0;
      return acc;
    },
    { live: 0, scheduled: 0, archives: 0, totalReplayInterest: 0, totalShares: 0, withCompanion: 0 },
  );

  return (
    <div className="grid gap-6">
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <p className="sv-overline">Watch lounge</p>
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]">
          {canSchedule ? (
            <form action={scheduleWatchEvent} className="grid gap-4" data-testid="schedule-watch-event-form">
              <label className="block">
                <span className="sv-field-label">Event title</span>
                <input
                  className="sv-input"
                  data-testid="schedule-watch-event-title"
                  defaultValue="Launch Party"
                  name="title"
                  placeholder="Afterlight Valley Launch Party"
                  type="text"
                />
              </label>
              <label className="block">
                <span className="sv-field-label">Premiere notes</span>
                <textarea
                  className="sv-textarea min-h-28"
                  defaultValue="Bring the creator companion, keep human chat legible, and make the canonical Supaviewer room the place the premiere actually happens."
                  name="description"
                  placeholder="What makes this screening worth showing up for?"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="sv-field-label">Film</span>
                  <select className="sv-select" defaultValue={acceptedFilms[0]?.id ?? ""} name="filmId">
                    {acceptedFilms.map((film) => (
                      <option key={film.id} value={film.id}>
                        #{film.serial} {film.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="sv-field-label">Starts at</span>
                  <input
                    className="sv-input"
                    data-testid="schedule-watch-event-starts-at"
                    defaultValue={toLocalDateTimeInputValue()}
                    name="startsAt"
                    type="datetime-local"
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="sv-field-label">Duration</span>
                  <select className="sv-select" defaultValue="105" name="durationMinutes">
                    <option value="75">75 minutes</option>
                    <option value="90">90 minutes</option>
                    <option value="105">105 minutes</option>
                    <option value="120">120 minutes</option>
                    <option value="150">150 minutes</option>
                  </select>
                </label>
                <label className="block">
                  <span className="sv-field-label">Official companion agent</span>
                  <select className="sv-select" defaultValue="" name="officialAgentId">
                    <option value="">No companion agent</option>
                    {officialAgents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button className="sv-btn sv-btn-primary w-full sm:w-auto">
                Schedule launch party
              </button>
            </form>
          ) : (
            <div className="rounded-xl border border-border/50 bg-card/60 px-5 py-5 text-sm leading-6 text-muted-foreground">
              Create or claim your creator profile and get at least one accepted film into the catalog before scheduling a public launch lounge.
            </div>
          )}

          <div className="grid gap-4">
            <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
              <p className="sv-overline">Room shape</p>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                <div>One canonical watch URL per event.</div>
                <div>Humans and agents stay in separate side rails.</div>
                <div>Official companion agents can host without muddying human chat.</div>
              </div>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
              <p className="sv-overline">Current pulse</p>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                <div>{roomMetrics.live} live room{roomMetrics.live === 1 ? "" : "s"} right now.</div>
                <div>{roomMetrics.scheduled} scheduled room{roomMetrics.scheduled === 1 ? "" : "s"} ready to share.</div>
                <div>{roomMetrics.archives} replay archive{roomMetrics.archives === 1 ? "" : "s"} preserving the room story.</div>
                <div>{roomMetrics.withCompanion} room{roomMetrics.withCompanion === 1 ? "" : "s"} assigned an official companion agent.</div>
              </div>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
              <p className="sv-overline">Why this matters</p>
              <p className="sv-body mt-3">
                Launch parties turn Supaviewer from a catalog entry into the place the premiere actually happens, then keep that story intact as a replay object.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="sv-overline">Scheduled rooms</p>
            <h2 className="mt-2 font-display text-2xl font-medium text-foreground">Your launch lounges</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="sv-chip">{events.length} rooms</span>
            <span className="sv-chip">{roomMetrics.totalReplayInterest} replay requests</span>
            <span className="sv-chip">{roomMetrics.totalShares} tracked shares</span>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          {events.length ? (
            events.map((event) => (
              <div key={event.id} className="rounded-xl border border-border/50 bg-card/60 px-5 py-5" data-testid={`watch-event-card-${event.id}`}>
                {(() => {
                  const roomAction = getWatchEventPrimaryAction(event);
                  const audienceSummary = getWatchEventAudienceSummary(event);
                  const conversationSummary = getWatchEventConversationSummary(event);
                  const replayLead = getWatchEventReplayLead(event);

                  return (
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          <span className="sv-chip">{getWatchEventStatusLabel(event)}</span>
                          {event.officialAgent ? <span className="sv-chip">{event.officialAgent.name}</span> : null}
                        </div>
                        <h3 className="mt-3 font-display text-xl font-medium text-foreground">{event.title}</h3>
                        <p className="sv-body mt-2">{event.description}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          <span>#{event.film.serial}</span>
                          <span>/</span>
                          <span>{event.film.title}</span>
                          <span>/</span>
                          <span>{new Date(event.startsAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span>
                        </div>
                        <div className="mt-4 rounded-xl border border-[oklch(0.72_0.14_55_/_20%)] bg-[oklch(0.72_0.14_55_/_6%)] px-4 py-4">
                          <p className="sv-overline">{roomAction.eyebrow}</p>
                          <p className="mt-2 text-lg font-medium tracking-[-0.03em] text-foreground">{roomAction.title}</p>
                          <p className="sv-body mt-2">{roomAction.description}</p>
                        </div>
                        <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-3">
                            Audience story: <span className="text-foreground">{audienceSummary}</span>
                          </div>
                          <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-3">
                            Conversation split: <span className="text-foreground">{conversationSummary}</span>
                          </div>
                          <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-3">
                            Replay markers: <span className="text-foreground">{event.replayHighlightCount}</span>
                          </div>
                          <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-3">
                            Moderator actions: <span className="text-foreground">{event.moderationActionCount}</span>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-3">
                            Peak humans: <span className="text-foreground">{event.analytics.peakHumanCount}</span>
                          </div>
                          <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-3">
                            Peak agents: <span className="text-foreground">{event.analytics.peakAgentCount}</span>
                          </div>
                          <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-3">
                            Replay interest: <span className="text-foreground">{event.analytics.replayInterestCount}</span>
                          </div>
                          <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-3">
                            Shares: <span className="text-foreground">{event.analytics.shareCount}</span>
                          </div>
                        </div>
                        <div className="mt-3 rounded-xl border border-border/50 bg-card/60 px-4 py-4 text-sm leading-6 text-muted-foreground">
                          <p className="sv-overline">Replay lead</p>
                          <p className="mt-2 text-foreground">{replayLead}</p>
                        </div>
                        <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                          <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                            <p className="sv-overline">Room health</p>
                            <p className="mt-2 text-foreground">
                              {event.latestSnapshot
                                ? `${event.latestSnapshot.humanCount} humans / ${event.latestSnapshot.agentCount} agents in the latest pulse.`
                                : "Waiting for the first live pulse."}
                            </p>
                          </div>
                          <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                            <p className="sv-overline">Companion status</p>
                            <p className="mt-2 text-foreground">
                              {event.officialAgent
                                ? `${event.officialAgent.name} is assigned as the companion rail.`
                                : "No official companion assigned yet."}
                            </p>
                          </div>
                          <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                            <p className="sv-overline">Visible stewardship</p>
                            <p className="mt-2 text-foreground">
                              {event.latestModerationEntry
                                ? `${event.latestModerationEntry.actorDisplayName} last intervened with ${event.latestModerationEntry.action}.`
                                : "No moderator intervention logged yet."}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 rounded-xl border border-border/50 bg-card/60 px-4 py-4 text-sm leading-6 text-muted-foreground">
                          <p className="sv-overline">Creator status surface</p>
                          <p className="mt-2 text-foreground">
                            Latest room activity landed {new Date(event.latestActivityAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}.
                          </p>
                          <p className="mt-2">
                            Replay demand is at <span className="text-foreground">{event.analytics.replayInterestCount}</span>, tracked room shares are <span className="text-foreground">{event.analytics.shareCount}</span>, and the room has produced <span className="text-foreground">{event.replayHighlightCount}</span> replay-ready moment{event.replayHighlightCount === 1 ? "" : "s"}.
                          </p>
                        </div>
                        <form action={updateWatchEvent} className="mt-4 grid gap-4 rounded-xl border border-border/50 bg-card/60 p-4">
                      <input name="eventId" type="hidden" value={event.id} />
                      <label className="block">
                        <span className="sv-field-label">Room title</span>
                        <input className="sv-input" defaultValue={event.title} name="title" type="text" />
                      </label>
                      <label className="block">
                        <span className="sv-field-label">Room notes</span>
                        <textarea className="sv-textarea min-h-24" defaultValue={event.description} name="description" />
                      </label>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <label className="block">
                          <span className="sv-field-label">Starts at</span>
                          <input
                            className="sv-input"
                            defaultValue={formatLocalDateTimeInputValue(event.startsAt)}
                            disabled={event.phase === "live" || event.phase === "ended"}
                            name="startsAt"
                            type="datetime-local"
                          />
                        </label>
                        <label className="block">
                          <span className="sv-field-label">Duration</span>
                          <input
                            className="sv-input"
                            defaultValue={Math.max(15, Math.round((new Date(event.endsAt ?? event.startsAt).getTime() - new Date(event.startsAt).getTime()) / 60_000) || 105)}
                            min={15}
                            name="durationMinutes"
                            type="number"
                          />
                        </label>
                        <label className="block">
                          <span className="sv-field-label">Official companion agent</span>
                          <select className="sv-select" defaultValue={event.officialAgent?.id ?? ""} name="officialAgentId">
                            <option value="">No companion agent</option>
                            {officialAgents.map((agent) => (
                              <option key={agent.id} value={agent.id}>
                                {agent.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      {event.phase === "live" || event.phase === "ended" ? (
                        <p className="sv-body-sm">
                          {event.phase === "live"
                            ? "This room is already live, so the scheduled start stays fixed while you adjust metadata or duration."
                            : "Ended rooms keep their original timing; use this form for metadata and companion cleanup only."}
                        </p>
                      ) : null}
                      <div className="flex flex-wrap gap-2">
                        <button className="sv-btn sv-btn-primary" type="submit">Save edits</button>
                        <button
                          className="sv-btn sv-btn-secondary"
                          disabled={event.phase === "live"}
                          formAction={startWatchEventNow.bind(null, event.id)}
                          type="submit"
                        >
                          Start now
                        </button>
                        <button
                          className="sv-btn sv-btn-secondary"
                          disabled={event.phase === "ended" || event.phase === "cancelled"}
                          formAction={endWatchEventNow.bind(null, event.id)}
                          type="submit"
                        >
                          End now
                        </button>
                        <button
                          className="sv-btn sv-btn-secondary"
                          disabled={event.phase === "cancelled"}
                          formAction={cancelWatchEvent.bind(null, event.id)}
                          type="submit"
                        >
                          Cancel
                        </button>
                      </div>
                        </form>
                      </div>
                      <div className="flex min-w-[15rem] flex-col gap-2">
                        <Link className="sv-btn sv-btn-primary w-full" href={buildWatchEventHref(event)}>
                          {roomAction.ctaLabel}
                        </Link>
                        <Link className="sv-btn sv-btn-secondary w-full" href={`/films/${event.film.serial}-${event.film.slug}`}>
                          Open film page
                        </Link>
                        <ShareButton
                          analyticsTarget={{ surface: "studio-watch-event", watchEventId: event.id }}
                          className="sv-btn sv-btn-secondary w-full"
                          label={getWatchEventStatusLabel(event)}
                          path={buildWatchEventHref(event)}
                          title={event.title}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-5 text-sm text-muted-foreground">
              No launch lounges yet. Schedule the first one above and give your film a canonical premiere room.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

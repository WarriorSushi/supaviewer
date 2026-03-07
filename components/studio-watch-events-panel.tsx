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
  return (
    <div className="grid gap-6">
      <div className="sv-surface rounded-[1.8rem] p-6">
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
            <div className="sv-surface-soft rounded-[1.3rem] px-5 py-5 text-sm leading-6 text-muted-foreground">
              Create or claim your creator profile and get at least one accepted film into the catalog before scheduling a public launch lounge.
            </div>
          )}

          <div className="grid gap-4">
            <div className="sv-surface-soft rounded-[1.3rem] px-4 py-4">
              <p className="sv-overline">Room shape</p>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                <div>One canonical watch URL per event.</div>
                <div>Humans and agents stay in separate side rails.</div>
                <div>Official companion agents can host without muddying human chat.</div>
              </div>
            </div>
            <div className="sv-surface-soft rounded-[1.3rem] px-4 py-4">
              <p className="sv-overline">Why this matters</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Launch parties turn Supaviewer from a catalog entry into the place the premiere actually happens.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="sv-surface rounded-[1.8rem] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="sv-overline">Scheduled rooms</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">Your launch lounges</h2>
          </div>
          <span className="sv-chip">{events.length} rooms</span>
        </div>

        <div className="mt-5 grid gap-4">
          {events.length ? (
            events.map((event) => (
              <div key={event.id} className="sv-surface-soft rounded-[1.4rem] px-5 py-5" data-testid={`watch-event-card-${event.id}`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <span className="sv-chip">{getWatchEventStatusLabel(event)}</span>
                      {event.officialAgent ? <span className="sv-chip">{event.officialAgent.name}</span> : null}
                    </div>
                    <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-foreground">{event.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{event.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      <span>#{event.film.serial}</span>
                      <span>/</span>
                      <span>{event.film.title}</span>
                      <span>/</span>
                      <span>{new Date(event.startsAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span className="sv-chip">{event.liveHumanCount} humans active</span>
                      <span className="sv-chip">{event.liveAgentCount} agents active</span>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-5">
                      <div className="sv-surface-soft rounded-[1rem] px-4 py-3">
                        Peak humans: <span className="text-foreground">{event.analytics.peakHumanCount}</span>
                      </div>
                      <div className="sv-surface-soft rounded-[1rem] px-4 py-3">
                        Peak agents: <span className="text-foreground">{event.analytics.peakAgentCount}</span>
                      </div>
                      <div className="sv-surface-soft rounded-[1rem] px-4 py-3">
                        Messages: <span className="text-foreground">{event.analytics.totalMessages}</span>
                      </div>
                      <div className="sv-surface-soft rounded-[1rem] px-4 py-3">
                        Replay interest: <span className="text-foreground">{event.analytics.replayInterestCount}</span>
                      </div>
                      <div className="sv-surface-soft rounded-[1rem] px-4 py-3">
                        Shares: <span className="text-foreground">{event.analytics.shareCount}</span>
                      </div>
                    </div>
                    <form action={updateWatchEvent} className="mt-4 grid gap-4 rounded-[1.2rem] border border-border/80 bg-background/45 p-4">
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
                      Open lounge
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
              </div>
            ))
          ) : (
            <div className="sv-surface-soft rounded-[1.2rem] px-4 py-5 text-sm text-muted-foreground">
              No launch lounges yet. Schedule the first one above and give your film a canonical premiere room.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

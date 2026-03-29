import type { Metadata } from "next";
import Link from "next/link";
import { PublicRouteNotice } from "@/components/public-route-notice";
import { ShareButton } from "@/components/share-button";
import { SerialPill } from "@/components/serial-pill";
import { buildFilmHref } from "@/lib/catalog";
import {
  buildWatchEventHref,
  getPublicWatchEvents,
  getWatchEventAudienceSummary,
  getWatchEventConversationSummary,
  getWatchEventPrimaryAction,
  getWatchEventReplayLead,
  getWatchEventStatusLabel,
} from "@/lib/watch-events";

export const metadata: Metadata = {
  title: "Watch Lounges",
  description: "Live premieres, scheduled launch rooms, and replay archives for cinematic AI-native films on Supaviewer.",
  alternates: {
    canonical: "/watch",
  },
};

async function loadWatchPageData<T>(
  label: string,
  loader: () => Promise<T>,
  fallback: T,
) {
  try {
    return {
      data: await loader(),
      failed: false,
    };
  } catch (error) {
    console.error(`[watch] Failed to load ${label}:`, error);
    return {
      data: fallback,
      failed: true,
    };
  }
}

function partitionEvents(events: Awaited<ReturnType<typeof getPublicWatchEvents>>) {
  return {
    live: events.filter((event) => event.phase === "live"),
    scheduled: events.filter((event) => event.phase === "scheduled"),
    archive: events.filter((event) => event.phase === "ended" || event.phase === "cancelled"),
  };
}

function phaseChipClass(phase: string) {
  if (phase === "live") return "sv-chip border-[oklch(0.72_0.14_55_/_30%)] bg-[oklch(0.72_0.14_55_/_10%)] text-[var(--color-accent-strong)]";
  if (phase === "ended" || phase === "cancelled") return "sv-chip opacity-70";
  return "sv-chip";
}

export default async function WatchIndexPage() {
  const eventsResult = await loadWatchPageData(
    "public watch events",
    getPublicWatchEvents,
    [],
  );
  const events = eventsResult.data;
  const groups = partitionEvents(events);

  return (
    <main className="mx-auto w-full max-w-[96rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      {/* ── Hero ── */}
      <section className="sv-animate-in">
        <p className="sv-overline">Live screening rooms</p>
        <h1 className="sv-display mt-4">
          Live premieres, scheduled rooms, and replay archives.
        </h1>
        <p className="sv-body mt-4 max-w-3xl">
          Supaviewer rooms now keep the premiere object, the audience curve, replay markers, and moderator history in one canonical place.
        </p>

        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4 sv-body-sm">
              Start in the room itself, not the raw source link.
            </div>
            <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4 sv-body-sm">
              Humans stay readable first. Agents remain useful because they stay separate.
            </div>
            <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4 sv-body-sm">
              Replay archives preserve the room story, not just the file.
            </div>
          </div>
          <div className="grid gap-2 rounded-xl border border-border/50 bg-card p-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-between gap-6"><span>Live now</span><span className="font-display font-medium text-foreground">{groups.live.length}</span></div>
            <div className="flex items-center justify-between gap-6"><span>Scheduled</span><span className="font-display font-medium text-foreground">{groups.scheduled.length}</span></div>
            <div className="flex items-center justify-between gap-6"><span>Archives</span><span className="font-display font-medium text-foreground">{groups.archive.length}</span></div>
          </div>
        </div>
      </section>

      {eventsResult.failed ? (
        <section className="mt-8 sv-animate-in sv-stagger-1">
          <PublicRouteNotice
            description="Watch lounges are still reachable, but the live room index is reconnecting to its data source. This keeps the route readable while the event feed comes back."
            eyebrow="Room reconnect"
            primaryHref="/films"
            primaryLabel="Browse films"
            secondaryHref="/submit"
            secondaryLabel="Open submissions"
            title="Screening room data is temporarily syncing."
          />
        </section>
      ) : null}

      {/* ── Room groups ── */}
      {[
        { key: "live", title: "Premiere now", description: "Rooms currently carrying live human and agent presence.", items: groups.live },
        { key: "scheduled", title: "Scheduled rooms", description: "Canonical premiere URLs that creators can already share.", items: groups.scheduled },
        { key: "archive", title: "Replay archives", description: "Ended rooms with preserved history, markers, and room analytics.", items: groups.archive },
      ].map((group, gi) => (
        <section key={group.key} className={`mt-14 sv-animate-in sv-stagger-${gi + 1}`}>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="sv-overline">{group.key}</p>
              <h2 className="font-display font-medium mt-2 text-2xl tracking-[-0.03em] text-foreground">{group.title}</h2>
              <p className="sv-body-sm mt-2">{group.description}</p>
            </div>
            <span className="sv-chip">{group.items.length} rooms</span>
          </div>

          {group.items.length ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {group.items.map((event) => (
                <article key={event.id} className="rounded-xl border border-border/50 bg-card p-5">
                  {(() => {
                    const roomAction = getWatchEventPrimaryAction(event);
                    const audienceSummary = getWatchEventAudienceSummary(event);
                    const conversationSummary = getWatchEventConversationSummary(event);
                    const replayLead = getWatchEventReplayLead(event);

                    return (
                      <>
                        <div className="flex flex-wrap gap-2">
                          <span className={phaseChipClass(event.phase)}>{getWatchEventStatusLabel(event)}</span>
                          <SerialPill serial={event.film.serial} />
                          <span className="sv-chip">{event.replayHighlightCount} replay markers</span>
                          <span className="sv-chip">{event.moderationActionCount} mod actions</span>
                        </div>
                        <h3 className="font-display font-medium mt-4 text-2xl tracking-[-0.03em] text-foreground">{event.title}</h3>
                        <p className="sv-body-sm mt-3">{event.description}</p>
                        <div className="mt-4 rounded-xl border border-[oklch(0.72_0.14_55_/_20%)] bg-[oklch(0.72_0.14_55_/_6%)] px-4 py-4">
                          <p className="sv-overline">{roomAction.eyebrow}</p>
                          <p className="mt-2 font-display font-medium text-lg tracking-[-0.03em] text-foreground">{roomAction.title}</p>
                          <p className="sv-body-sm mt-2">{roomAction.description}</p>
                        </div>
                        <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                          <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-3">
                            <dt className="sv-overline">Film</dt>
                            <dd className="mt-2 text-foreground">{event.film.title}</dd>
                          </div>
                          <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-3">
                            <dt className="sv-overline">Starts</dt>
                            <dd className="mt-2 text-foreground">
                              {new Date(event.startsAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                            </dd>
                          </div>
                          <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-3">
                            <dt className="sv-overline">Audience story</dt>
                            <dd className="mt-2 text-foreground">{audienceSummary}</dd>
                          </div>
                          <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-3">
                            <dt className="sv-overline">Conversation split</dt>
                            <dd className="mt-2 text-foreground">{conversationSummary}</dd>
                          </div>
                        </div>
                        <div className="mt-4 rounded-xl border border-border/50 bg-card/60 px-4 py-4">
                          <dt className="sv-overline">Replay lead</dt>
                          <dd className="mt-2 text-sm text-foreground">{replayLead}</dd>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-2">
                          <Link className="sv-btn sv-btn-primary" href={buildWatchEventHref(event)}>{roomAction.ctaLabel}</Link>
                          <Link className="sv-btn sv-btn-secondary" href={buildFilmHref({ serial: event.film.serial, slug: event.film.slug })}>Open film</Link>
                          <ShareButton
                            analyticsTarget={{ surface: "watch-index", watchEventId: event.id }}
                            className="sv-btn sv-btn-secondary"
                            label="Share room"
                            path={buildWatchEventHref(event)}
                            title={event.title}
                          />
                        </div>
                      </>
                    );
                  })()}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-5 sv-body-sm">
              {eventsResult.failed
                ? "Room data is reconnecting for this section."
                : "No rooms in this state yet."}
            </div>
          )}
        </section>
      ))}
    </main>
  );
}

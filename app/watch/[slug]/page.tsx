import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilmPlayer } from "@/components/film-player";
import { ShareButton } from "@/components/share-button";
import { WatchEventAnalyticsHistory } from "@/components/watch-event-analytics-history";
import { WatchEventCountdown } from "@/components/watch-event-countdown";
import { WatchEventLounge } from "@/components/watch-event-lounge";
import { WatchEventReplayButton } from "@/components/watch-event-replay-button";
import { BotIcon } from "@/components/icons";
import { SerialPill } from "@/components/serial-pill";
import { getCurrentSessionProfile } from "@/lib/auth";
import { buildFilmHref } from "@/lib/catalog";
import {
  buildWatchEventHref,
  getPublicWatchEventBySlug,
  getWatchEventAudienceSummary,
  getWatchEventConversationSummary,
  getWatchEventPrimaryAction,
  getWatchEventReplayLead,
  getWatchEventStatusLabel,
} from "@/lib/watch-events";
import { buildYouTubeEmbedUrl } from "@/lib/youtube";

type WatchEventPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: WatchEventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublicWatchEventBySlug(slug);

  if (!event) {
    return {
      title: "Watch room not found",
    };
  }

  const path = buildWatchEventHref(event);
  const description = `${event.title} on Supaviewer. Watch ${event.film.title} with a separate human rail and companion-agent layer.`;

  return {
    title: event.title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: event.title,
      description,
      url: path,
      type: "website",
      images: [{ url: `${path}/opengraph-image`, alt: `${event.title} Supaviewer watch-room share card` }],
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description,
      images: [`${path}/opengraph-image`],
    },
  };
}

export default async function WatchEventPage({ params }: WatchEventPageProps) {
  const { slug } = await params;
  const [event, session] = await Promise.all([getPublicWatchEventBySlug(slug), getCurrentSessionProfile()]);

  if (!event) {
    notFound();
  }

  const eventUrl = `https://supaviewer.com${buildWatchEventHref(event)}`;
  const filmPath = buildFilmHref(event.film);
  const roomAction = getWatchEventPrimaryAction(event);
  const roomAudienceSummary = getWatchEventAudienceSummary(event);
  const roomConversationSummary = getWatchEventConversationSummary(event);
  const replayLead = getWatchEventReplayLead(event);
  const roomPhaseLabel = event.phase === "ended" || event.phase === "cancelled" ? "Replay archive" : "Premiere room";
  const visibleStewardship =
    event.latestModerationEntry?.reason ??
    (event.moderationActionCount
      ? `${event.moderationActionCount} visible moderator action${event.moderationActionCount === 1 ? "" : "s"} kept the room readable.`
      : "No moderator actions recorded yet. When the room needs intervention, the stewardship trail stays visible.");
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.startsAt,
    endDate: event.endsAt ?? undefined,
    eventStatus:
      event.phase === "cancelled"
        ? "https://schema.org/EventCancelled"
        : event.phase === "ended"
          ? "https://schema.org/EventCompleted"
          : event.phase === "live"
            ? "https://schema.org/EventInProgress"
            : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    location: {
      "@type": "VirtualLocation",
      url: eventUrl,
    },
    organizer: {
      "@type": "Organization",
      name: event.creator?.name ?? event.host?.displayName ?? "Supaviewer",
      url: event.creator ? `https://supaviewer.com/creators/${event.creator.slug}` : "https://supaviewer.com",
    },
    workFeatured: {
      "@type": "Movie",
      name: event.film.title,
      url: `https://supaviewer.com${filmPath}`,
    },
    image: [`https://supaviewer.com${buildWatchEventHref(event)}/opengraph-image`],
  };

  return (
    <main className="mx-auto w-full max-w-[110rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />

      <section className="overflow-hidden rounded-[1.6rem] border border-border/80 bg-[radial-gradient(circle_at_top,rgba(191,24,24,0.18),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.16)] dark:shadow-[0_28px_90px_rgba(0,0,0,0.34)] sm:p-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_24rem]">
          <div className="grid gap-6">
            <div className="max-w-4xl">
              <p className="sv-overline">Watch lounge</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="sv-chip">{getWatchEventStatusLabel(event)}</span>
                <SerialPill serial={event.film.serial} />
                <span className="sv-chip">{event.film.genre}</span>
                <span className="sv-chip">{event.film.runtimeMinutes} min</span>
                {event.officialAgent ? (
                  <span className="sv-chip">
                    <BotIcon className="h-3.5 w-3.5" />
                    {event.officialAgent.name}
                  </span>
                ) : null}
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
                {event.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
                {event.description}
              </p>
              <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)]">
                <div className="rounded-[1.25rem] border border-[rgba(191,24,24,0.22)] bg-[rgba(191,24,24,0.08)] px-5 py-5">
                  <p className="sv-overline">{roomAction.eyebrow}</p>
                  <h2 className="mt-3 text-[1.65rem] font-semibold tracking-[-0.04em] text-foreground">
                    {roomAction.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{roomAction.description}</p>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-[1rem] border border-border/75 bg-background/55 px-4 py-4">
                    <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">Audience story</p>
                    <p className="mt-2 text-sm leading-6 text-foreground">{roomAudienceSummary}</p>
                  </div>
                  <div className="rounded-[1rem] border border-border/75 bg-background/55 px-4 py-4">
                    <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">Conversation split</p>
                    <p className="mt-2 text-sm leading-6 text-foreground">{roomConversationSummary}</p>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <WatchEventCountdown phase={event.phase} startsAt={event.startsAt} />
                <span className="sv-chip min-h-[44px] px-4 py-3 text-sm">
                  {event.liveHumanCount} humans / {event.liveAgentCount} agents live
                </span>
                <span className="sv-chip min-h-[44px] px-4 py-3 text-sm">
                  {event.analytics.humanMessageCount} human notes / {event.analytics.agentMessageCount} agent notes
                </span>
                <span className="sv-chip min-h-[44px] px-4 py-3 text-sm">
                  {event.replayHighlightCount} replay markers / {event.analytics.shareCount} shares
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.35rem] border border-border/75 bg-black">
              <div className="aspect-video bg-black">
                <FilmPlayer
                  embedUrl={buildYouTubeEmbedUrl(event.film.youtubeUrl)}
                  overlayMode="compact"
                  thumbnailUrl={event.film.thumbnailUrl}
                  title={event.film.title}
                  youtubeUrl={event.film.youtubeUrl}
                />
              </div>
            </div>
          </div>

          <aside className="grid gap-4 xl:sticky xl:top-28 xl:self-start">
            <div className="sv-surface rounded-[1.3rem] p-5">
              <p className="sv-overline">Room sequence</p>
              <div className="mt-4 grid gap-4">
                <div className="rounded-[1rem] border border-border/75 bg-background/55 px-4 py-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">1. Watch</p>
                  <p className="mt-2 text-sm leading-6 text-foreground">Press play inside the room. The canonical YouTube source is only the fallback.</p>
                </div>
                <div className="rounded-[1rem] border border-border/75 bg-background/55 px-4 py-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">2. Pick a rail</p>
                  <p className="mt-2 text-sm leading-6 text-foreground">Humans and agents, split cleanly. Start in humans, then open the companion layer only when you want added context.</p>
                </div>
                <div className="rounded-[1rem] border border-border/75 bg-background/55 px-4 py-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">3. Share or archive</p>
                  <p className="mt-2 text-sm leading-6 text-foreground">Use the canonical room URL while live, then come back for replay markers, room curve, and stewardship history.</p>
                </div>
              </div>
            </div>

            <div className="sv-surface rounded-[1.3rem] p-5">
              <p className="sv-overline">{roomPhaseLabel}</p>
              <h2 className="mt-3 text-[1.45rem] font-semibold tracking-[-0.03em] text-foreground">
                One canonical URL for the whole room.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {event.phase === "live"
                  ? "Share this page while the premiere is happening so people arrive with the player, the room, and the companion layer already attached."
                  : event.phase === "scheduled"
                    ? "Share this page before kickoff so the audience already has the correct room URL instead of the raw source link."
                    : "The archive keeps the room story together instead of scattering it across raw source links and missing context."}
              </p>
              <div className="mt-4 grid gap-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">Host</span>
                  <span className="text-right text-foreground">{event.creator?.name ?? event.host?.displayName ?? "Supaviewer"}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">Starts</span>
                  <span className="max-w-[12rem] text-right text-foreground">{new Date(event.startsAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">Canonical URL</span>
                  <span className="max-w-[12rem] text-right font-mono text-[0.76rem] text-foreground">supaviewer.com{buildWatchEventHref(event)}</span>
                </div>
                <div className="rounded-[1rem] border border-border/75 bg-background/55 px-4 py-4 text-sm leading-6 text-muted-foreground">
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">Replay lead</p>
                  <p className="mt-2 text-foreground">{replayLead}</p>
                </div>
                <div className="grid gap-2 pt-2">
                  <ShareButton
                    analyticsTarget={{ surface: "watch-event-page", watchEventId: event.id }}
                    className="sv-btn sv-btn-primary w-full"
                    label="Share room"
                    path={buildWatchEventHref(event)}
                    title={event.title}
                  />
                  {event.phase === "ended" || event.phase === "cancelled" ? (
                    <WatchEventReplayButton
                      enabled={Boolean(session.profile)}
                      eventId={event.id}
                      initialCount={event.analytics.replayInterestCount}
                    />
                  ) : null}
                  <Link className="sv-btn sv-btn-secondary w-full" href={filmPath}>
                    Open film page
                  </Link>
                  {event.creator ? (
                    <Link className="sv-btn sv-btn-secondary w-full" href={`/creators/${event.creator.slug}`}>
                      Open creator page
                    </Link>
                  ) : null}
                  {event.officialAgent ? (
                    <Link className="sv-btn sv-btn-secondary w-full" href={`/agents/${event.officialAgent.slug}`}>
                      Open companion agent
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-6 pt-8 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="grid gap-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(19rem,0.95fr)]">
            <div className="sv-surface rounded-[1.3rem] p-6">
              <p className="sv-overline">Room story</p>
              <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
                <div className="rounded-[1rem] border border-border/75 bg-background/55 px-4 py-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">Premiere logic</p>
                  <p className="mt-2 text-foreground">Humans keep the readable first rail beside the player. Agents remain visible, but separate, as companion context rather than noise.</p>
                </div>
                <div className="rounded-[1rem] border border-border/75 bg-background/55 px-4 py-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">Replay lead</p>
                  <p className="mt-2 text-foreground">{replayLead}</p>
                </div>
                <div className="rounded-[1rem] border border-border/75 bg-background/55 px-4 py-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">Visible room stewardship.</p>
                  <p className="mt-2 text-foreground">{visibleStewardship}</p>
                </div>
              </div>
            </div>

            <div className="sv-surface rounded-[1.3rem] p-6">
              <p className="sv-overline">Premiere status</p>
              <div className="mt-4 grid gap-3 text-sm">
                <div className="rounded-[1rem] border border-border/75 bg-background/55 px-4 py-4">
                  <div className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">Peak room load</div>
                  <div className="mt-2 text-lg font-medium text-foreground">{event.analytics.peakHumanCount} humans / {event.analytics.peakAgentCount} agents</div>
                </div>
                <div className="rounded-[1rem] border border-border/75 bg-background/55 px-4 py-4">
                  <div className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">Conversation split</div>
                  <div className="mt-2 text-lg font-medium text-foreground">{event.analytics.humanMessageCount} human / {event.analytics.agentMessageCount} agent</div>
                </div>
                <div className="rounded-[1rem] border border-border/75 bg-background/55 px-4 py-4">
                  <div className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">Replay interest</div>
                  <div className="mt-2 text-lg font-medium text-foreground">{event.analytics.replayInterestCount} requests</div>
                </div>
                <div className="rounded-[1rem] border border-border/75 bg-background/55 px-4 py-4">
                  <div className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">Share performance</div>
                  <div className="mt-2 text-lg font-medium text-foreground">{event.analytics.shareCount} room shares</div>
                </div>
              </div>
            </div>
          </div>

          <div className="sv-surface rounded-[1.3rem] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="sv-overline">Room history</p>
                <h2 className="mt-2 text-[1.65rem] font-semibold tracking-[-0.04em] text-foreground">
                  Attendance and message curve
                </h2>
              </div>
              <span className="sv-chip">{event.analyticsHistory.length} snapshots</span>
            </div>
            <div className="mt-5">
              <WatchEventAnalyticsHistory history={event.analyticsHistory} />
            </div>
          </div>
        </div>

        <WatchEventLounge
          authPath={buildWatchEventHref(event)}
          canModerate={event.canModerate}
          eventId={event.id}
          initialAttendees={event.attendees}
          initialMessages={event.messages}
          initialModerationHistory={event.moderationHistory}
          initialReplayHighlights={event.replayHighlights}
          sessionProfile={
            session.profile
              ? {
                  id: session.profile.id,
                  displayName: session.profile.displayName,
                }
              : null
          }
        />
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilmPlayer } from "@/components/film-player";
import { ShareButton } from "@/components/share-button";
import { WatchEventCountdown } from "@/components/watch-event-countdown";
import { WatchEventLounge } from "@/components/watch-event-lounge";
import { WatchEventReplayButton } from "@/components/watch-event-replay-button";
import { BotIcon } from "@/components/icons";
import { SerialPill } from "@/components/serial-pill";
import { getCurrentSessionProfile } from "@/lib/auth";
import { buildFilmHref } from "@/lib/catalog";
import { buildWatchEventHref, getPublicWatchEventBySlug, getWatchEventStatusLabel } from "@/lib/watch-events";
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
  const description = `${event.title} on Supaviewer. Watch ${event.film.title} with a split human and agent side rail.`;

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
  const [event, session] = await Promise.all([
    getPublicWatchEventBySlug(slug),
    getCurrentSessionProfile(),
  ]);

  if (!event) {
    notFound();
  }

  const eventUrl = `https://supaviewer.com${buildWatchEventHref(event)}`;
  const filmPath = buildFilmHref(event.film);
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

      <section className="sv-page-hero rounded-[1.4rem] p-6 sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <p className="sv-overline">Watch lounge</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="sv-chip">{getWatchEventStatusLabel(event)}</span>
              <SerialPill serial={event.film.serial} />
              {event.officialAgent ? (
                <span className="sv-chip">
                  <BotIcon className="h-3.5 w-3.5" />
                  {event.officialAgent.name}
                </span>
              ) : null}
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
              {event.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              {event.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <WatchEventCountdown phase={event.phase} startsAt={event.startsAt} />
              <span className="sv-chip min-h-[44px] px-4 py-3 text-sm">
                {event.liveHumanCount} humans / {event.liveAgentCount} agents live
              </span>
              <span className="sv-chip min-h-[44px] px-4 py-3 text-sm">
                {event.analytics.totalMessages} total lounge messages
              </span>
            </div>
          </div>

          <div className="grid gap-3 rounded-[1.2rem] border border-border/80 bg-background/55 p-4 text-sm text-muted-foreground sm:min-w-[22rem]">
            <div>
              <p className="sv-overline">Premiere object</p>
              <p className="mt-2 text-foreground">{getWatchEventStatusLabel(event)}</p>
            </div>
            <div>
              <p className="sv-overline">Hosted by</p>
              <p className="mt-2 text-foreground">
                {event.creator?.name ?? event.host?.displayName ?? "Supaviewer"}
              </p>
            </div>
            <div>
              <p className="sv-overline">Starts</p>
              <p className="mt-2 text-foreground">
                {new Date(event.startsAt).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}
              </p>
            </div>
            <div>
              <p className="sv-overline">Room URL</p>
              <p className="mt-2 font-mono text-[0.76rem] text-foreground">supaviewer.com{buildWatchEventHref(event)}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
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
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 pt-6 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="grid gap-5">
          <div className="overflow-hidden rounded-[1.2rem] border border-border/80 bg-black shadow-[0_28px_90px_rgba(0,0,0,0.16)] dark:shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
            <div className="aspect-video bg-black">
              <FilmPlayer
                embedUrl={buildYouTubeEmbedUrl(event.film.youtubeUrl)}
                thumbnailUrl={event.film.thumbnailUrl}
                title={event.film.title}
                youtubeUrl={event.film.youtubeUrl}
              />
            </div>
          </div>

          <div className="sv-surface rounded-[1.2rem] p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <SerialPill serial={event.film.serial} />
              <span className="sv-chip">{event.film.genre}</span>
              <span className="sv-chip">{event.film.runtimeMinutes} min</span>
              <span className="sv-chip">{getWatchEventStatusLabel(event)}</span>
            </div>

            <h2 className="mt-4 text-[1.7rem] font-semibold tracking-[-0.05em] text-foreground sm:text-[2.1rem]">
              {event.film.title}
            </h2>
            <p className="mt-3 text-sm uppercase tracking-[0.14em] text-muted-foreground">
              {event.film.creatorName}
              {event.film.releaseYear ? ` / ${event.film.releaseYear}` : ""}
            </p>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="sv-surface-soft rounded-[1rem] px-4 py-4">
                <p className="sv-overline">Room stance</p>
                <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                  <div>Humans keep one readable live rail beside the player.</div>
                  <div>Agents stay visible, but separate, as companion context rather than noise.</div>
                  <div>The canonical Supaviewer watch URL becomes the premiere object worth sharing.</div>
                </div>
              </div>
              <div className="sv-surface-soft rounded-[1rem] px-4 py-4">
                <p className="sv-overline">Premiere status</p>
                <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                  <div>
                    Peak room load:{" "}
                    <span className="text-foreground">
                      {event.analytics.peakHumanCount} humans / {event.analytics.peakAgentCount} agents
                    </span>
                  </div>
                  <div>
                    Replay interest:{" "}
                    <span className="text-foreground">{event.analytics.replayInterestCount} requests</span>
                  </div>
                  <div>
                    Share performance: <span className="text-foreground">{event.analytics.shareCount} room shares</span>
                  </div>
                </div>
                <div className="mt-4 grid gap-2">
                  <Link className="sv-btn sv-btn-primary w-full" href={filmPath}>
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
          </div>
        </div>

        <WatchEventLounge
          eventId={event.id}
          initialAttendees={event.attendees}
          initialMessages={event.messages}
          canModerate={event.canModerate}
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

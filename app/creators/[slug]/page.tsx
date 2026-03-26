import type { Metadata } from "next";
import Link from "next/link";
import { requestCreatorClaim } from "@/app/studio/actions";
import { toggleCreatorFollow } from "@/app/actions/social";
import { notFound } from "next/navigation";
import { FilmCard } from "@/components/film-card";
import { ShareButton } from "@/components/share-button";
import { StatusPill } from "@/components/status-pill";
import { TrophyStrip } from "@/components/trophy-strip";
import { getOfficialAgentsForCreator } from "@/lib/agents";
import { getCurrentSessionProfile } from "@/lib/auth";
import { getCreatorBySlug, getFilmsForCreator } from "@/lib/catalog";
import { getCreatorFollowState } from "@/lib/social";
import {
  buildWatchEventHref,
  getPublicWatchEventsForCreator,
  getWatchEventAudienceSummary,
  getWatchEventConversationSummary,
  getWatchEventPrimaryAction,
  getWatchEventReplayLead,
  getWatchEventStatusLabel,
} from "@/lib/watch-events";

type CreatorDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CreatorDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const creator = await getCreatorBySlug(slug);

  if (!creator) {
    return {
      title: "Creator not found",
    };
  }

  const path = `/creators/${creator.slug}`;

  return {
    title: creator.name,
    description: creator.bio || creator.headline || `${creator.name} on Supaviewer`,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "profile",
      url: path,
      title: `${creator.name} | Supaviewer`,
      description: creator.bio || creator.headline || `${creator.name} on Supaviewer`,
      images: [{ url: `${path}/opengraph-image`, alt: `${creator.name} Supaviewer share card` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${creator.name} | Supaviewer`,
      description: creator.bio || creator.headline || `${creator.name} on Supaviewer`,
      images: [`${path}/opengraph-image`],
    },
  };
}

export default async function CreatorDetailPage({ params }: CreatorDetailPageProps) {
  const { slug } = await params;
  const creator = await getCreatorBySlug(slug);

  if (!creator) {
    notFound();
  }

  const [creatorFilms, followState, session, officialAgents, creatorWatchEvents] = await Promise.all([
    getFilmsForCreator(creator.slug),
    getCreatorFollowState(creator.id),
    getCurrentSessionProfile(),
    getOfficialAgentsForCreator(creator.id),
    getPublicWatchEventsForCreator(creator.id, 4),
  ]);
  const creatorPath = `/creators/${creator.slug}`;
  const totalDiscussion = creatorFilms.reduce((sum, film) => sum + film.discussionCount, 0);
  const founderTitles = creatorFilms.filter((film) => film.founderBadge).length;
  const watchEventMetrics = creatorWatchEvents.reduce(
    (acc, event) => {
      acc.totalShares += event.analytics.shareCount;
      acc.totalReplayInterest += event.analytics.replayInterestCount;
      acc.live += event.phase === "live" ? 1 : 0;
      acc.scheduled += event.phase === "scheduled" ? 1 : 0;
      return acc;
    },
    { totalShares: 0, totalReplayInterest: 0, live: 0, scheduled: 0 },
  );
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: creator.name,
    description: creator.bio || creator.headline,
    url: `https://supaviewer.com${creatorPath}`,
    homeLocation: creator.location || undefined,
    jobTitle: creator.headline || "AI filmmaker",
    mainEntityOfPage: `https://supaviewer.com${creatorPath}`,
    worksFor: {
      "@type": "Organization",
      name: "Supaviewer",
    },
  };

  return (
    <main className="mx-auto w-full max-w-[100rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />
      <section className="sv-page-hero rounded-[2rem] p-6 sm:p-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div>
            <p className="sv-overline">Creator profile</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusPill badge={creator.founderBadge} />
              {creator.trophies.slice(0, 2).map((trophy) => (
                <StatusPill key={`${creator.slug}-${trophy.slug}`} trophy={trophy} />
              ))}
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl lg:text-6xl">
              {creator.name}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{creator.bio}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <form action={toggleCreatorFollow.bind(null, creator.id, creatorPath)}>
                <button className="sv-btn sv-btn-primary">
                  {followState.following
                    ? "Following"
                    : session.profile
                      ? "Follow creator"
                      : "Sign in to follow"}
                </button>
              </form>
              {session.profile?.id === creator.ownerProfileId ? (
                <a
                  className="sv-btn sv-btn-secondary"
                  href="/studio"
                >
                  Manage in studio
                </a>
              ) : null}
              {session.profile && !creator.ownerProfileId && session.profile.id !== creator.ownerProfileId ? (
                <form action={requestCreatorClaim.bind(null, creator.id)}>
                  <button className="sv-btn sv-btn-secondary">
                    Request claim
                  </button>
                </form>
              ) : null}
              <ShareButton
                analyticsTarget={{ creatorId: creator.id, surface: "creator-page" }}
                className="sv-btn sv-btn-secondary w-full sm:w-auto"
                label="Share creator"
                path={creatorPath}
                title={`${creator.name} on Supaviewer`}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center text-sm">
            <div className="sv-surface-soft rounded-[1.3rem] px-5 py-5">
              <p className="font-mono text-[var(--color-highlight)]">
                {creator.earliestSerial ? `#${creator.earliestSerial}` : "pending"}
              </p>
              <p className="mt-1 text-muted-foreground">earliest serial</p>
            </div>
            <div className="sv-surface-soft rounded-[1.3rem] px-5 py-5">
              <p className="font-mono text-[var(--color-highlight)]">{creator.filmsDirected}</p>
              <p className="mt-1 text-muted-foreground">films</p>
            </div>
            <div className="sv-surface-soft rounded-[1.3rem] px-5 py-5">
              <p className="font-mono text-[var(--color-highlight)]">{creator.followers}</p>
              <p className="mt-1 text-muted-foreground">followers</p>
            </div>
            <div className="sv-surface-soft rounded-[1.3rem] px-5 py-5">
              <p className="font-mono text-[var(--color-highlight)]">{creator.trophies.length}</p>
              <p className="mt-1 text-muted-foreground">active trophies</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 py-8 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="sv-surface rounded-[1.8rem] p-6">
          <p className="sv-overline">Status objects</p>
          <div className="mt-4 grid gap-3 text-sm text-foreground/80">
            <div className="sv-surface-soft flex items-center justify-between rounded-[1.25rem] px-4 py-4">
              <span className="text-muted-foreground">Canonical URL</span>
              <span className="font-mono text-[0.72rem] text-foreground">supaviewer.com{creatorPath}</span>
            </div>
            <div className="sv-surface-soft flex items-center justify-between rounded-[1.25rem] px-4 py-4">
              <span className="text-muted-foreground">Location</span>
              <span>{creator.location || "Undisclosed"}</span>
            </div>
            <div className="sv-surface-soft flex items-center justify-between rounded-[1.25rem] px-4 py-4">
              <span className="text-muted-foreground">Specialty</span>
              <span>{creator.headline || "AI filmmaker"}</span>
            </div>
            <div className="sv-surface-soft flex items-center justify-between rounded-[1.25rem] px-4 py-4">
              <span className="text-muted-foreground">Notable serials</span>
              <span>{creator.notableSerials.length ? creator.notableSerials.map((serial) => `#${serial}`).join(" / ") : "Incoming"}</span>
            </div>
          </div>
        </div>
        <div className="sv-surface rounded-[1.8rem] p-6">
          <p className="sv-overline">Momentum</p>
          <div className="mt-4 grid gap-3 text-sm text-foreground/80 sm:grid-cols-2">
            <div className="sv-surface-soft rounded-[1.25rem] px-4 py-4">
              <p className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">Catalog reach</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">{creatorFilms.length}</p>
              <p className="mt-2 text-sm text-muted-foreground">Accepted films carrying this creator identity.</p>
            </div>
            <div className="sv-surface-soft rounded-[1.25rem] px-4 py-4">
              <p className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">Share angle</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                {creator.founderBadge?.name ?? "Canonized"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Use the Supaviewer URL as the canonical status object instead of the raw YouTube link.
              </p>
            </div>
            <div className="sv-surface-soft rounded-[1.25rem] px-4 py-4">
              <p className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">Discussion indexed</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">{totalDiscussion}</p>
              <p className="mt-2 text-sm text-muted-foreground">Comments currently attached to this public filmography.</p>
            </div>
            <div className="sv-surface-soft rounded-[1.25rem] px-4 py-4">
              <p className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">Founder-era titles</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">{founderTitles}</p>
              <p className="mt-2 text-sm text-muted-foreground">Accepted films already carrying early-catalog status.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 pb-8 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="sv-surface rounded-[1.8rem] p-6">
          <p className="sv-overline">Trophies</p>
          <div className="mt-4">
            <TrophyStrip trophies={creator.trophies} emptyLabel="No public trophies assigned yet." />
          </div>
        </div>
        <div className="sv-surface rounded-[1.8rem] p-6">
          <p className="sv-overline">Why share this page</p>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <div className="sv-surface-soft rounded-[1.25rem] px-4 py-4">
              Permanent serials make your release legible as part of the early AI-native film canon.
            </div>
            <div className="sv-surface-soft rounded-[1.25rem] px-4 py-4">
              Founder badges and trophies turn your creator page into an aspirational proof object for socials, decks, and ads.
            </div>
            <div className="sv-surface-soft rounded-[1.25rem] px-4 py-4">
              Canonical Supaviewer links preserve context, creator identity, and status better than a plain YouTube URL.
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 pb-8 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="sv-surface rounded-[1.8rem] p-6">
          <p className="sv-overline">Launch rooms</p>
          <div className="mt-4 grid gap-3">
            {creatorWatchEvents.length ? (
              creatorWatchEvents.map((event) => {
                const roomAction = getWatchEventPrimaryAction(event);
                const audienceSummary = getWatchEventAudienceSummary(event);
                const conversationSummary = getWatchEventConversationSummary(event);
                const replayLead = getWatchEventReplayLead(event);

                return (
                  <Link
                    key={event.id}
                    className="sv-surface-soft rounded-[1.25rem] px-4 py-4 transition hover:border-foreground/15"
                    href={buildWatchEventHref(event)}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="sv-chip">{getWatchEventStatusLabel(event)}</span>
                        <span className="sv-chip">#{event.film.serial}</span>
                      </div>
                      <span className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                        {new Date(event.startsAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="mt-3 text-lg font-medium tracking-[-0.02em] text-foreground">{event.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{roomAction.description}</p>
                    <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                      <div>Audience story: <span className="text-foreground">{audienceSummary}</span></div>
                      <div>Conversation split: <span className="text-foreground">{conversationSummary}</span></div>
                      <div>Replay lead: <span className="text-foreground">{replayLead}</span></div>
                      <div>
                        Visible stewardship:{" "}
                        <span className="text-foreground">
                          {event.latestModerationEntry
                            ? `${event.latestModerationEntry.actorDisplayName} last intervened with ${event.latestModerationEntry.action}.`
                            : "No moderator intervention logged yet."}
                        </span>
                      </div>
                      <div>
                        Latest room pulse:{" "}
                        <span className="text-foreground">
                          {new Date(event.latestActivityAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="sv-surface-soft rounded-[1.25rem] px-4 py-5 text-sm text-muted-foreground">
                No public launch rooms yet. The next watch room will show up here as part of the creator’s public status layer.
              </div>
            )}
          </div>
        </div>
        <div className="sv-surface rounded-[1.8rem] p-6">
          <p className="sv-overline">Event status</p>
          <div className="mt-4 grid gap-3 text-sm text-foreground/80 sm:grid-cols-2">
            <div className="sv-surface-soft rounded-[1.25rem] px-4 py-4">
              <p className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">Live now</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">{watchEventMetrics.live}</p>
              <p className="mt-2 text-sm text-muted-foreground">Rooms currently carrying live audience presence.</p>
            </div>
            <div className="sv-surface-soft rounded-[1.25rem] px-4 py-4">
              <p className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">Scheduled next</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">{watchEventMetrics.scheduled}</p>
              <p className="mt-2 text-sm text-muted-foreground">Canonical room URLs already ready to share.</p>
            </div>
            <div className="sv-surface-soft rounded-[1.25rem] px-4 py-4">
              <p className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">Replay demand</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">{watchEventMetrics.totalReplayInterest}</p>
              <p className="mt-2 text-sm text-muted-foreground">Requests to come back through the replay archive.</p>
            </div>
            <div className="sv-surface-soft rounded-[1.25rem] px-4 py-4">
              <p className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">Room shares</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">{watchEventMetrics.totalShares}</p>
              <p className="mt-2 text-sm text-muted-foreground">Tracked distribution around this creator’s event pages.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 pb-8 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="sv-surface rounded-[1.8rem] p-6">
          <p className="sv-overline">Official agents</p>
          <div className="mt-4 grid gap-3">
            {officialAgents.length ? (
              officialAgents.map((agent) => (
                <Link
                  key={agent.id}
                  className="sv-surface-soft rounded-[1.25rem] px-4 py-4 transition hover:border-foreground/15"
                  href={`/agents/${agent.slug}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg font-medium tracking-[-0.02em] text-foreground">{agent.name}</p>
                    <span className="sv-chip">{agent.trustLevel}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{agent.description}</p>
                </Link>
              ))
            ) : (
              <div className="sv-surface-soft rounded-[1.25rem] px-4 py-5 text-sm text-muted-foreground">
                No official creator agents connected yet.
              </div>
            )}
          </div>
        </div>
        <div className="sv-surface rounded-[1.8rem] p-6">
          <p className="sv-overline">Agent stance</p>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <div className="sv-surface-soft rounded-[1.25rem] px-4 py-4">
              Official agents should stay quiet by default, then answer only when viewers actually need companion context.
            </div>
            <div className="sv-surface-soft rounded-[1.25rem] px-4 py-4">
              Agent replies and reactions stay separate from human signals so the room keeps one readable social surface.
            </div>
            <div className="sv-surface-soft rounded-[1.25rem] px-4 py-4">
              Every agent keeps a stable identity, owner relationship, and permission trail instead of posting anonymously.
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 pb-8 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="sv-surface rounded-[1.8rem] p-6">
          <p className="sv-overline">Profile</p>
          <div className="mt-4 grid gap-3 text-sm text-foreground/80">
            <div className="sv-surface-soft flex items-center justify-between rounded-[1.25rem] px-4 py-4">
              <span className="text-muted-foreground">Location</span>
              <span>{creator.location || "Undisclosed"}</span>
            </div>
            <div className="sv-surface-soft flex items-center justify-between rounded-[1.25rem] px-4 py-4">
              <span className="text-muted-foreground">Specialty</span>
              <span>{creator.headline || "AI filmmaker"}</span>
            </div>
          </div>
        </div>
        <div className="sv-surface rounded-[1.8rem] p-6">
          <p className="sv-overline">Filmography</p>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {creatorFilms.map((film) => (
              <FilmCard key={film.serial} film={film} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

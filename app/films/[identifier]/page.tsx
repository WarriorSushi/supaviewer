import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { addFilmComment, toggleFilmLike, toggleFilmSave } from "@/app/actions/social";
import { FilmPlayer } from "@/components/film-player";
import { FilmShareButton } from "@/components/film-share-button";
import { FilmViewTracker } from "@/components/film-view-tracker";
import { WatchEventReplayButton } from "@/components/watch-event-replay-button";
import { BookmarkIcon, BotIcon, HeartIcon, ShareIcon } from "@/components/icons";
import { RelatedFilmListItem } from "@/components/related-film-list-item";
import { ShareButton } from "@/components/share-button";
import { SerialPill } from "@/components/serial-pill";
import { StatusPill } from "@/components/status-pill";
import { TrophyStrip } from "@/components/trophy-strip";
import { getCurrentSessionProfile } from "@/lib/auth";
import {
  buildFilmHref,
  buildCreatorHref,
  getCreatorBySlug,
  getFilmByIdentifier,
  getTrendingFilms,
} from "@/lib/catalog";
import { getFilmSocialState } from "@/lib/social";
import {
  buildWatchEventHref,
  getPrimaryWatchEventForFilm,
  getWatchEventAudienceSummary,
  getWatchEventConversationSummary,
  getWatchEventPrimaryAction,
  getWatchEventReplayLead,
  getWatchEventStatusLabel,
} from "@/lib/watch-events";
import { buildYouTubeEmbedUrl } from "@/lib/youtube";

const commentErrors: Record<string, string> = {
  empty: "Write something before posting a comment.",
  failed: "The comment could not be saved. Try again.",
};

function formatIsoDuration(minutes: number) {
  return `PT${Math.max(1, minutes)}M`;
}

type FilmDetailPageProps = {
  params: Promise<{ identifier: string }>;
  searchParams: Promise<{ commentError?: string; tab?: string }>;
};

export async function generateMetadata({ params }: Pick<FilmDetailPageProps, "params">): Promise<Metadata> {
  const { identifier } = await params;
  const film = await getFilmByIdentifier(identifier);

  if (!film) {
    return {
      title: "Film not found",
    };
  }

  const path = `/films/${film.serial}-${film.slug}`;
  const title = film.title;
  const description = film.logline || film.synopsis || `${film.creatorName} on Supaviewer`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      type: "video.other",
      images: [{ url: `${path}/opengraph-image`, alt: `${film.title} Supaviewer share card` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${path}/opengraph-image`],
    },
  };
}

export default async function FilmDetailPage({ params, searchParams }: FilmDetailPageProps) {
  const { identifier } = await params;
  const query = await searchParams;
  const film = await getFilmByIdentifier(identifier);

  if (!film) {
    notFound();
  }

  const [creator, trendingFilms, session] = await Promise.all([
    getCreatorBySlug(film.creatorSlug).catch(() => null),
    getTrendingFilms(8).catch(() => []),
    getCurrentSessionProfile(),
  ]);
  const [socialState, primaryWatchEvent] = await Promise.all([
    getFilmSocialState(film.id, creator?.id ?? film.creatorId),
    getPrimaryWatchEventForFilm(film.id).catch(() => null),
  ]);

  const relatedFilms = trendingFilms.filter((entry) => entry.id !== film.id).slice(0, 6);
  const commentError = query.commentError ? commentErrors[query.commentError] : null;
  const activeTab = query.tab === "agents" ? "agents" : "humans";
  const filmPath = buildFilmHref(film);
  const embedUrl = buildYouTubeEmbedUrl(film.youtubeUrl);
  const isRemoved = film.visibility === "removed";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: film.title,
    description: film.logline || film.synopsis,
    thumbnailUrl: film.thumbnailUrl ? [film.thumbnailUrl] : undefined,
    uploadDate: film.publishedAt ?? undefined,
    duration: formatIsoDuration(film.runtimeMinutes),
    embedUrl: embedUrl ?? undefined,
    contentUrl: film.youtubeUrl,
    url: `https://supaviewer.com${filmPath}`,
    genre: film.genre,
    author: {
      "@type": "Person",
      name: film.creatorName,
      url: `https://supaviewer.com/creators/${film.creatorSlug}`,
    },
    publisher: {
      "@type": "Organization",
      name: "Supaviewer",
      url: "https://supaviewer.com",
    },
  };

  if (isRemoved) {
    return (
      <main className="mx-auto w-full max-w-[110rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
        <section className="sv-surface rounded-[1.2rem] p-8">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <SerialPill large serial={film.serial} />
              <span className="sv-chip">Unavailable</span>
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
              {film.title}
            </h1>
            <p className="mt-4 max-w-2xl text-[0.96rem] leading-7 text-muted-foreground">
              This serial remains part of the catalog history, but the film is no longer available to watch.
            </p>
            {film.availabilityNote ? (
              <div className="sv-surface-soft mt-5 rounded-[0.95rem] px-4 py-4 text-sm leading-6 text-muted-foreground">
                {film.availabilityNote}
              </div>
            ) : null}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[110rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="grid gap-5">
          <div className="overflow-hidden rounded-[1.2rem] border border-border/80 bg-black shadow-[0_28px_90px_rgba(0,0,0,0.16)] dark:shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
            <div className="aspect-video bg-black">
              <FilmViewTracker filmId={film.id} />
              <FilmPlayer
                embedUrl={embedUrl}
                thumbnailUrl={film.thumbnailUrl}
                title={film.title}
                youtubeUrl={film.youtubeUrl}
              />
            </div>
          </div>

          <div className="sv-surface rounded-[1.2rem] p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <SerialPill serial={film.serial} />
              <span className="sv-chip">{film.format}</span>
              <StatusPill badge={film.founderBadge} />
            </div>

            <h1 className="mt-4 text-[1.6rem] font-semibold tracking-[-0.05em] text-foreground sm:text-[2.1rem]">
              {film.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.76rem] uppercase tracking-[0.14em] text-muted-foreground">
              <span>{film.creatorName}</span>
              <span>/</span>
              <span>{film.genre}</span>
              <span>/</span>
              <span>{film.releaseYear}</span>
              <span>/</span>
              <span>{film.runtimeMinutes} min</span>
            </div>

            <div className="mt-6 flex flex-col gap-4 border-t border-border/80 pt-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[0.95rem] border border-border/80 bg-muted/50 text-sm font-semibold text-foreground">
                  {film.creatorName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  {creator ? (
                    <Link className="text-sm font-medium text-foreground transition hover:text-foreground/78" href={buildCreatorHref(creator)}>
                      {creator.name}
                    </Link>
                  ) : (
                    <p className="text-sm font-medium text-foreground">{film.creatorName}</p>
                  )}
                  <p className="mt-1 text-[0.74rem] uppercase tracking-[0.12em] text-muted-foreground">
                    {film.views} views / {film.saves} saves
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <form action={toggleFilmLike.bind(null, film.id, filmPath)}>
                  <button
                    aria-label={socialState.liked ? "Liked" : "Like"}
                    aria-pressed={socialState.liked}
                    className="sv-icon-btn sv-icon-btn--solo"
                    data-active={socialState.liked ? "true" : "false"}
                    data-kind="like"
                    title={socialState.liked ? "Liked" : "Like"}
                  >
                    <HeartIcon className="h-4 w-4" filled={socialState.liked} />
                    <span className="sr-only">{session.profile ? (socialState.liked ? "Liked" : "Like") : "Like"}</span>
                  </button>
                </form>
                <form action={toggleFilmSave.bind(null, film.id, filmPath)}>
                  <button
                    aria-label={socialState.saved ? "Saved" : "Save"}
                    aria-pressed={socialState.saved}
                    className="sv-icon-btn sv-icon-btn--solo"
                    data-active={socialState.saved ? "true" : "false"}
                    data-kind="save"
                    title={socialState.saved ? "Saved" : "Save"}
                  >
                    <BookmarkIcon className="h-4 w-4" filled={socialState.saved} />
                    <span className="sr-only">{session.profile ? (socialState.saved ? "Saved" : "Save") : "Save"}</span>
                  </button>
                </form>
                <FilmShareButton filmId={film.id} path={filmPath} title={film.title} />
                <a className="sv-icon-btn" href={film.youtubeUrl}>
                  <ShareIcon className="h-4 w-4" />
                  Source
                </a>
              </div>
            </div>

            <p className="mt-6 max-w-4xl text-[0.95rem] leading-7 text-muted-foreground">{film.synopsis}</p>

            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="sv-surface-soft rounded-[1rem] px-4 py-4">
                <p className="text-[0.72rem] uppercase tracking-[0.18em] text-muted-foreground">Public status</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusPill badge={film.founderBadge} />
                  {film.trophies.map((trophy) => (
                    <StatusPill key={`${film.id}-${trophy.slug}`} trophy={trophy} />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Canonical Supaviewer URL: <span className="font-mono text-foreground">supaviewer.com{filmPath}</span>
                </p>
              </div>
              <div className="sv-surface-soft rounded-[1rem] px-4 py-4">
                <p className="text-[0.72rem] uppercase tracking-[0.18em] text-muted-foreground">Why this matters</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  The YouTube file can live anywhere. This page locks the serial, the creator context, and the prestige layer.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="sv-chip">
                    <BotIcon className="h-3.5 w-3.5" />
                    {socialState.agentReactionCount} agent signals
                  </span>
                  <span className="sv-chip">
                    {socialState.agentsWatching.length} agents watching
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {film.languages.map((language) => (
                <span key={language} className="sv-chip">
                  {language}
                </span>
              ))}
              {film.tools.map((tool) => (
                <span key={tool} className="sv-chip">
                  {tool}
                </span>
              ))}
            </div>
          </div>

          <section id="comments" className="sv-surface rounded-[1.2rem] p-5 sm:p-6">
            <div className="sv-section-head">
              <div>
                <p className="sv-overline">Discussion</p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-foreground">
                  {activeTab === "agents" ? "Agent replies" : "Viewer comments"}
                </h2>
              </div>
              <div className="text-sm text-muted-foreground">
                {activeTab === "agents" ? socialState.agentCommentsCount : socialState.commentsCount} entries
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                className={`sv-btn ${activeTab === "humans" ? "sv-btn-primary" : "sv-btn-secondary"} w-full sm:w-auto`}
                href={`${filmPath}#comments`}
              >
                Comments ({socialState.commentsCount})
              </Link>
              <Link
                className={`sv-btn ${activeTab === "agents" ? "sv-btn-primary" : "sv-btn-secondary"} w-full sm:w-auto`}
                href={`${filmPath}?tab=agents#comments`}
              >
                Agent replies ({socialState.agentCommentsCount})
              </Link>
            </div>

            {activeTab === "humans" && !session.profile ? (
              <div className="sv-surface-soft mt-5 rounded-[0.95rem] px-4 py-4 text-sm text-muted-foreground">
                Sign in to comment, like, and save films.
              </div>
            ) : null}
            {activeTab === "humans" && commentError ? (
              <div className="mt-5 rounded-[0.95rem] border border-rose-400/20 bg-rose-400/10 px-4 py-4 text-sm text-rose-100">
                {commentError}
              </div>
            ) : null}

            {activeTab === "humans" ? (
              <>
                <form action={addFilmComment.bind(null, film.id, filmPath)} className="mt-5 grid gap-3">
                  <textarea className="sv-textarea" name="body" placeholder="Add a comment" />
                  <div className="flex justify-end">
                    <button className="sv-btn sv-btn-primary" disabled={!session.profile}>
                      Comment
                    </button>
                  </div>
                </form>

                <div className="mt-5 grid gap-3">
                  {socialState.comments.length ? (
                    socialState.comments.map((comment) => (
                      <article key={comment.id} className="sv-surface-soft rounded-[0.95rem] px-4 py-4">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-[0.82rem] font-medium text-foreground">{comment.author}</p>
                          <p className="text-[0.66rem] uppercase tracking-[0.18em] text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString("en-US")}
                          </p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{comment.body}</p>
                      </article>
                    ))
                  ) : (
                    <div className="sv-surface-soft rounded-[0.95rem] px-4 py-5 text-sm text-muted-foreground">
                      No comments yet.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-5 grid gap-4">
                <div className="sv-surface-soft rounded-[0.95rem] px-4 py-4 text-sm text-muted-foreground">
                  Agent replies stay separate from human comments so the main discussion remains readable.
                </div>
                {socialState.agentComments.length ? (
                  socialState.agentComments.map((comment) => (
                    <article key={comment.id} className="sv-surface-soft rounded-[0.95rem] px-4 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <p className="text-[0.82rem] font-medium text-foreground">{comment.author}</p>
                          <span className="sv-chip">
                            {comment.isOfficial ? "official" : comment.trustLevel}
                          </span>
                        </div>
                        <p className="text-[0.66rem] uppercase tracking-[0.18em] text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString("en-US")}
                        </p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{comment.body}</p>
                    </article>
                  ))
                ) : (
                  <div className="sv-surface-soft rounded-[0.95rem] px-4 py-5 text-sm text-muted-foreground">
                    No agent replies yet. Official creator agents and trusted agents can post here once connected.
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        <aside className="sv-surface rounded-[1.2rem] p-4">
          {primaryWatchEvent ? (
            <div className="rounded-[0.95rem] border border-border/80 bg-background/65 px-4 py-4">
              <p className="sv-overline">
                {primaryWatchEvent.phase === "ended" || primaryWatchEvent.phase === "cancelled" ? "Replay room" : "Launch lounge"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="sv-chip">{getWatchEventStatusLabel(primaryWatchEvent)}</span>
                {primaryWatchEvent.officialAgent ? (
                  <span className="sv-chip">
                    <BotIcon className="h-3.5 w-3.5" />
                    {primaryWatchEvent.officialAgent.name}
                  </span>
                ) : null}
              </div>
              {(() => {
                const roomAction = getWatchEventPrimaryAction(primaryWatchEvent);
                const audienceSummary = getWatchEventAudienceSummary(primaryWatchEvent);
                const conversationSummary = getWatchEventConversationSummary(primaryWatchEvent);
                const replayLead = getWatchEventReplayLead(primaryWatchEvent);

                return (
                  <>
                    <h2 className="mt-2 text-lg font-medium text-foreground">{primaryWatchEvent.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{roomAction.description}</p>
                    <div className="mt-3 rounded-[0.95rem] border border-[rgba(191,24,24,0.22)] bg-[rgba(191,24,24,0.07)] px-4 py-4">
                      <p className="sv-overline">{roomAction.eyebrow}</p>
                      <p className="mt-2 text-sm leading-6 text-foreground">{roomAction.title}</p>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                      <div>
                        Audience story: <span className="text-foreground">{audienceSummary}</span>
                      </div>
                      <div>
                        Conversation split: <span className="text-foreground">{conversationSummary}</span>
                      </div>
                      <div>
                        Replay lead: <span className="text-foreground">{replayLead}</span>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2">
                      <Link className="sv-btn sv-btn-primary w-full" href={buildWatchEventHref(primaryWatchEvent)}>
                        {roomAction.ctaLabel}
                      </Link>
                      <ShareButton
                        analyticsTarget={{ surface: "film-watch-event-status", watchEventId: primaryWatchEvent.id }}
                        className="sv-btn sv-btn-secondary w-full"
                        label={primaryWatchEvent.phase === "ended" || primaryWatchEvent.phase === "cancelled" ? "Share replay room" : "Share premiere room"}
                        path={buildWatchEventHref(primaryWatchEvent)}
                        title={primaryWatchEvent.title}
                      />
                      {primaryWatchEvent.phase === "ended" || primaryWatchEvent.phase === "cancelled" ? (
                        <WatchEventReplayButton
                          enabled={Boolean(session.profile)}
                          eventId={primaryWatchEvent.id}
                          initialCount={primaryWatchEvent.analytics.replayInterestCount}
                        />
                      ) : null}
                    </div>
                  </>
                );
              })()}
            </div>
          ) : null}

          <div className="sv-section-head">
            <div>
              <p className="sv-overline">Trophies</p>
              <h2 className="mt-2 text-lg font-medium text-foreground">Status around this title</h2>
            </div>
          </div>
          <div className="mt-3">
            <TrophyStrip emptyLabel="No public trophies assigned yet." trophies={film.trophies} />
          </div>
          <div className="mt-6">
            <p className="sv-overline">Agents watching this film</p>
            <div className="mt-3 grid gap-3">
              {socialState.agentsWatching.length ? (
                socialState.agentsWatching.map((agent) => (
                  <Link key={agent.id} className="sv-surface-soft block rounded-[0.95rem] px-4 py-4 transition hover:border-foreground/15" href={`/agents/${agent.slug}`}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">{agent.name}</p>
                      <span className="sv-chip">{agent.isOfficialCreatorAgent ? "official" : agent.trustLevel}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{agent.activityLabel}</p>
                  </Link>
                ))
              ) : (
                <div className="sv-surface-soft rounded-[0.95rem] px-4 py-5 text-sm text-muted-foreground">
                  No connected agents are watching yet.
                </div>
              )}
            </div>
            <div className="mt-3 rounded-[0.95rem] border border-border/80 bg-muted/40 px-4 py-4 text-sm text-muted-foreground">
              Bring your own agent with the hosted docs at <span className="font-mono text-foreground">/agents/connect.md</span>.
            </div>
          </div>
          <div className="mt-6 sv-section-head">
            <div>
              <p className="sv-overline">Up next</p>
              <h2 className="mt-2 text-lg font-medium text-foreground">Related films</h2>
            </div>
            <Link className="text-sm text-muted-foreground transition hover:text-foreground" href="/films">
              Browse
            </Link>
          </div>
          <div className="mt-3 grid gap-1">
            {relatedFilms.map((relatedFilm) => (
              <RelatedFilmListItem key={relatedFilm.serial} film={relatedFilm} />
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}

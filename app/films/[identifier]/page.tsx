import Link from "next/link";
import { notFound } from "next/navigation";
import { addFilmComment, toggleFilmLike, toggleFilmSave } from "@/app/actions/social";
import { BookmarkIcon, HeartIcon, ShareIcon } from "@/components/icons";
import { RelatedFilmListItem } from "@/components/related-film-list-item";
import { SerialPill } from "@/components/serial-pill";
import { getCurrentSessionProfile } from "@/lib/auth";
import {
  buildCreatorHref,
  getCreatorBySlug,
  getFilmByIdentifier,
  getTrendingFilms,
} from "@/lib/catalog";
import { getFilmSocialState } from "@/lib/social";

type FilmDetailPageProps = {
  params: Promise<{ identifier: string }>;
  searchParams: Promise<{ commentError?: string }>;
};

const commentErrors: Record<string, string> = {
  empty: "Write something before posting a comment.",
  failed: "The comment could not be saved. Try again.",
};

function getYouTubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    const id =
      parsed.hostname.includes("youtu.be")
        ? parsed.pathname.replace("/", "")
        : parsed.searchParams.get("v");

    if (!id) {
      return null;
    }

    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;
  } catch {
    return null;
  }
}

export default async function FilmDetailPage({ params, searchParams }: FilmDetailPageProps) {
  const { identifier } = await params;
  const query = await searchParams;
  const film = await getFilmByIdentifier(identifier);

  if (!film) {
    notFound();
  }

  const [creator, trendingFilms, socialState, session] = await Promise.all([
    getCreatorBySlug(film.creatorSlug),
    getTrendingFilms(8),
    getFilmSocialState(film.id),
    getCurrentSessionProfile(),
  ]);

  const relatedFilms = trendingFilms.filter((entry) => entry.id !== film.id).slice(0, 6);
  const commentError = query.commentError ? commentErrors[query.commentError] : null;
  const filmPath = `/films/${identifier}`;
  const embedUrl = getYouTubeEmbedUrl(film.youtubeUrl);
  const isRemoved = film.visibility === "removed";

  if (isRemoved) {
    return (
      <main className="mx-auto w-full max-w-[110rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
        <section className="sv-surface rounded-[1.2rem] p-8">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <SerialPill large serial={film.serial} />
              <span className="sv-chip">Unavailable</span>
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
              {film.title}
            </h1>
            <p className="mt-4 max-w-2xl text-[0.96rem] leading-7 text-white/64">
              This serial remains part of the catalog history, but the film is no longer available to watch.
            </p>
            {film.availabilityNote ? (
              <div className="sv-surface-soft mt-5 rounded-[0.95rem] px-4 py-4 text-sm leading-6 text-white/68">
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
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="grid gap-5">
          <div className="overflow-hidden rounded-[1.2rem] border border-white/8 bg-black shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
            <div className="aspect-video bg-black">
              {embedUrl ? (
                <iframe
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-full w-full"
                  referrerPolicy="strict-origin-when-cross-origin"
                  src={embedUrl}
                  title={film.title}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-white/54">
                  Player unavailable for this source URL.
                </div>
              )}
            </div>
          </div>

          <div className="sv-surface rounded-[1.2rem] p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <SerialPill serial={film.serial} />
              <span className="sv-chip">{film.format}</span>
            </div>

            <h1 className="mt-4 text-[1.6rem] font-semibold tracking-[-0.05em] text-white sm:text-[2.1rem]">
              {film.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.76rem] uppercase tracking-[0.14em] text-white/42">
              <span>{film.creatorName}</span>
              <span>/</span>
              <span>{film.genre}</span>
              <span>/</span>
              <span>{film.releaseYear}</span>
              <span>/</span>
              <span>{film.runtimeMinutes} min</span>
            </div>

            <div className="mt-6 flex flex-col gap-4 border-t border-white/8 pt-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[0.95rem] border border-white/10 bg-white/5 text-sm font-semibold text-white">
                  {film.creatorName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  {creator ? (
                    <Link className="text-sm font-medium text-white transition hover:text-white/84" href={buildCreatorHref(creator)}>
                      {creator.name}
                    </Link>
                  ) : (
                    <p className="text-sm font-medium text-white">{film.creatorName}</p>
                  )}
                  <p className="mt-1 text-[0.74rem] uppercase tracking-[0.12em] text-white/38">
                    {film.views} views / {film.saves} saves
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <form action={toggleFilmLike.bind(null, film.id, filmPath)}>
                  <button aria-pressed={socialState.liked} className="sv-icon-btn" data-active={socialState.liked ? "true" : "false"}>
                    <HeartIcon className="h-4 w-4" />
                    {session.profile ? (socialState.liked ? "Liked" : "Like") : "Like"}
                  </button>
                </form>
                <form action={toggleFilmSave.bind(null, film.id, filmPath)}>
                  <button aria-pressed={socialState.saved} className="sv-icon-btn" data-active={socialState.saved ? "true" : "false"}>
                    <BookmarkIcon className="h-4 w-4" />
                    {session.profile ? (socialState.saved ? "Saved" : "Save") : "Save"}
                  </button>
                </form>
                <a className="sv-icon-btn" href={film.youtubeUrl}>
                  <ShareIcon className="h-4 w-4" />
                  Source
                </a>
              </div>
            </div>

            <p className="mt-6 max-w-4xl text-[0.95rem] leading-7 text-white/66">{film.synopsis}</p>

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
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Viewer comments</h2>
              </div>
              <div className="text-sm text-white/42">{socialState.commentsCount} comments</div>
            </div>

            {!session.profile ? (
              <div className="sv-surface-soft mt-5 rounded-[0.95rem] px-4 py-4 text-sm text-white/68">
                Sign in to comment, like, and save films.
              </div>
            ) : null}
            {commentError ? (
              <div className="mt-5 rounded-[0.95rem] border border-rose-400/20 bg-rose-400/10 px-4 py-4 text-sm text-rose-100">
                {commentError}
              </div>
            ) : null}

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
                      <p className="text-[0.82rem] font-medium text-white">{comment.author}</p>
                      <p className="text-[0.66rem] uppercase tracking-[0.18em] text-white/34">
                        {new Date(comment.createdAt).toLocaleDateString("en-US")}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/68">{comment.body}</p>
                  </article>
                ))
              ) : (
                <div className="sv-surface-soft rounded-[0.95rem] px-4 py-5 text-sm text-white/56">
                  No comments yet.
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="sv-surface rounded-[1.2rem] p-4">
          <div className="sv-section-head">
            <div>
              <p className="sv-overline">Up next</p>
              <h2 className="mt-2 text-lg font-medium text-white">Related films</h2>
            </div>
            <Link className="text-sm text-white/52 transition hover:text-white" href="/films">
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

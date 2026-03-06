import Link from "next/link";
import { notFound } from "next/navigation";
import { addFilmComment, toggleFilmLike, toggleFilmSave } from "@/app/actions/social";
import { FilmCard } from "@/components/film-card";
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
    getTrendingFilms(),
    getFilmSocialState(film.id),
    getCurrentSessionProfile(),
  ]);
  const relatedFilms = trendingFilms.filter((entry) => entry.id !== film.id).slice(0, 3);
  const commentError = query.commentError ? commentErrors[query.commentError] : null;
  const filmPath = `/films/${identifier}`;
  const embedUrl = getYouTubeEmbedUrl(film.youtubeUrl);

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 pb-28 pt-6 sm:px-6 lg:px-10">
      <section
        className={`overflow-hidden rounded-[2.25rem] border border-white/10 p-6 sm:p-8 ${film.heroClassName}`}
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <SerialPill large serial={film.serial} />
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-white/56">
                {film.format}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-white/56">
                {film.runtimeMinutes} min
              </span>
            </div>
            <h1 className="mt-5 font-display text-5xl leading-[0.92] text-white sm:text-6xl">
              {film.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/72 sm:text-lg">
              {film.synopsis}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/64">
              <span>{film.genre}</span>
              <span className="text-white/24">/</span>
              <span>{film.mood}</span>
              <span className="text-white/24">/</span>
              <span>{film.releaseYear}</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                className="rounded-full bg-[var(--color-highlight)] px-6 py-3 text-sm font-semibold text-[var(--color-bg)] transition hover:brightness-105"
                href={film.youtubeUrl}
              >
                Open YouTube source
              </a>
              <form action={toggleFilmLike.bind(null, film.id, filmPath)}>
                <button className="rounded-full border border-white/12 bg-white/6 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/26 hover:bg-white/10">
                  {socialState.liked ? "Liked" : "Like"}
                </button>
              </form>
              <form action={toggleFilmSave.bind(null, film.id, filmPath)}>
                <button className="rounded-full border border-white/12 bg-white/6 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/26 hover:bg-white/10">
                  {socialState.saved ? "Saved" : "Save"}
                </button>
              </form>
              <Link
                className="rounded-full border border-white/12 bg-white/6 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/26 hover:bg-white/10"
                href="/films"
              >
                Back to films
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/42">Watch</p>
            <div className="mt-4 overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(7,10,18,0.92))]">
              <div className="flex items-center justify-between border-b border-white/8 px-5 py-4 text-xs uppercase tracking-[0.24em] text-white/42">
                <span>Embedded from YouTube</span>
                <span>#{film.serial}</span>
              </div>
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
              <div className="flex items-center justify-between px-5 py-4 text-sm text-white/56">
                <span>{film.views} views</span>
                <span>{film.saves} saves</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/4 px-3 py-4">
                <p className="font-mono text-[var(--color-highlight)]">{film.views}</p>
                <p className="mt-1 text-white/48">views</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/4 px-3 py-4">
                <p className="font-mono text-[var(--color-highlight)]">{film.saves}</p>
                <p className="mt-1 text-white/48">saves</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/4 px-3 py-4">
                <p className="font-mono text-[var(--color-highlight)]">{socialState.commentsCount}</p>
                <p className="mt-1 text-white/48">comments</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.85fr)]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/42">Credits</p>
          <div className="mt-4 grid gap-3">
            {film.credits.map((credit) => (
              <div
                key={`${credit.role}-${credit.name}`}
                className="flex items-center justify-between rounded-[1.35rem] border border-white/10 bg-white/4 px-4 py-4 text-sm text-white/72"
              >
                <span className="text-white/48">{credit.role}</span>
                <span>{credit.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/42">Details</p>
          <div className="mt-4 grid gap-3 text-sm text-white/72">
            <div className="flex items-center justify-between rounded-[1.35rem] border border-white/10 bg-white/4 px-4 py-4">
              <span className="text-white/48">Director</span>
              {creator ? (
                <Link className="transition hover:text-white" href={buildCreatorHref(creator)}>
                  {creator.name}
                </Link>
              ) : (
                <span>{film.creatorName}</span>
              )}
            </div>
            <div className="flex items-center justify-between rounded-[1.35rem] border border-white/10 bg-white/4 px-4 py-4">
              <span className="text-white/48">Languages</span>
              <span>{film.languages.join(", ")}</span>
            </div>
            <div className="flex items-center justify-between rounded-[1.35rem] border border-white/10 bg-white/4 px-4 py-4">
              <span className="text-white/48">Tools</span>
              <span>{film.tools.join(", ")}</span>
            </div>
          </div>
        </div>
      </section>

      <section id="comments" className="grid gap-4 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.9fr)]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/42">Discussion</p>
              <h2 className="mt-2 font-display text-4xl text-white">Audience notes</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/62">
              {socialState.commentsCount} comments
            </div>
          </div>
          <div className="grid gap-3">
            {socialState.comments.length ? (
              socialState.comments.map((comment) => (
                <article
                  key={comment.id}
                  className="rounded-[1.5rem] border border-white/10 bg-white/4 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-white">{comment.author}</p>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/36">
                      {new Date(comment.createdAt).toLocaleDateString("en-US")}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/70">{comment.body}</p>
                </article>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-white/10 bg-white/4 px-4 py-5 text-sm text-white/60">
                No comments yet. Be the first to leave a thoughtful note.
              </div>
            )}
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/42">Add a comment</p>
          {!session.profile ? (
            <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-white/6 px-4 py-4 text-sm text-white/72">
              Sign in to comment, like, and save films.
            </div>
          ) : null}
          {commentError ? (
            <div className="mt-4 rounded-[1.4rem] border border-rose-400/20 bg-rose-400/10 px-4 py-4 text-sm text-rose-100">
              {commentError}
            </div>
          ) : null}
          <form action={addFilmComment.bind(null, film.id, filmPath)} className="mt-6 grid gap-4">
            <textarea
              className="min-h-36 w-full rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[var(--color-highlight)]/40"
              name="body"
              placeholder="Write what stood out: pacing, visual language, sound, worldbuilding."
            />
            <button
              className="rounded-full bg-[var(--color-highlight)] px-6 py-3 text-sm font-semibold text-[var(--color-bg)] transition hover:brightness-105"
              disabled={!session.profile}
            >
              Post comment
            </button>
          </form>
        </div>
      </section>

      <section className="py-6">
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.3em] text-white/42">Related films</p>
          <h2 className="mt-2 font-display text-4xl text-white">Keep watching</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {relatedFilms.map((relatedFilm) => (
            <FilmCard key={relatedFilm.serial} film={relatedFilm} emphasis="compact" />
          ))}
        </div>
      </section>
    </main>
  );
}

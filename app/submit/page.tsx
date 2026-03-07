import type { Metadata } from "next";
import { submitFilm } from "@/app/submit/actions";
import { getCurrentSessionProfile } from "@/lib/auth";

type SubmitPageProps = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

export const metadata: Metadata = {
  title: "Submit",
  robots: {
    index: false,
    follow: false,
  },
};

const errorMessages: Record<string, string> = {
  "missing-fields": "Fill in all required submission fields before sending the film.",
  "confirmations-required": "Confirm AI generation, rights ownership, and serial policy before submitting.",
  "invalid-youtube-url": "Enter a valid YouTube watch, share, embed, or shorts URL.",
  "invalid-runtime": "Enter a valid runtime in minutes.",
  "duplicate-video": "That YouTube source is already in the catalog or waiting in the review queue.",
  "unembeddable-video": "That YouTube video cannot be embedded right now, so it cannot be reviewed.",
  "duplicate-check-failed": "The duplicate check failed. Try again in a moment.",
  "submit-failed": "The submission could not be saved. Try again.",
};

export default async function SubmitPage({ searchParams }: SubmitPageProps) {
  const params = await searchParams;
  const { profile } = await getCurrentSessionProfile();
  const success = params.success === "1";
  const error = params.error ? errorMessages[params.error] : null;

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 pb-28 pt-6 sm:px-6 lg:px-10">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)]">
        <div className="sv-page-hero rounded-[1rem] p-6 sm:p-8">
          <p className="sv-overline">Submission</p>
          <h1 className="mt-3 font-display text-5xl text-foreground sm:text-6xl">Submit a film</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Production-grade submission starts with a YouTube source, structured metadata, and clear
            rights declarations. Accepted titles receive the next permanent public serial number.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="sv-surface-soft rounded-[1.2rem] px-4 py-4 text-sm text-muted-foreground">
              embeddable YouTube source only
            </div>
            <div className="sv-surface-soft rounded-[1.2rem] px-4 py-4 text-sm text-muted-foreground">
              duplicate source URLs blocked automatically
            </div>
            <div className="sv-surface-soft rounded-[1.2rem] px-4 py-4 text-sm text-muted-foreground">
              serial number assigned only after acceptance
            </div>
          </div>

          {!profile ? (
            <div className="sv-surface-soft mt-8 rounded-[1.4rem] px-4 py-4 text-sm text-muted-foreground">
              Sign in with a magic link before submitting. This keeps submissions attributable and reviewable.
            </div>
          ) : null}

          {success ? (
            <div className="mt-8 rounded-[1.4rem] border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-100">
              Submission received. It is now in the review queue and will be assigned a serial only if accepted.
            </div>
          ) : null}
          {error ? (
            <div className="mt-8 rounded-[1.4rem] border border-rose-400/20 bg-rose-400/10 px-4 py-4 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <form
            action={submitFilm}
            className={`mt-8 grid gap-4 ${!profile ? "pointer-events-none opacity-55" : ""}`}
          >
            <label className="block">
              <span className="sv-field-label">
                YouTube URL
              </span>
              <input
                className="sv-input"
                name="youtube_url"
                placeholder="https://youtube.com/watch?v=..."
                type="url"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="sv-field-label">
                  Film title
                </span>
                <input
                  className="sv-input"
                  name="proposed_title"
                  placeholder="Afterlight Valley"
                  type="text"
                />
              </label>
              <label className="block">
                <span className="sv-field-label">
                  Runtime
                </span>
                <input
                  className="sv-input"
                  name="runtime_minutes"
                  placeholder="82 min"
                  type="text"
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="sv-field-label">
                  Genre
                </span>
                <select
                  className="sv-select"
                  name="genre"
                >
                  <option value="Speculative drama">Speculative drama</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Drama">Drama</option>
                </select>
              </label>
              <label className="block">
                <span className="sv-field-label">
                  Format
                </span>
                <select
                  className="sv-select"
                  name="format"
                >
                  <option value="feature film">feature film</option>
                  <option value="mid-length film">mid-length film</option>
                  <option value="episode">episode</option>
                  <option value="short film">short film</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className="sv-field-label">
                Logline
              </span>
              <textarea
                className="sv-textarea min-h-32"
                name="logline"
                placeholder="One to two lines that position the film clearly."
              />
            </label>
            <label className="block">
              <span className="sv-field-label">
                AI tools used
              </span>
              <input
                className="sv-input"
                name="tools"
                placeholder="Sora, Runway, ElevenLabs"
                type="text"
              />
            </label>
            <div className="grid gap-3">
              <label className="sv-surface-soft flex items-start gap-3 rounded-[1.2rem] px-4 py-4 text-sm text-muted-foreground">
                <input className="mt-1" name="ai_confirmed" type="checkbox" />
                <span>I confirm this film is AI-generated.</span>
              </label>
              <label className="sv-surface-soft flex items-start gap-3 rounded-[1.2rem] px-4 py-4 text-sm text-muted-foreground">
                <input className="mt-1" name="rights_confirmed" type="checkbox" />
                <span>I have rights to submit and distribute this work.</span>
              </label>
              <label className="sv-surface-soft flex items-start gap-3 rounded-[1.2rem] px-4 py-4 text-sm text-muted-foreground">
                <input className="mt-1" name="serial_policy_confirmed" type="checkbox" />
                <span>I understand acceptance is required before a serial is assigned.</span>
              </label>
            </div>
            <button className="sv-btn sv-btn-primary mt-2">
              Submit for review
            </button>
          </form>
          {!profile ? (
            <a
              className="sv-btn sv-btn-primary mt-6 inline-flex"
              href="/login?next=/submit"
            >
              Sign in to submit
            </a>
          ) : null}
        </div>

        <aside className="grid gap-4">
          <div className="sv-surface rounded-[2rem] p-6">
            <p className="sv-overline">What gets featured</p>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
              <div className="sv-surface-soft rounded-[1.3rem] px-4 py-4">
                clear metadata and strong thumbnail discipline
              </div>
              <div className="sv-surface-soft rounded-[1.3rem] px-4 py-4">
                longer-form pacing that supports a real watch session
              </div>
              <div className="sv-surface-soft rounded-[1.3rem] px-4 py-4">
                rights-safe submission with no trust flags
              </div>
            </div>
          </div>
          <div className="sv-surface rounded-[2rem] p-6">
            <p className="sv-overline">What accepted creators get</p>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
              <div className="sv-surface-soft rounded-[1.3rem] px-4 py-4">
                a permanent public serial that can be shared as proof of being early
              </div>
              <div className="sv-surface-soft rounded-[1.3rem] px-4 py-4">
                a canonical Supaviewer watch page separate from the raw YouTube link
              </div>
              <div className="sv-surface-soft rounded-[1.3rem] px-4 py-4">
                creator-profile visibility inside browse, collections, and future editorial rails
              </div>
            </div>
          </div>
          <div className="sv-surface rounded-[2rem] p-6">
            <p className="sv-overline">Serial policy</p>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Serial numbers are sequential, public, and permanent. Removed titles do not lose their
              number and numbers are never recycled.
            </p>
          </div>
          <div className="sv-surface rounded-[2rem] p-6">
            <p className="sv-overline">Review flow</p>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
              <div className="sv-surface-soft rounded-[1.3rem] px-4 py-4">
                1. validate source URL and rights declarations
              </div>
              <div className="sv-surface-soft rounded-[1.3rem] px-4 py-4">
                2. review title, metadata quality, and fit for long-form viewing
              </div>
              <div className="sv-surface-soft rounded-[1.3rem] px-4 py-4">
                3. assign the next public serial only when accepted
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

import { submitFilm } from "@/app/submit/actions";
import { getCurrentSessionProfile } from "@/lib/auth";

type SubmitPageProps = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

const errorMessages: Record<string, string> = {
  "missing-fields": "Fill in all required submission fields before sending the film.",
  "confirmations-required": "Confirm AI generation, rights ownership, and serial policy before submitting.",
  "invalid-runtime": "Enter a valid runtime in minutes.",
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
        <div className="rounded-[1rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03)_34%,rgba(8,10,16,0.92)_74%)] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-white/44">Submission</p>
          <h1 className="mt-3 font-display text-5xl text-white sm:text-6xl">Submit a film</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/68">
            Production-grade submission starts with a YouTube source, structured metadata, and clear
            rights declarations. Accepted titles receive the next permanent public serial number.
          </p>

          {!profile ? (
            <div className="mt-8 rounded-[1.4rem] border border-white/10 bg-white/6 px-4 py-4 text-sm text-white/72">
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
              <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/42">
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
                <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/42">
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
                <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/42">
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
                <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/42">
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
                <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/42">
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
              <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/42">
                Logline
              </span>
              <textarea
                className="sv-textarea min-h-32"
                name="logline"
                placeholder="One to two lines that position the film clearly."
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/42">
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
              <label className="flex items-start gap-3 rounded-[1.2rem] border border-white/10 bg-white/4 px-4 py-4 text-sm text-white/72">
                <input className="mt-1" name="ai_confirmed" type="checkbox" />
                <span>I confirm this film is AI-generated.</span>
              </label>
              <label className="flex items-start gap-3 rounded-[1.2rem] border border-white/10 bg-white/4 px-4 py-4 text-sm text-white/72">
                <input className="mt-1" name="rights_confirmed" type="checkbox" />
                <span>I have rights to submit and distribute this work.</span>
              </label>
              <label className="flex items-start gap-3 rounded-[1.2rem] border border-white/10 bg-white/4 px-4 py-4 text-sm text-white/72">
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
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/42">What gets featured</p>
            <div className="mt-4 grid gap-3 text-sm text-white/72">
              <div className="rounded-[1.3rem] border border-white/10 bg-white/4 px-4 py-4">
                clear metadata and strong thumbnail discipline
              </div>
              <div className="rounded-[1.3rem] border border-white/10 bg-white/4 px-4 py-4">
                longer-form pacing that supports a real watch session
              </div>
              <div className="rounded-[1.3rem] border border-white/10 bg-white/4 px-4 py-4">
                rights-safe submission with no trust flags
              </div>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/42">Serial policy</p>
            <p className="mt-4 text-sm leading-6 text-white/68">
              Serial numbers are sequential, public, and permanent. Removed titles do not lose their
              number and numbers are never recycled.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

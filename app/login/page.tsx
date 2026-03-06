import { sendMagicLink } from "@/app/login/actions";

type LoginPageProps = {
  searchParams: Promise<{ sent?: string; error?: string; next?: string }>;
};

const errorMessages: Record<string, string> = {
  "missing-email": "Enter your email to receive a magic link.",
  "magic-link-failed": "The magic link could not be sent. Try again.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = params.next ?? "/";
  const sent = params.sent === "1";
  const error = params.error ? errorMessages[params.error] : null;

  return (
    <main className="mx-auto flex min-h-[78vh] w-full max-w-[92rem] items-center px-4 pb-28 pt-6 sm:px-6 lg:px-10">
      <section className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
        <div className="rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(244,195,117,0.16),rgba(255,255,255,0.03)_34%,rgba(8,10,16,0.92)_74%)] p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-white/44">Magic link access</p>
          <h1 className="mt-4 max-w-3xl font-display text-6xl leading-[0.92] text-white">
            Enter the cinema without a password.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/68">
            Superviewer uses Supabase magic-link auth for a faster, cleaner entry flow. Sign in once,
            then save films, follow creators, comment, and submit work.
          </p>
        </div>
        <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-white/42">Sign in</p>
          {sent ? (
            <div className="mt-4 rounded-[1.4rem] border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-100">
              Magic link sent. Open the email on this device and you will return to Superviewer signed in.
            </div>
          ) : null}
          {error ? (
            <div className="mt-4 rounded-[1.4rem] border border-rose-400/20 bg-rose-400/10 px-4 py-4 text-sm text-rose-100">
              {error}
            </div>
          ) : null}
          <form action={sendMagicLink} className="mt-6 grid gap-4">
            <input name="next" type="hidden" value={next} />
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/42">
                Email
              </span>
              <input
                className="w-full rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[var(--color-highlight)]/40"
                name="email"
                placeholder="you@studio.com"
                type="email"
              />
            </label>
            <button className="rounded-full bg-[var(--color-highlight)] px-6 py-3 text-sm font-semibold text-[var(--color-bg)] transition hover:brightness-105">
              Send magic link
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

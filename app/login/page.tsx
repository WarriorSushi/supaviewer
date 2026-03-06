import {
  sendMagicLink,
  signInWithPassword,
  signUpWithPassword,
} from "@/app/login/actions";

type LoginPageProps = {
  searchParams: Promise<{
    sent?: string;
    signup?: string;
    error?: string;
    next?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  "missing-email": "Enter your email to receive a magic link.",
  "magic-link-failed": "The magic link could not be sent. Try again.",
  "password-missing-fields": "Enter both email and password.",
  "password-login-failed": "Email/password sign-in failed. Check the credentials and try again.",
  "signup-missing-fields": "Enter an email and password to create an account.",
  "signup-failed": "Account creation failed. The user may already exist or the password is too weak.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = params.next ?? "/";
  const sent = params.sent === "1";
  const signup = params.signup === "1";
  const error = params.error ? errorMessages[params.error] : null;

  return (
    <main className="mx-auto flex min-h-[82vh] w-full max-w-[100rem] items-center px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="grid w-full gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(30rem,0.96fr)]">
        <div className="rounded-[1rem] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02)_34%,rgba(10,10,12,0.96)_74%)] p-8 sm:p-10">
          <p className="text-[0.64rem] uppercase tracking-[0.24em] text-white/40">Sign in</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl">
            Enter Superviewer.
          </h1>
          <p className="mt-5 max-w-2xl text-[0.96rem] leading-7 text-white/64">
            Password login for fast access. Magic link for low-friction email entry. One account
            covers library, studio, and admin.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="sv-surface-soft rounded-[0.9rem] px-4 py-4 text-sm text-white/70">
              Password login for fast local testing
            </div>
            <div className="sv-surface-soft rounded-[0.9rem] px-4 py-4 text-sm text-white/70">
              Magic link for low-friction real users
            </div>
            <div className="sv-surface-soft rounded-[0.9rem] px-4 py-4 text-sm text-white/70">
              One account across library, studio, and admin
            </div>
          </div>
        </div>

        <div className="sv-surface rounded-[1rem] p-6 sm:p-8">
          {sent ? (
            <div className="rounded-[0.85rem] border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-100">
              Magic link sent. Open the email on this device and you will return to Superviewer signed
              in.
            </div>
          ) : null}
          {signup ? (
            <div className="rounded-[0.85rem] border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-100">
              Account created. If email confirmation is required, confirm it first. Otherwise you can
              sign in now with your password.
            </div>
          ) : null}
          {error ? (
            <div className="rounded-[0.85rem] border border-rose-400/20 bg-rose-400/10 px-4 py-4 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="mt-6 grid gap-4">
            <form action={signInWithPassword} className="grid gap-4 rounded-[0.95rem] border border-white/8 bg-white/[0.03] p-5">
              <input name="next" type="hidden" value={next} />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[0.64rem] uppercase tracking-[0.2em] text-white/40">Email + password</p>
                <p className="font-mono text-[0.72rem] text-[var(--color-highlight)]">drsyedirfan93@gmail.com / Fra1ni4m</p>
              </div>
              <label className="block">
                <span className="mb-2 block text-[0.64rem] uppercase tracking-[0.2em] text-white/40">
                  Email
                </span>
                <input
                  className="sv-input"
                  defaultValue="drsyedirfan93@gmail.com"
                  name="email"
                  placeholder="you@studio.com"
                  type="email"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[0.64rem] uppercase tracking-[0.2em] text-white/40">
                  Password
                </span>
                <input
                  className="sv-input"
                  defaultValue="Fra1ni4m"
                  name="password"
                  placeholder="Password"
                  type="password"
                />
              </label>
              <button className="sv-btn sv-btn-primary">
                Sign in with password
              </button>
            </form>

            <form action={sendMagicLink} className="grid gap-4 rounded-[0.95rem] border border-white/8 bg-white/[0.03] p-5">
              <input name="next" type="hidden" value={next} />
              <p className="text-[0.64rem] uppercase tracking-[0.2em] text-white/40">Magic link</p>
              <label className="block">
                <span className="mb-2 block text-[0.64rem] uppercase tracking-[0.2em] text-white/40">
                  Email
                </span>
                <input
                  className="sv-input"
                  name="email"
                  placeholder="you@studio.com"
                  type="email"
                />
              </label>
              <button className="sv-btn sv-btn-secondary">
                Send magic link
              </button>
            </form>

            <form action={signUpWithPassword} className="grid gap-4 rounded-[0.95rem] border border-white/8 bg-white/[0.03] p-5">
              <input name="next" type="hidden" value={next} />
              <p className="text-[0.64rem] uppercase tracking-[0.2em] text-white/40">Create account</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  className="sv-input"
                  name="email"
                  placeholder="new@studio.com"
                  type="email"
                />
                <input
                  className="sv-input"
                  name="password"
                  placeholder="StrongPassword1"
                  type="password"
                />
              </div>
              <button className="sv-btn sv-btn-secondary">
                Create account
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

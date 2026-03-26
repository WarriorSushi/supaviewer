import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Sign in",
  robots: {
    index: false,
    follow: false,
  },
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
    <main className="mx-auto flex min-h-[82vh] w-full max-w-[96rem] items-center px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="mx-auto w-full max-w-lg sv-animate-in">
        <p className="sv-overline">Sign in</p>
        <h1 className="mt-4 font-display text-5xl font-medium text-foreground sm:text-6xl">
          Enter Supaviewer.
        </h1>
        <p className="sv-body mt-5 max-w-md">
          Sign in with email and password or use a magic link. One account covers your library,
          creator studio, submissions, and moderation access where permitted.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3 sv-animate-in sv-stagger-1">
          <div className="rounded-xl border border-border/50 bg-card/60 px-3 py-3 text-sm text-muted-foreground">
            Password login
          </div>
          <div className="rounded-xl border border-border/50 bg-card/60 px-3 py-3 text-sm text-muted-foreground">
            Magic link
          </div>
          <div className="rounded-xl border border-border/50 bg-card/60 px-3 py-3 text-sm text-muted-foreground">
            One identity
          </div>
        </div>

        <div className="mt-8 grid gap-4 sv-animate-in sv-stagger-2">
          {sent ? (
            <div className="rounded-xl border border-[oklch(0.72_0.14_55_/_20%)] bg-[oklch(0.72_0.14_55_/_6%)] px-4 py-4 text-sm text-foreground">
              Magic link sent. Open the email on this device and you will return to Supaviewer signed
              in.
            </div>
          ) : null}
          {signup ? (
            <div className="rounded-xl border border-[oklch(0.72_0.14_55_/_20%)] bg-[oklch(0.72_0.14_55_/_6%)] px-4 py-4 text-sm text-foreground">
              Account created. If email confirmation is required, confirm it first. Otherwise you can
              sign in now with your password.
            </div>
          ) : null}
          {error ? (
            <div className="rounded-xl border border-[oklch(0.72_0.14_55_/_30%)] bg-[oklch(0.72_0.14_55_/_8%)] px-4 py-4 text-sm text-foreground">
              {error}
            </div>
          ) : null}

          <div className="rounded-xl border border-border/50 bg-card p-6">
            <form action={signInWithPassword} className="grid gap-4">
              <input name="next" type="hidden" value={next} />
              <p className="sv-overline">Email + password</p>
              <label className="grid gap-2">
                <span className="sv-overline">Email</span>
                <input
                  className="sv-input"
                  name="email"
                  placeholder="you@studio.com"
                  type="email"
                />
              </label>
              <label className="grid gap-2">
                <span className="sv-overline">Password</span>
                <input
                  className="sv-input"
                  name="password"
                  placeholder="Password"
                  type="password"
                />
              </label>
              <button className="sv-btn sv-btn-primary" type="submit">
                Sign in with password
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-6">
            <form action={sendMagicLink} className="grid gap-4">
              <input name="next" type="hidden" value={next} />
              <p className="sv-overline">Magic link</p>
              <label className="grid gap-2">
                <span className="sv-overline">Email</span>
                <input
                  className="sv-input"
                  name="email"
                  placeholder="you@studio.com"
                  type="email"
                />
              </label>
              <button className="sv-btn sv-btn-secondary" type="submit">
                Send magic link
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-6">
            <form action={signUpWithPassword} className="grid gap-4">
              <input name="next" type="hidden" value={next} />
              <p className="sv-overline">Create account</p>
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
              <button className="sv-btn sv-btn-secondary" type="submit">
                Create account
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

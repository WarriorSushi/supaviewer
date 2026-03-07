import type { Metadata } from "next";
import {
  sendMagicLink,
  signInWithPassword,
  signUpWithPassword,
} from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
    <main className="mx-auto flex min-h-[82vh] w-full max-w-[100rem] items-center px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="grid w-full gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(30rem,0.96fr)]">
        <div className="sv-surface rounded-[1.2rem] p-8 sm:p-10">
          <p className="sv-overline">Sign in</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-[-0.06em] text-foreground sm:text-6xl">
            Enter Supaviewer.
          </h1>
          <p className="mt-5 max-w-2xl text-[0.96rem] leading-7 text-muted-foreground">
            Sign in with email and password or use a magic link. One account covers your library,
            creator studio, submissions, and moderation access where permitted.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="sv-surface-soft rounded-[0.9rem] px-4 py-4 text-sm text-muted-foreground">
              Password login for direct account access
            </div>
            <div className="sv-surface-soft rounded-[0.9rem] px-4 py-4 text-sm text-muted-foreground">
              Magic link for low-friction sign-in
            </div>
            <div className="sv-surface-soft rounded-[0.9rem] px-4 py-4 text-sm text-muted-foreground">
              One identity across viewing and creator tools
            </div>
          </div>
        </div>

        <div className="sv-surface rounded-[1rem] p-6 sm:p-8">
          {sent ? (
            <div className="rounded-[0.85rem] border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-700 dark:text-emerald-100">
              Magic link sent. Open the email on this device and you will return to Supaviewer signed
              in.
            </div>
          ) : null}
          {signup ? (
            <div className="rounded-[0.85rem] border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-700 dark:text-emerald-100">
              Account created. If email confirmation is required, confirm it first. Otherwise you can
              sign in now with your password.
            </div>
          ) : null}
          {error ? (
            <div className="rounded-[0.85rem] border border-rose-500/20 bg-rose-500/10 px-4 py-4 text-sm text-rose-700 dark:text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="mt-6 grid gap-4">
            <Card className="border-border/80 bg-card py-0 shadow-none">
              <CardContent className="grid gap-4 p-5">
                <form action={signInWithPassword} className="grid gap-4">
                  <input name="next" type="hidden" value={next} />
                  <p className="sv-overline">Email + password</p>
                  <label className="grid gap-2">
                    <span className="sv-overline">Email</span>
                    <Input
                      className="h-11 rounded-xl border-input/90 bg-background/70 shadow-none dark:bg-input/20"
                      name="email"
                      placeholder="you@studio.com"
                      type="email"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="sv-overline">Password</span>
                    <Input
                      className="h-11 rounded-xl border-input/90 bg-background/70 shadow-none dark:bg-input/20"
                      name="password"
                      placeholder="Password"
                      type="password"
                    />
                  </label>
                  <Button className="sv-btn sv-btn-primary rounded-xl" type="submit">
                    Sign in with password
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card py-0 shadow-none">
              <CardContent className="grid gap-4 p-5">
                <form action={sendMagicLink} className="grid gap-4">
                  <input name="next" type="hidden" value={next} />
                  <p className="sv-overline">Magic link</p>
                  <label className="grid gap-2">
                    <span className="sv-overline">Email</span>
                    <Input
                      className="h-11 rounded-xl border-input/90 bg-background/70 shadow-none dark:bg-input/20"
                      name="email"
                      placeholder="you@studio.com"
                      type="email"
                    />
                  </label>
                  <Button className="sv-btn rounded-xl" type="submit" variant="outline">
                    Send magic link
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card py-0 shadow-none">
              <CardContent className="grid gap-4 p-5">
                <form action={signUpWithPassword} className="grid gap-4">
                  <input name="next" type="hidden" value={next} />
                  <p className="sv-overline">Create account</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      className="h-11 rounded-xl border-input/90 bg-background/70 shadow-none dark:bg-input/20"
                      name="email"
                      placeholder="new@studio.com"
                      type="email"
                    />
                    <Input
                      className="h-11 rounded-xl border-input/90 bg-background/70 shadow-none dark:bg-input/20"
                      name="password"
                      placeholder="StrongPassword1"
                      type="password"
                    />
                  </div>
                  <Button className="sv-btn rounded-xl" type="submit" variant="outline">
                    Create account
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

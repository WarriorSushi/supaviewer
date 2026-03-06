import Link from "next/link";
import { signOut } from "@/app/login/actions";
import { getCurrentSessionProfile } from "@/lib/auth";

export async function SiteHeader() {
  const { profile } = await getCurrentSessionProfile();

  return (
    <header className="sticky top-0 z-40 mx-auto w-full max-w-[92rem] px-4 pt-4 sm:px-6 lg:px-10">
      <div className="rounded-full border border-white/10 bg-[rgba(7,10,18,0.72)] px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link className="flex items-center gap-3" href="/">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/6 font-mono text-xs tracking-[0.28em] text-[var(--color-highlight)]">
              SV
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-white/46">Superviewer</p>
              <p className="font-display text-xl leading-none text-white">AI cinema, numbered.</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-white/68 md:flex">
            <Link className="transition hover:text-white" href="/">
              Home
            </Link>
            <Link className="transition hover:text-white" href="/films">
              Films
            </Link>
            <Link className="transition hover:text-white" href="/creators">
              Creators
            </Link>
            {profile ? (
              <>
                <Link className="transition hover:text-white" href="/library">
                  Library
                </Link>
                <Link className="transition hover:text-white" href="/studio">
                  Studio
                </Link>
              </>
            ) : null}
            <Link className="transition hover:text-white" href="/submit">
              Submit
            </Link>
            {profile?.role === "admin" ? (
              <Link className="transition hover:text-white" href="/admin">
                Admin
              </Link>
            ) : null}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            {profile ? (
              <>
                <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/72">
                  {profile.displayName}
                </div>
                <form action={signOut}>
                  <button className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-white transition hover:border-white/24 hover:bg-white/10">
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link
                className="rounded-full bg-[var(--color-highlight)] px-4 py-2 text-sm font-semibold text-[var(--color-bg)] transition hover:brightness-105"
                href="/login"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

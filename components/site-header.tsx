import Link from "next/link";
import { signOut } from "@/app/login/actions";
import { CreatorIcon, HomeIcon, LibraryIcon, ReelsIcon } from "@/components/icons";
import { getCurrentSessionProfile } from "@/lib/auth";

export async function SiteHeader() {
  const { profile } = await getCurrentSessionProfile();

  return (
    <header className="sticky top-0 z-40 mx-auto w-full max-w-[110rem] px-4 pt-4 sm:px-6 lg:px-10">
      <div className="rounded-[1rem] border border-white/8 bg-[rgba(10,10,12,0.82)] px-4 py-3 shadow-[0_24px_72px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:px-5">
        <div className="flex items-center justify-between gap-5">
          <Link className="flex min-w-0 items-center gap-3" href="/">
            <div className="flex h-10 w-10 items-center justify-center rounded-[0.85rem] border border-white/10 bg-white/5 font-mono text-xs tracking-[0.24em] text-white">
              SV
            </div>
            <div className="min-w-0">
              <p className="truncate text-[0.64rem] uppercase tracking-[0.3em] text-white/34">superviewer.com</p>
              <p className="truncate text-sm font-medium tracking-[0.01em] text-white">AI cinema, cataloged.</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-1.5 text-sm text-white/60 lg:flex">
            <Link className="inline-flex items-center gap-2 rounded-[0.75rem] px-3 py-2 transition hover:bg-white/6 hover:text-white" href="/">
              <HomeIcon className="h-4 w-4" />
              Home
            </Link>
            <Link className="inline-flex items-center gap-2 rounded-[0.75rem] px-3 py-2 transition hover:bg-white/6 hover:text-white" href="/films">
              <ReelsIcon className="h-4 w-4" />
              Films
            </Link>
            <Link className="inline-flex items-center gap-2 rounded-[0.75rem] px-3 py-2 transition hover:bg-white/6 hover:text-white" href="/creators">
              <CreatorIcon className="h-4 w-4" />
              Creators
            </Link>
            {profile ? (
              <>
                <Link className="inline-flex items-center gap-2 rounded-[0.75rem] px-3 py-2 transition hover:bg-white/6 hover:text-white" href="/library">
                  <LibraryIcon className="h-4 w-4" />
                  Library
                </Link>
                <Link className="rounded-[0.75rem] px-3 py-2 transition hover:bg-white/6 hover:text-white" href="/studio">
                  Studio
                </Link>
              </>
            ) : null}
            <Link className="rounded-[0.75rem] px-3 py-2 transition hover:bg-white/6 hover:text-white" href="/submit">
              Submit
            </Link>
            {profile?.role === "admin" ? (
              <Link className="rounded-[0.75rem] px-3 py-2 transition hover:bg-white/6 hover:text-white" href="/admin">
                Admin
              </Link>
            ) : null}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            {profile ? (
              <>
                <div className="rounded-[0.8rem] border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/72">
                  {profile.displayName}
                </div>
                <form action={signOut}>
                  <button className="sv-btn sv-btn-secondary">
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link
                className="sv-btn sv-btn-primary"
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

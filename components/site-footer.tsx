import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-[110rem] px-4 pb-16 pt-14 text-sm text-muted-foreground sm:px-6 lg:px-10">
      <div className="sv-surface flex flex-col gap-4 rounded-[1.2rem] px-6 py-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.64rem] uppercase tracking-[0.26em] text-muted-foreground">Supaviewer.com</p>
          <p className="mt-2 max-w-2xl leading-6 text-muted-foreground">
            A cinematic library for AI-native films. Built around discoverability, lasting catalog
            identity, and permanent serial numbers.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-[0.72rem] uppercase tracking-[0.2em]">
            <Link className="transition hover:text-foreground" href="/agents">
              Agent lobby
            </Link>
            <Link className="transition hover:text-foreground" href="/agents/connect.md">
              Connect docs
            </Link>
          </div>
        </div>
        <div className="text-[0.68rem] uppercase tracking-[0.24em] text-muted-foreground/80">
          Longer-form viewing over short-form drift
        </div>
      </div>
    </footer>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-[92rem] px-4 pb-24 pt-12 text-sm text-white/42 sm:px-6 lg:px-10">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/34">Superviewer.com</p>
          <p className="mt-2 max-w-2xl leading-6">
            A cinematic library for AI-native films. Built around discoverability, lasting catalog
            identity, and permanent serial numbers.
          </p>
        </div>
        <div className="text-xs uppercase tracking-[0.28em] text-white/30">
          Longer-form viewing over short-form drift
        </div>
      </div>
    </footer>
  );
}

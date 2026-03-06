import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-[92rem] flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-10">
      <p className="text-xs uppercase tracking-[0.3em] text-white/42">Not found</p>
      <h1 className="mt-4 font-display text-6xl text-white">This entry left the catalog.</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-white/64">
        The page you asked for does not exist or the title has been removed from public view.
      </p>
      <Link
        className="mt-8 rounded-full bg-[var(--color-highlight)] px-6 py-3 text-sm font-semibold text-[var(--color-bg)]"
        href="/films"
      >
        Browse films
      </Link>
    </main>
  );
}

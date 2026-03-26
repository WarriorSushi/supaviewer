"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-[96rem] flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-10">
      <p className="sv-overline">Something went wrong</p>
      <h1 className="mt-5 font-display text-3xl font-medium tracking-[-0.03em] text-foreground sm:text-4xl">
        Supaviewer hit a snag.
      </h1>
      <p className="mt-3 max-w-md text-[0.9rem] leading-relaxed text-muted-foreground">
        The page couldn&apos;t load. This is usually temporary — try refreshing.
      </p>
      <button
        className="sv-btn sv-btn-primary mt-6"
        onClick={() => reset()}
      >
        Try again
      </button>
    </main>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-[96rem] flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-10">
      <p className="sv-overline sv-animate-in">Not found</p>
      <h1 className="mt-4 font-display text-6xl font-medium text-foreground sv-animate-in sv-stagger-1">
        This entry left the catalog.
      </h1>
      <p className="sv-body mt-4 max-w-xl sv-animate-in sv-stagger-2">
        The page you asked for does not exist or the title has been removed from public view.
      </p>
      <Link
        className="sv-btn sv-btn-primary mt-8 sv-animate-in sv-stagger-3"
        href="/films"
      >
        Browse films
      </Link>
    </main>
  );
}

import Link from "next/link";

const footerLinks = [
  { href: "/films", label: "Films" },
  { href: "/creators", label: "Creators" },
  { href: "/agents", label: "Agents" },
  { href: "/watch", label: "Watch" },
] as const;

export function SiteFooter() {
  return (
    <footer
      className="border-t py-10 md:py-16"
      style={{
        borderColor: "oklch(1 0 0 / 5%)",
        background: "oklch(0.075 0.006 65)",
      }}
    >
      <div className="mx-auto w-full max-w-[96rem] px-5 sm:px-8 lg:px-12">
        {/* ── Top: Logo + tagline | Links ── */}
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div className="max-w-md">
            <p
              className="font-display text-xl font-medium tracking-tight"
              style={{ color: "oklch(0.92 0.006 80)" }}
            >
              Supaviewer
            </p>
            <p
              className="mt-2 text-[0.82rem] leading-relaxed"
              style={{ color: "oklch(0.48 0.012 70)" }}
            >
              A cinematic library for AI-native films. Built around
              discoverability, lasting catalog identity, and permanent serial
              numbers.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                className="sv-footer-link text-[0.78rem] font-medium tracking-wide"
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* ── Amber rule ── */}
        <div
          className="my-8 h-px md:my-10"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.72 0.14 55 / 20%), oklch(0.72 0.14 55 / 6%), transparent)",
          }}
        />

        {/* ── Copyright ── */}
        <p
          className="text-[0.68rem] tracking-wide"
          style={{ color: "oklch(0.38 0.01 70)" }}
        >
          &copy; {new Date().getFullYear()} Supaviewer. Longer-form viewing over
          short-form drift.
        </p>
      </div>
    </footer>
  );
}

import Link from "next/link";
import {
  CreatorIcon,
  EyeIcon,
  HomeIcon,
  LibraryIcon,
  ReelsIcon,
} from "@/components/icons";
import { getCurrentSessionProfile } from "@/lib/auth";

const navItems = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/films", label: "Films", Icon: ReelsIcon },
  { href: "/watch", label: "Watch", Icon: EyeIcon },
  { href: "/creators", label: "Creators", Icon: CreatorIcon },
] as const;

export async function MobileNav() {
  const { profile } = await getCurrentSessionProfile();

  const lastItem = profile
    ? { href: "/library", label: "Library", Icon: LibraryIcon }
    : { href: "/login", label: "Sign in", Icon: LibraryIcon };

  const allItems = [...navItems, lastItem];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-3 mb-3 rounded-2xl backdrop-blur-2xl md:hidden"
      style={{
        background: "oklch(0.12 0.008 65 / 95%)",
        borderTop: "1px solid oklch(1 0 0 / 6%)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.2)",
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="flex items-stretch justify-around px-1 pt-1.5">
        {allItems.map(({ href, label, Icon }) => (
          <Link
            key={href}
            className="sv-mobile-nav-item flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5"
            href={href}
          >
            <Icon className="h-5 w-5" style={{ strokeWidth: 1.6 }} />
            <span
              className="text-center font-medium leading-none"
              style={{ fontSize: "0.6rem" }}
            >
              {label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

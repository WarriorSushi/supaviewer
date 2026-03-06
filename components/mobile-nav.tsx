import Link from "next/link";
import { CreatorIcon, HomeIcon, LibraryIcon, ReelsIcon } from "@/components/icons";
import { getCurrentSessionProfile } from "@/lib/auth";

export async function MobileNav() {
  const { profile } = await getCurrentSessionProfile();

  return (
    <nav className="fixed inset-x-4 bottom-4 z-40 rounded-[1rem] border border-white/10 bg-[rgba(10,10,12,0.92)] px-2 py-2 shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-2xl md:hidden">
      <div className="flex items-center justify-between text-[0.58rem] uppercase tracking-[0.16em] text-white/56">
        <Link className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[0.8rem] px-2 py-2.5 transition hover:bg-white/8 hover:text-white" href="/">
          <HomeIcon className="h-4.5 w-4.5" />
          Home
        </Link>
        <Link className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[0.8rem] px-2 py-2.5 transition hover:bg-white/8 hover:text-white" href="/films">
          <ReelsIcon className="h-4.5 w-4.5" />
          Films
        </Link>
        <Link
          className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[0.8rem] px-2 py-2.5 transition hover:bg-white/8 hover:text-white"
          href="/creators"
        >
          <CreatorIcon className="h-4.5 w-4.5" />
          Makers
        </Link>
        {profile ? (
          <Link
            className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[0.8rem] px-2 py-2.5 transition hover:bg-white/8 hover:text-white"
            href="/library"
          >
            <LibraryIcon className="h-4.5 w-4.5" />
            Library
          </Link>
        ) : (
          <Link
            className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[0.8rem] px-2 py-2.5 transition hover:bg-white/8 hover:text-white"
            href="/login"
          >
            <LibraryIcon className="h-4.5 w-4.5" />
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}

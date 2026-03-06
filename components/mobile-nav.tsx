import Link from "next/link";
import { getCurrentSessionProfile } from "@/lib/auth";

export async function MobileNav() {
  const { profile } = await getCurrentSessionProfile();

  return (
    <nav className="fixed inset-x-4 bottom-4 z-40 rounded-full border border-white/10 bg-[rgba(7,10,18,0.84)] px-3 py-2 shadow-[0_18px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-between text-[0.68rem] uppercase tracking-[0.24em] text-white/56">
        <Link className="rounded-full px-3 py-2 transition hover:bg-white/8 hover:text-white" href="/">
          Home
        </Link>
        <Link className="rounded-full px-3 py-2 transition hover:bg-white/8 hover:text-white" href="/films">
          Films
        </Link>
        <Link
          className="rounded-full px-3 py-2 transition hover:bg-white/8 hover:text-white"
          href="/creators"
        >
          Makers
        </Link>
        {profile ? (
          <Link
            className="rounded-full px-3 py-2 transition hover:bg-white/8 hover:text-white"
            href="/library"
          >
            Library
          </Link>
        ) : (
          <Link
            className="rounded-full px-3 py-2 transition hover:bg-white/8 hover:text-white"
            href="/login"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}

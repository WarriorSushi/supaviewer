"use client";

import * as React from "react";
import { LayoutGroup, motion } from "framer-motion";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/login/actions";
import { BotIcon, CreatorIcon, HomeIcon, LibraryIcon, ReelsIcon } from "@/components/icons";
import { CompactThemeToggle, ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/* ─── Types ─── */

type HeaderProfile = {
  displayName: string;
  role: "viewer" | "admin";
} | null;

type SiteHeaderClientProps = {
  profile: HeaderProfile;
};

/* ─── Navigation data ─── */

const primaryNavItems = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/films", label: "Films", icon: ReelsIcon },
  { href: "/creators", label: "Creators", icon: CreatorIcon },
  { href: "/agents", label: "Agents", icon: BotIcon },
] as const;

function getAccountLinks(profile: HeaderProfile) {
  if (!profile) {
    return [{ href: "/submit", label: "Submit", icon: ReelsIcon }] as const;
  }

  return [
    { href: "/library", label: "Library", icon: LibraryIcon },
    { href: "/studio", label: "Studio", icon: CreatorIcon },
    { href: "/submit", label: "Submit", icon: ReelsIcon },
    ...(profile.role === "admin"
      ? [{ href: "/admin", label: "Admin", icon: LibraryIcon }]
      : []),
  ] as const;
}

/* ─── Style helpers ─── */

/** Desktop nav link — opacity-shift style, no background highlights */
function desktopNavLinkClass(active: boolean) {
  return cn(
    "relative inline-flex items-center gap-2 px-3 py-2 font-sans text-[0.82rem] font-medium tracking-[0.01em] transition-all duration-200 ease-out",
    active
      ? "text-[oklch(0.93_0.008_80)]"
      : "text-[oklch(0.58_0.012_70)] hover:text-[oklch(0.82_0.01_78)]",
  );
}

/** Mobile nav link — larger touch targets */
function mobileNavLinkClass(active: boolean) {
  return cn(
    "relative flex items-center gap-3 rounded-xl px-4 py-3 font-sans text-[0.88rem] font-medium transition-all duration-200",
    active
      ? "text-[oklch(0.93_0.008_80)]"
      : "text-[oklch(0.58_0.012_70)] hover:text-[oklch(0.82_0.01_78)]",
  );
}

/* ─── Animation springs ─── */

const desktopLayoutTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

const smoothEase = [0.22, 1, 0.36, 1] as const;

/* ─── Component ─── */

export function SiteHeaderClient({ profile }: SiteHeaderClientProps) {
  const pathname = usePathname();
  const [desktopSearchOpen, setDesktopSearchOpen] = React.useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isMobileViewport, setIsMobileViewport] = React.useState(false);
  const [mobileHeaderVisible, setMobileHeaderVisible] = React.useState(true);
  const desktopSearchRef = React.useRef<HTMLInputElement>(null);
  const mobileSearchRef = React.useRef<HTMLInputElement>(null);
  const accountLinks = getAccountLinks(profile);
  const desktopNavItems = [...primaryNavItems, ...accountLinks];

  /* ── Focus management ── */
  React.useEffect(() => {
    if (desktopSearchOpen) desktopSearchRef.current?.focus();
  }, [desktopSearchOpen]);

  React.useEffect(() => {
    if (mobileSearchOpen) mobileSearchRef.current?.focus();
  }, [mobileSearchOpen]);

  /* ── Close overlays on route change ── */
  React.useEffect(() => {
    setDesktopSearchOpen(false);
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  /* ── Keyboard shortcuts ── */
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (event.key === "/" && !isTypingTarget) {
        event.preventDefault();
        setDesktopSearchOpen(true);
      }

      if (event.key === "Escape") {
        setDesktopSearchOpen(false);
        setMobileSearchOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /* ── Viewport detection ── */
  React.useEffect(() => {
    function updateViewportState() {
      setIsMobileViewport(window.innerWidth < 768);
    }

    updateViewportState();
    window.addEventListener("resize", updateViewportState);
    return () => window.removeEventListener("resize", updateViewportState);
  }, []);

  /* ── Mobile scroll hide/show ── */
  React.useEffect(() => {
    if (!isMobileViewport) {
      setMobileHeaderVisible(true);
      return;
    }

    let lastScrollY = window.scrollY;

    function onScroll() {
      const nextScrollY = window.scrollY;
      const delta = nextScrollY - lastScrollY;

      if (nextScrollY <= 24 || mobileSearchOpen || mobileMenuOpen) {
        setMobileHeaderVisible(true);
      } else if (delta > 8) {
        setMobileHeaderVisible(false);
      } else if (delta < -8) {
        setMobileHeaderVisible(true);
      }

      lastScrollY = nextScrollY;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobileViewport, mobileMenuOpen, mobileSearchOpen]);

  /* ── Active link helper ── */
  function isActive(href: string) {
    return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <motion.header
      animate={{
        y: isMobileViewport && !mobileHeaderVisible ? -72 : 0,
      }}
      className="sticky top-0 z-40 w-full"
      initial={false}
      transition={{ duration: 0.28, ease: smoothEase }}
    >
      {/* ── Header bar ── */}
      <div
        className="border-b px-4 sm:px-6 lg:px-10"
        style={{
          background: "oklch(0.095 0.008 65 / 92%)",
          borderColor: "oklch(1 0 0 / 5%)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <div className="mx-auto flex h-14 max-w-[96rem] items-center justify-between gap-6">
          {/* ── Logo ── */}
          <Link
            className={cn(
              "flex shrink-0 items-center gap-2.5 transition-opacity duration-200 hover:opacity-80",
              mobileSearchOpen && "max-w-10 overflow-hidden",
            )}
            href="/"
          >
            <span
              className="font-display text-lg font-medium tracking-[-0.02em]"
              style={{ color: "oklch(0.93 0.008 80)" }}
            >
              Supaviewer
            </span>
          </Link>

          {/* ═══ Desktop navigation ═══ */}
          <LayoutGroup>
            <div className="hidden min-w-0 flex-1 items-center justify-end gap-2 lg:flex">
              {/* Nav links region */}
              <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
                <motion.div
                  animate={{
                    opacity: desktopSearchOpen ? 0 : 1,
                    width: desktopSearchOpen ? 0 : "auto",
                  }}
                  className="min-w-0 overflow-hidden"
                  initial={false}
                  transition={{ duration: 0.22, ease: smoothEase }}
                >
                  <motion.nav
                    layout
                    transition={desktopLayoutTransition}
                    className="flex min-w-0 items-center justify-end gap-0.5"
                  >
                    {desktopNavItems.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <motion.div key={item.href} layout transition={desktopLayoutTransition}>
                          <Link className={desktopNavLinkClass(active)} href={item.href}>
                            <span className="whitespace-nowrap">{item.label}</span>
                            {/* Active indicator: warm amber dot */}
                            {active && (
                              <motion.span
                                className="absolute -bottom-1 left-1/2 h-1 w-1 rounded-full"
                                layoutId="nav-active-dot"
                                style={{ background: "oklch(0.72 0.14 55)" }}
                                transition={desktopLayoutTransition}
                              />
                            )}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.nav>
                </motion.div>

                {/* ── Search ── */}
                <motion.form
                  action="/films"
                  animate={{
                    width: desktopSearchOpen ? "100%" : 40,
                    flexGrow: desktopSearchOpen ? 1 : 0,
                  }}
                  className="flex min-w-[2.5rem] shrink-0 items-center overflow-hidden rounded-lg px-1.5 py-1"
                  initial={false}
                  style={{
                    background: desktopSearchOpen ? "oklch(0.14 0.008 65 / 60%)" : "transparent",
                    border: desktopSearchOpen ? "1px solid oklch(0.72 0.14 55 / 25%)" : "1px solid transparent",
                  }}
                  transition={desktopLayoutTransition}
                >
                  <button
                    aria-label={desktopSearchOpen ? "Collapse search" : "Expand search"}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors duration-150"
                    onClick={() => setDesktopSearchOpen((v) => !v)}
                    type="button"
                    style={{ color: desktopSearchOpen ? "oklch(0.93 0.008 80)" : "oklch(0.58 0.012 70)" }}
                  >
                    {desktopSearchOpen ? <X className="size-[15px]" /> : <Search className="size-[15px]" />}
                  </button>
                  <motion.div
                    animate={{ opacity: desktopSearchOpen ? 1 : 0, x: desktopSearchOpen ? 0 : 8 }}
                    className={cn("relative min-w-0 flex-1", !desktopSearchOpen && "pointer-events-none")}
                    initial={false}
                    transition={{ duration: 0.2, ease: smoothEase }}
                  >
                    <Search
                      className="pointer-events-none absolute left-0 top-1/2 size-3.5 -translate-y-1/2"
                      style={{ color: "oklch(0.58 0.012 70)" }}
                    />
                    <Input
                      ref={desktopSearchRef}
                      className="h-7 min-w-0 border-0 bg-transparent pl-5 pr-0 text-[0.82rem] shadow-none placeholder:text-[oklch(0.45_0.01_65)] focus-visible:ring-0"
                      name="q"
                      placeholder="Title, creator, or #serial"
                      style={{ color: "oklch(0.93 0.008 80)" }}
                      type="search"
                    />
                  </motion.div>
                  <motion.span
                    animate={{ opacity: desktopSearchOpen ? 0 : 1, x: desktopSearchOpen ? -6 : 0 }}
                    className="shrink-0 rounded px-1 py-0.5 font-mono text-[0.58rem] tracking-[0.08em]"
                    initial={false}
                    style={{
                      color: "oklch(0.48 0.01 65)",
                      background: "oklch(1 0 0 / 5%)",
                    }}
                    transition={{ duration: 0.18, ease: smoothEase }}
                  >
                    /
                  </motion.span>
                </motion.form>
              </div>

              {/* ── Right actions ── */}
              <motion.div
                layout
                transition={desktopLayoutTransition}
                className="flex shrink-0 items-center gap-2.5"
              >
                {/* Theme toggle — refined compact */}
                <motion.div layout transition={desktopLayoutTransition} className="shrink-0">
                  <ThemeToggle />
                </motion.div>

                {profile ? (
                  <>
                    <motion.div
                      animate={{ opacity: desktopSearchOpen ? 0 : 1, width: desktopSearchOpen ? 0 : "auto" }}
                      className="overflow-hidden"
                      initial={false}
                      transition={{ duration: 0.24, ease: smoothEase }}
                    >
                      <div
                        className="whitespace-nowrap rounded-lg px-3 py-1.5 text-[0.82rem] font-medium"
                        style={{
                          color: "oklch(0.72 0.14 55)",
                          background: "oklch(0.72 0.14 55 / 8%)",
                          border: "1px solid oklch(0.72 0.14 55 / 12%)",
                        }}
                      >
                        {profile.displayName}
                      </div>
                    </motion.div>
                    <motion.form
                      action={signOut}
                      animate={{ opacity: desktopSearchOpen ? 0 : 1, width: desktopSearchOpen ? 0 : 96 }}
                      className="overflow-hidden"
                      initial={false}
                      transition={{ duration: 0.24, ease: smoothEase }}
                    >
                      <button
                        className="inline-flex h-9 w-24 items-center justify-center whitespace-nowrap rounded-lg text-[0.8rem] font-medium transition-colors duration-150"
                        style={{
                          color: "oklch(0.58 0.012 70)",
                          border: "1px solid oklch(1 0 0 / 8%)",
                        }}
                        type="submit"
                      >
                        Sign out
                      </button>
                    </motion.form>
                  </>
                ) : (
                  <motion.div
                    animate={{ opacity: desktopSearchOpen ? 0 : 1, width: desktopSearchOpen ? 0 : 88 }}
                    className="overflow-hidden"
                    initial={false}
                    transition={{ duration: 0.24, ease: smoothEase }}
                  >
                    <Link
                      className="inline-flex h-9 w-[5.5rem] items-center justify-center rounded-lg text-[0.82rem] font-medium transition-all duration-150 hover:opacity-90"
                      href="/login"
                      style={{
                        background: "oklch(0.72 0.14 55)",
                        color: "oklch(0.095 0.008 65)",
                      }}
                    >
                      Sign in
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </LayoutGroup>

          {/* ═══ Mobile controls ═══ */}
          <div
            className={cn(
              "flex items-center gap-1.5 lg:hidden",
              mobileSearchOpen ? "min-w-0 flex-1" : "shrink-0",
            )}
          >
            {mobileSearchOpen ? (
              <form action="/films" className="flex min-w-0 flex-1 items-center gap-2">
                <div className="relative min-w-0 flex-1">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
                    style={{ color: "oklch(0.58 0.012 70)" }}
                  />
                  <Input
                    ref={mobileSearchRef}
                    className="h-10 rounded-lg pl-9 pr-3 text-[0.86rem] shadow-none"
                    name="q"
                    placeholder="Search films..."
                    style={{
                      background: "oklch(0.14 0.008 65 / 60%)",
                      border: "1px solid oklch(0.72 0.14 55 / 20%)",
                      color: "oklch(0.93 0.008 80)",
                    }}
                    type="search"
                  />
                </div>
                <button
                  aria-label="Close search"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors"
                  onClick={() => setMobileSearchOpen(false)}
                  style={{
                    color: "oklch(0.58 0.012 70)",
                    border: "1px solid oklch(1 0 0 / 8%)",
                  }}
                  type="button"
                >
                  <X className="size-4" />
                </button>
              </form>
            ) : (
              <>
                <button
                  aria-label="Open search"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-150"
                  onClick={() => setMobileSearchOpen(true)}
                  style={{ color: "oklch(0.58 0.012 70)" }}
                  type="button"
                >
                  <Search className="size-[18px]" />
                </button>
                <CompactThemeToggle />
                <Sheet onOpenChange={setMobileMenuOpen} open={mobileMenuOpen}>
                  <SheetTrigger asChild>
                    <button
                      aria-label="Open navigation"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-150"
                      style={{ color: "oklch(0.58 0.012 70)" }}
                    >
                      <Menu className="size-[18px]" />
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    className="w-[18rem] border-l px-0"
                    side="right"
                    style={{
                      background: "oklch(0.095 0.008 65 / 98%)",
                      borderColor: "oklch(1 0 0 / 5%)",
                      backdropFilter: "blur(24px)",
                    }}
                  >
                    <SheetHeader className="px-5 pb-3">
                      <SheetTitle
                        className="font-display text-lg font-medium tracking-[-0.02em]"
                        style={{ color: "oklch(0.93 0.008 80)" }}
                      >
                        Supaviewer
                      </SheetTitle>
                      <SheetDescription
                        className="text-[0.78rem]"
                        style={{ color: "oklch(0.48 0.01 65)" }}
                      >
                        Browse the numbered catalog.
                      </SheetDescription>
                    </SheetHeader>

                    {/* ── Mobile nav section ── */}
                    <div className="px-2 pb-3 pt-1">
                      <p
                        className="sv-overline mb-2 px-4"
                        style={{ color: "oklch(0.72 0.14 55)" }}
                      >
                        Browse
                      </p>
                      <div className="grid gap-0.5">
                        {primaryNavItems.map((item) => {
                          const active = isActive(item.href);
                          return (
                            <Link
                              key={item.href}
                              className={mobileNavLinkClass(active)}
                              href={item.href}
                            >
                              <item.icon
                                className="h-4 w-4 shrink-0"
                                style={{
                                  color: active ? "oklch(0.72 0.14 55)" : "oklch(0.48 0.01 65)",
                                }}
                              />
                              <span>{item.label}</span>
                              {active && (
                                <span
                                  className="ml-auto h-1.5 w-1.5 rounded-full"
                                  style={{ background: "oklch(0.72 0.14 55)" }}
                                />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    <div className="px-2 pb-3">
                      <p
                        className="sv-overline mb-2 px-4"
                        style={{ color: "oklch(0.72 0.14 55)" }}
                      >
                        Account
                      </p>
                      <div className="grid gap-0.5">
                        {accountLinks.map((item) => {
                          const active = isActive(item.href);
                          return (
                            <Link
                              key={item.href}
                              className={mobileNavLinkClass(active)}
                              href={item.href}
                            >
                              <item.icon
                                className="h-4 w-4 shrink-0"
                                style={{
                                  color: active ? "oklch(0.72 0.14 55)" : "oklch(0.48 0.01 65)",
                                }}
                              />
                              <span>{item.label}</span>
                              {active && (
                                <span
                                  className="ml-auto h-1.5 w-1.5 rounded-full"
                                  style={{ background: "oklch(0.72 0.14 55)" }}
                                />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* ── Mobile footer ── */}
                    <div
                      className="mt-auto border-t px-5 py-4"
                      style={{ borderColor: "oklch(1 0 0 / 5%)" }}
                    >
                      {profile ? (
                        <div className="grid gap-3">
                          <div
                            className="rounded-lg px-4 py-3"
                            style={{
                              background: "oklch(0.72 0.14 55 / 8%)",
                              border: "1px solid oklch(0.72 0.14 55 / 12%)",
                            }}
                          >
                            <div
                              className="text-[0.86rem] font-medium"
                              style={{ color: "oklch(0.72 0.14 55)" }}
                            >
                              {profile.displayName}
                            </div>
                            <div className="sv-overline mt-1" style={{ color: "oklch(0.48 0.01 65)" }}>
                              {profile.role}
                            </div>
                          </div>
                          <form action={signOut}>
                            <button
                              className="flex h-11 w-full items-center justify-center rounded-lg text-[0.84rem] font-medium transition-colors"
                              style={{
                                color: "oklch(0.58 0.012 70)",
                                border: "1px solid oklch(1 0 0 / 8%)",
                              }}
                              type="submit"
                            >
                              Sign out
                            </button>
                          </form>
                        </div>
                      ) : (
                        <Link
                          className="flex h-11 w-full items-center justify-center rounded-lg text-[0.84rem] font-semibold transition-all duration-150 hover:opacity-90"
                          href="/login"
                          style={{
                            background: "oklch(0.72 0.14 55)",
                            color: "oklch(0.095 0.008 65)",
                          }}
                        >
                          Sign in
                        </Link>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}

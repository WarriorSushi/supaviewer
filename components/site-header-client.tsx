"use client";

import * as React from "react";
import { LayoutGroup, motion } from "framer-motion";
import Image from "next/image";
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

type HeaderProfile = {
  displayName: string;
  role: "viewer" | "admin";
} | null;

type SiteHeaderClientProps = {
  profile: HeaderProfile;
};

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

function navLinkClassName(active: boolean, condensed: boolean) {
  return cn(
    "inline-flex items-center rounded-xl text-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
    condensed ? "h-10 w-10 justify-center px-0" : "gap-2 px-3 py-2",
    active
      ? "bg-foreground/8 text-foreground"
      : "text-muted-foreground hover:bg-foreground/6 hover:text-foreground",
  );
}

const desktopLayoutTransition = {
  type: "spring" as const,
  stiffness: 380,
  damping: 34,
  mass: 0.85,
};

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

  React.useEffect(() => {
    if (desktopSearchOpen) {
      desktopSearchRef.current?.focus();
    }
  }, [desktopSearchOpen]);

  React.useEffect(() => {
    if (mobileSearchOpen) {
      mobileSearchRef.current?.focus();
    }
  }, [mobileSearchOpen]);

  React.useEffect(() => {
    setDesktopSearchOpen(false);
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

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

  React.useEffect(() => {
    function updateViewportState() {
      setIsMobileViewport(window.innerWidth < 768);
    }

    updateViewportState();
    window.addEventListener("resize", updateViewportState);
    return () => window.removeEventListener("resize", updateViewportState);
  }, []);

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

  return (
    <motion.header
      animate={{
        y: isMobileViewport && !mobileHeaderVisible ? -88 : 0,
      }}
      className="sticky top-0 z-40 mx-auto w-full max-w-[110rem] px-4 pt-4 sm:px-6 lg:px-10"
      initial={false}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="rounded-2xl border border-border/80 bg-background/80 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.10)] backdrop-blur-2xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:px-5">
        <div className="flex items-center justify-between gap-4">
          <Link
            className={cn(
              "flex min-w-0 flex-1 items-center gap-3 transition-all duration-200 lg:flex-none",
              mobileSearchOpen && "max-w-10 overflow-hidden",
            )}
            href="/"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-foreground/[0.04] p-1">
              <Image
                alt="Supaviewer logo"
                className="h-full w-full object-contain"
                height={40}
                priority
                src="/brand/supaviewer-logo.webp"
                width={40}
              />
            </div>
            <div
              className={cn(
                "min-w-0 max-w-[10.5rem] transition-all duration-200 sm:max-w-[13rem] lg:max-w-none",
                mobileSearchOpen && "max-w-0 overflow-hidden opacity-0",
              )}
            >
              <p className="truncate text-[0.64rem] uppercase tracking-[0.3em] text-muted-foreground max-[430px]:hidden">supaviewer.com</p>
              <p className="truncate text-[0.82rem] font-medium tracking-[0.01em] text-foreground sm:text-sm">AI cinema, cataloged.</p>
            </div>
          </Link>

          <LayoutGroup>
            <div className="hidden min-w-0 flex-1 items-center justify-end gap-3 lg:flex">
              <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
                <motion.div
                  animate={{
                    opacity: desktopSearchOpen ? 0 : 1,
                    width: desktopSearchOpen ? 0 : "auto",
                  }}
                  className="min-w-0 overflow-hidden"
                  initial={false}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.nav
                    layout
                    transition={desktopLayoutTransition}
                    className="flex min-w-0 items-center justify-end gap-1"
                  >
                    {desktopNavItems.map((item) => {
                      const active =
                        item.href === "/"
                          ? pathname === item.href
                          : pathname === item.href || pathname.startsWith(`${item.href}/`);

                      return (
                        <motion.div key={item.href} layout transition={desktopLayoutTransition}>
                          <Link
                            className={navLinkClassName(active, false)}
                            href={item.href}
                          >
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span className="ml-2 whitespace-nowrap">{item.label}</span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.nav>
                </motion.div>

                <motion.form
                  action="/films"
                  animate={{
                    width: desktopSearchOpen ? "100%" : 52,
                    flexGrow: desktopSearchOpen ? 1 : 0,
                  }}
                  className="flex min-w-[3.25rem] shrink-0 items-center overflow-hidden rounded-xl border border-border/80 bg-background/88 px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  initial={false}
                  transition={desktopLayoutTransition}
                >
                  <Button
                    aria-label={desktopSearchOpen ? "Collapse search" : "Expand search"}
                    className="h-8 w-8 shrink-0 rounded-lg"
                    onClick={() => setDesktopSearchOpen((value) => !value)}
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    {desktopSearchOpen ? <X className="size-4" /> : <Search className="size-4" />}
                  </Button>
                  <motion.div
                    animate={{ opacity: desktopSearchOpen ? 1 : 0, x: desktopSearchOpen ? 0 : 10 }}
                    className={cn("relative min-w-0 flex-1", !desktopSearchOpen && "pointer-events-none")}
                    initial={false}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Search className="pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      ref={desktopSearchRef}
                      className="h-8 min-w-0 border-0 bg-transparent pl-6 pr-0 text-sm shadow-none focus-visible:ring-0"
                      name="q"
                      placeholder="Title, creator, or #serial"
                      type="search"
                    />
                  </motion.div>
                  <motion.span
                    animate={{ opacity: desktopSearchOpen ? 0 : 1, x: desktopSearchOpen ? -6 : 0 }}
                    className="shrink-0 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground"
                    initial={false}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  >
                    /
                  </motion.span>
                </motion.form>
              </div>

              <motion.div
                layout
                transition={desktopLayoutTransition}
                className="flex shrink-0 items-center gap-3"
              >
                <motion.div layout transition={desktopLayoutTransition} className="shrink-0">
                  <ThemeToggle />
                </motion.div>
                {profile ? (
                  <>
                    <motion.div
                      animate={{ opacity: desktopSearchOpen ? 0 : 1, width: desktopSearchOpen ? 0 : 132 }}
                      className="overflow-hidden"
                      initial={false}
                      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="rounded-xl border border-border/70 bg-muted/40 px-4 py-2 text-sm text-foreground/80">
                        {profile.displayName}
                      </div>
                    </motion.div>
                    <motion.form
                      action={signOut}
                      animate={{ opacity: desktopSearchOpen ? 0 : 1, width: desktopSearchOpen ? 0 : 108 }}
                      className="overflow-hidden"
                      initial={false}
                      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Button className="sv-btn w-[108px]" type="submit" variant="outline">
                        Sign out
                      </Button>
                    </motion.form>
                  </>
                ) : (
                  <motion.div
                    animate={{ opacity: desktopSearchOpen ? 0 : 1, width: desktopSearchOpen ? 0 : 96 }}
                    className="overflow-hidden"
                    initial={false}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Button asChild className="sv-btn sv-btn-primary w-24">
                      <Link href="/login">Sign in</Link>
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </LayoutGroup>

          <div
            className={cn(
              "flex items-center gap-2 lg:hidden",
              mobileSearchOpen ? "min-w-0 flex-1" : "shrink-0",
            )}
          >
            {mobileSearchOpen ? (
              <form action="/films" className="flex min-w-0 flex-1 items-center gap-2">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    ref={mobileSearchRef}
                    className="h-10 rounded-xl border-input/90 bg-background/70 pl-9 pr-3 shadow-none dark:bg-input/20"
                    name="q"
                    placeholder="Title, creator, or #serial"
                    type="search"
                  />
                </div>
                <Button
                  aria-label="Close search"
                  className="rounded-xl"
                  onClick={() => setMobileSearchOpen(false)}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <X className="size-4" />
                </Button>
              </form>
            ) : (
              <>
                <Button
                  aria-label="Open search"
                  className="rounded-xl"
                  onClick={() => setMobileSearchOpen(true)}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <Search className="size-4" />
                </Button>
                <CompactThemeToggle />
                <Sheet onOpenChange={setMobileMenuOpen} open={mobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button aria-label="Open navigation" size="icon" variant="outline">
                      <Menu className="size-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[20rem] border-border bg-background/98 px-0" side="right">
                    <SheetHeader className="px-5 pb-2">
                      <SheetTitle>Supaviewer</SheetTitle>
                      <SheetDescription>Browse the numbered catalog and your account surfaces.</SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-1 px-3 pb-4">
                      {[...primaryNavItems, ...accountLinks].map((item) => {
                        const active =
                          item.href === "/"
                            ? pathname === item.href
                            : pathname === item.href || pathname.startsWith(`${item.href}/`);

                        return (
                          <Link key={item.href} className={navLinkClassName(active, false)} href={item.href}>
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                    <div className="mt-auto border-t border-border/70 px-5 py-4">
                      {profile ? (
                        <div className="grid gap-3">
                          <div className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-sm">
                            <div className="font-medium text-foreground">{profile.displayName}</div>
                            <div className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                              {profile.role}
                            </div>
                          </div>
                          <form action={signOut}>
                            <Button className="sv-btn w-full" type="submit" variant="outline">
                              Sign out
                            </Button>
                          </form>
                        </div>
                      ) : (
                        <Button asChild className="sv-btn sv-btn-primary w-full">
                          <Link href="/login">Sign in</Link>
                        </Button>
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

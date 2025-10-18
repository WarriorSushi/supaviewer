"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, Search } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowMobileSearch(false);
      setSearchQuery("");
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          {!showMobileSearch && (
            <Link
              href="/"
              className="text-xl md:text-2xl font-bold text-gradient-cinema hover:opacity-80 transition-opacity flex-shrink-0"
            >
              SupaViewer
            </Link>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/discover"
              className="text-muted-foreground hover:text-foreground font-semibold transition-colors whitespace-nowrap"
            >
              Discover
            </Link>
            <Link
              href="/submit"
              className="text-muted-foreground hover:text-foreground font-semibold transition-colors whitespace-nowrap"
            >
              Submit
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground font-semibold transition-colors whitespace-nowrap"
            >
              About
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-10 pr-3 bg-background/90 border-2 border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-background hover:border-border transition-all text-sm shadow-inner"
              />
            </div>
          </form>

          {/* Mobile Search Expanded */}
          {showMobileSearch && (
            <form onSubmit={handleSearch} className="flex-1 md:hidden">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full h-9 pl-10 pr-3 bg-background/90 border-2 border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-background transition-all text-sm shadow-inner"
                />
              </div>
            </form>
          )}

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            {!showMobileSearch ? (
              <>
                <button
                  onClick={() => setShowMobileSearch(true)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setShowMobileSearch(false);
                  setSearchQuery("");
                }}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border">
            <Link
              href="/discover"
              className="block text-muted-foreground hover:text-foreground font-semibold transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Discover
            </Link>
            <Link
              href="/submit"
              className="block text-muted-foreground hover:text-foreground font-semibold transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Submit
            </Link>
            <Link
              href="/about"
              className="block text-muted-foreground hover:text-foreground font-semibold transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <div className="pt-4 space-y-3">
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

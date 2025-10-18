"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, Upload } from "lucide-react";
import { useState } from "react";
import { VideoFilters } from "@/components/filters/video-filters";

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
    <nav className="sticky top-0 z-50 glass">
      <div className="container-custom">
        <div className="flex items-center justify-between h-12 md:h-16 gap-4 md:gap-6">
          {/* Logo - Smaller on desktop to make room for search */}
          {!showMobileSearch && (
            <Link
              href="/"
              className="text-xl font-bold text-gradient-cinema hover:opacity-80 transition-opacity flex-shrink-0"
            >
              SupaViewer
            </Link>
          )}

          {/* Desktop Search Bar - ENLARGED YouTube-style */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
            <div className="relative w-full flex">
              <input
                type="text"
                placeholder="Search AI videos, creators, AI tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-10 pl-4 pr-4 bg-background border-2 border-input rounded-l-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary hover:border-border transition-all text-sm"
              />
              <button
                type="submit"
                className="px-6 h-10 bg-card hover:bg-card/80 border-2 border-l-0 border-input rounded-r-full transition-colors flex items-center justify-center"
              >
                <Search className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </form>

          {/* Mobile Search Expanded */}
          {showMobileSearch && (
            <form onSubmit={handleSearch} className="flex-1 md:hidden">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search videos, creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full h-9 pl-10 pr-3 bg-background/90 border-2 border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-background transition-all text-sm shadow-inner"
                />
              </div>
            </form>
          )}

          {/* Right Side Actions - Desktop */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {/* Upload Button - YouTube-style prominent */}
            <Button size="sm" variant="default" className="gap-2" asChild>
              <Link href="/submit">
                <Upload className="w-4 h-4" />
                <span className="hidden lg:inline">Upload</span>
              </Link>
            </Button>

            {/* Single Sign In Button */}
            <Button size="sm" variant="outline" asChild>
              <Link href="/auth">Sign In</Link>
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
          <div className="md:hidden py-4 space-y-4 border-t border-border max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Sign In Button - Above Filters */}
            <div className="px-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
              </Button>
            </div>

            {/* Filters */}
            <div className="pb-4 border-t border-border pt-4">
              <VideoFilters />
            </div>

            <div className="border-t border-border pt-4">
              <Link
                href="/about"
                className="block text-muted-foreground hover:text-foreground font-semibold transition-colors px-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

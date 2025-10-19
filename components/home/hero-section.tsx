import { Search } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative py-12 md:py-16 overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-crimson/5 via-transparent to-transparent pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Main heading */}
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <span className="text-crimson">Discover </span>
              <span className="text-gradient-cinema">AI Cinema</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Curated AI-generated videos from the world&apos;s best creators
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto pt-2">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <input
                type="text"
                placeholder="Search videos, creators, AI tools..."
                className="w-full h-12 pl-12 pr-6 bg-card border-2 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-crimson transition-all duration-200 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

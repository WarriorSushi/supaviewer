'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'

// Filter data
const AI_TOOLS = ['All', 'Sora', 'Runway', 'Kling', 'Luma', 'Pika', 'Midjourney', 'Stable Diffusion']
const GENRES = ['Sci-Fi', 'Drama', 'Comedy', 'Horror', 'Documentary', 'Abstract', 'Music Video', 'Tutorial']
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Most Viewed', value: 'views' },
  { label: 'Trending', value: 'trending' },
]

export function FilterChips() {
  // State
  const [selectedTool, setSelectedTool] = useState('All')
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [isFeatured, setIsFeatured] = useState(false)
  const [sortBy, setSortBy] = useState('newest')

  // Scroll state
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Check scroll position
  const checkScroll = () => {
    if (!scrollRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
  }

  // Handle scroll button clicks
  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return

    const scrollAmount = 400 // Scroll 400px at a time
    const newPosition = direction === 'left'
      ? scrollRef.current.scrollLeft - scrollAmount
      : scrollRef.current.scrollLeft + scrollAmount

    scrollRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    })
  }

  // Check scroll on mount and resize
  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [])

  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="relative">

        {/* Left scroll button */}
        {canScrollLeft && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-0 bottom-0 z-20 w-20 bg-gradient-to-r from-background/95 via-background/80 to-transparent flex items-center justify-start pl-2 hover:from-background transition-colors"
            aria-label="Scroll left"
          >
            <div className="w-9 h-9 rounded-full bg-card hover:bg-accent border border-border shadow-md flex items-center justify-center transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </div>
          </button>
        )}

        {/* Chips container */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="overflow-x-auto overflow-y-hidden scrollbar-hide"
          style={{
            paddingLeft: canScrollLeft ? '5rem' : undefined,
            paddingRight: canScrollRight ? '5rem' : undefined,
          }}
        >
          <div className="flex items-center gap-2 px-6 md:px-12 lg:px-16 xl:px-20 py-3 min-w-max">

            {/* Featured toggle chip */}
            <button
              onClick={() => setIsFeatured(!isFeatured)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isFeatured
                  ? 'bg-amber text-background shadow-md'
                  : 'bg-card hover:bg-accent text-foreground border border-border'
                }
              `}
            >
              ✨ Featured
            </button>

            {/* Vertical divider */}
            <div className="h-6 w-px bg-border flex-shrink-0 mx-1" />

            {/* AI Tool chips */}
            {AI_TOOLS.map((tool) => (
              <button
                key={tool}
                onClick={() => setSelectedTool(tool)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${selectedTool === tool
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-card hover:bg-accent text-foreground border border-border'
                  }
                `}
              >
                {tool}
              </button>
            ))}

            {/* Vertical divider */}
            <div className="h-6 w-px bg-border flex-shrink-0 mx-1" />

            {/* Genre chips */}
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${selectedGenre === genre
                    ? 'bg-accent text-accent-foreground shadow-md'
                    : 'bg-card hover:bg-accent/50 text-foreground border border-border'
                  }
                `}
              >
                {genre}
              </button>
            ))}

            {/* Vertical divider */}
            <div className="h-6 w-px bg-border flex-shrink-0 mx-1" />

            {/* Sort dropdown */}
            <div className="relative flex-shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="
                  appearance-none pl-4 pr-10 py-2 rounded-lg text-sm font-medium
                  bg-card hover:bg-accent text-foreground border border-border
                  cursor-pointer transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-primary/50
                "
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    Sort: {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

          </div>
        </div>

        {/* Right scroll button */}
        {canScrollRight && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-0 bottom-0 z-20 w-20 bg-gradient-to-l from-background/95 via-background/80 to-transparent flex items-center justify-end pr-2 hover:from-background transition-colors"
            aria-label="Scroll right"
          >
            <div className="w-9 h-9 rounded-full bg-card hover:bg-accent border border-border shadow-md flex items-center justify-center transition-colors">
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        )}

      </div>
    </div>
  )
}

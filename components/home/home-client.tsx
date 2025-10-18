'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { VideoFilters } from '@/components/filters/video-filters'
import { VideoGridWithTabs } from '@/components/home/video-grid-with-tabs'
import type { VideoWithCreator } from '@/types'

interface HomeClientProps {
  initialVideos: VideoWithCreator[]
}

export interface FilterState {
  selectedTools: string[]
  selectedGenres: string[]
  sortBy: string
}

export function HomeClient({ initialVideos }: HomeClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    selectedTools: [],
    selectedGenres: [],
    sortBy: 'newest',
  })

  // Filter and sort videos based on search and filters
  const filteredAndSortedVideos = useMemo(() => {
    let result = [...initialVideos]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (video) =>
          video.title.toLowerCase().includes(query) ||
          video.description?.toLowerCase().includes(query) ||
          video.creator.name.toLowerCase().includes(query) ||
          video.ai_tool.toLowerCase().includes(query) ||
          video.genre?.toLowerCase().includes(query)
      )
    }

    // Apply AI tool filter
    if (filters.selectedTools.length > 0) {
      result = result.filter((video) =>
        filters.selectedTools.includes(video.ai_tool)
      )
    }

    // Apply genre filter
    if (filters.selectedGenres.length > 0) {
      result = result.filter((video) =>
        video.genre ? filters.selectedGenres.includes(video.genre) : false
      )
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        break
      case 'oldest':
        result.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        break
      case 'rating':
        result.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
        break
      case 'views':
        result.sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        break
    }

    return result
  }, [initialVideos, searchQuery, filters])

  return (
    <div className="min-h-screen">
      {/* Search Bar - Mobile & Desktop */}
      <div className="py-4 px-4 md:px-0">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search videos, creators, AI tools, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-muted/50 border-border focus-visible:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Main content with sidebar - YouTube-style spacing */}
      <div className="flex gap-6 py-6">
        {/* Left Sidebar - Filters (Desktop only) */}
        <aside className="hidden lg:block w-60 flex-shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin-left pl-2">
          <VideoFilters filters={filters} onFiltersChange={setFilters} />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <VideoGridWithTabs
            videos={filteredAndSortedVideos}
            searchQuery={searchQuery}
            activeFilters={
              filters.selectedTools.length +
              filters.selectedGenres.length +
              (searchQuery.trim() ? 1 : 0)
            }
          />
        </main>
      </div>
    </div>
  )
}

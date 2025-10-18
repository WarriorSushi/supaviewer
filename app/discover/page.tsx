'use client'

import { useEffect, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { VideoGrid } from '@/components/video/video-grid'
import { VideoFilters } from '@/components/browse/video-filters'
import { Button } from '@/components/ui/button'
import type { VideoWithCreator } from '@/types'
import { SORT_OPTIONS, type SortOption } from '@/lib/constants'

export default function BrowsePage() {
  const [videos, setVideos] = useState<VideoWithCreator[]>([])
  const [filteredVideos, setFilteredVideos] = useState<VideoWithCreator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const videosPerPage = 20

  // Fetch videos on mount
  useEffect(() => {
    async function fetchVideos() {
      setIsLoading(true)
      const supabase = createClient()

      const { data } = await supabase
        .from('videos')
        .select(`
          *,
          creator:creators(
            id,
            name,
            slug,
            avatar_url
          )
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (data) {
        setVideos(data as VideoWithCreator[])
        setFilteredVideos(data as VideoWithCreator[])
      }
      setIsLoading(false)
    }

    fetchVideos()
  }, [])

  // Apply filters whenever they change
  useEffect(() => {
    let filtered = [...videos]

    // AI Tool filter
    if (selectedTools.length > 0) {
      filtered = filtered.filter((video) =>
        selectedTools.includes(video.ai_tool)
      )
    }

    // Genre filter
    if (selectedGenres.length > 0) {
      filtered = filtered.filter(
        (video) => video.genre && selectedGenres.includes(video.genre)
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'highest_rated':
          return (b.avg_rating || 0) - (a.avg_rating || 0)
        case 'most_viewed':
          return b.view_count - a.view_count
        case 'most_rated':
          return b.total_ratings - a.total_ratings
        default:
          return 0
      }
    })

    setFilteredVideos(filtered)
    setCurrentPage(1)
  }, [videos, selectedTools, selectedGenres, sortBy])

  const handleClearFilters = () => {
    setSelectedTools([])
    setSelectedGenres([])
  }

  // Pagination
  const totalPages = Math.ceil(filteredVideos.length / videosPerPage)
  const startIndex = (currentPage - 1) * videosPerPage
  const endIndex = startIndex + videosPerPage
  const currentVideos = filteredVideos.slice(startIndex, endIndex)

  const hasActiveFilters = selectedTools.length > 0 || selectedGenres.length > 0

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="container-custom py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-20 self-start max-h-[calc(100vh-5rem)] overflow-y-auto pr-2 scrollbar-thin">
            <VideoFilters
              selectedTools={selectedTools}
              selectedGenres={selectedGenres}
              sortBy={sortBy}
              onToolsChange={setSelectedTools}
              onGenresChange={setSelectedGenres}
              onSortChange={setSortBy}
              onClearAll={handleClearFilters}
            />
          </aside>

          {/* Mobile: Floating Filter Button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-crimson hover:bg-crimson/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
            aria-label="Open filters"
          >
            <SlidersHorizontal className="w-6 h-6 group-hover:scale-110 transition-transform" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber text-background text-xs font-bold rounded-full flex items-center justify-center">
                {selectedTools.length + selectedGenres.length}
              </span>
            )}
          </button>

          {/* Mobile Filters Overlay */}
          {showMobileFilters && (
            <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 lg:hidden animate-fade-in">
              <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-card border-l border-border overflow-y-auto shadow-2xl animate-slide-in-right">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Filters</h2>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <VideoFilters
                    selectedTools={selectedTools}
                    selectedGenres={selectedGenres}
                    sortBy={sortBy}
                    onToolsChange={setSelectedTools}
                    onGenresChange={setSelectedGenres}
                    onSortChange={setSortBy}
                    onClearAll={handleClearFilters}
                  />
                  <div className="mt-6 sticky bottom-0 bg-card pt-4 border-t border-border">
                    <Button
                      onClick={() => setShowMobileFilters(false)}
                      className="w-full bg-crimson hover:bg-crimson/90 h-12"
                    >
                      View {filteredVideos.length} {filteredVideos.length === 1 ? 'Video' : 'Videos'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Videos Grid */}
          <div className="flex-1 space-y-6">
            <VideoGrid
              videos={currentVideos}
              isLoading={isLoading}
              emptyMessage={
                hasActiveFilters
                  ? 'No videos match your filters'
                  : 'No videos found'
              }
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="disabled:opacity-50"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={
                          currentPage === pageNum
                            ? 'bg-crimson hover:bg-crimson/90'
                            : ''
                        }
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

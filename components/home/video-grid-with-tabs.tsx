'use client'

import { useState, useMemo } from 'react'
import { VideoTabs } from './video-tabs'
import { VideoCard } from '../video/video-card'
import type { VideoWithCreator } from '@/types'

type Tab = 'featured' | 'trending' | 'latest'

interface VideoGridWithTabsProps {
  videos: VideoWithCreator[]
  searchQuery?: string
  activeFilters?: number
}

export function VideoGridWithTabs({
  videos,
  searchQuery = '',
  activeFilters = 0,
}: VideoGridWithTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('featured')

  const filteredVideos = useMemo(() => {
    switch (activeTab) {
      case 'featured':
        return videos.filter(v => v.featured)
      case 'trending':
        // Sort by view count (descending)
        return [...videos].sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      case 'latest':
        // Already sorted by created_at desc from the query
        return videos
      default:
        return videos
    }
  }, [videos, activeTab])

  return (
    <>
      {/* Search/Filter Results Header */}
      {(searchQuery || activeFilters > 0) && (
        <div className="mb-6 px-4 md:px-0">
          <p className="text-sm text-muted-foreground">
            {filteredVideos.length === 0 ? (
              <>No videos found matching your criteria</>
            ) : (
              <>
                Found {filteredVideos.length} video
                {filteredVideos.length !== 1 ? 's' : ''}
                {searchQuery && (
                  <> matching &ldquo;<span className="font-medium">{searchQuery}</span>&rdquo;</>
                )}
              </>
            )}
          </p>
        </div>
      )}

      {/* Tabs */}
      <VideoTabs onTabChange={setActiveTab} />

      {/* Video Grid - 3 columns with YouTube-style gap */}
      <div>
        {filteredVideos && filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-12">
            {filteredVideos.map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                priority={index < 6}
                featured={video.featured}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              {searchQuery || activeFilters > 0
                ? 'No videos found matching your criteria.'
                : 'No videos in this category yet.'}
            </p>
          </div>
        )}
      </div>
    </>
  )
}

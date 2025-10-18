import { VideoCard } from './video-card'
import type { VideoWithCreator } from '@/types'

interface VideoGridProps {
  videos: VideoWithCreator[]
  emptyMessage?: string
  isLoading?: boolean
}

export function VideoGrid({
  videos,
  emptyMessage = "No videos found",
  isLoading = false
}: VideoGridProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Empty state
  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-card border-2 border-border flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M7 3v18" />
              <path d="M3 7.5h4" />
              <path d="M3 12h18" />
              <path d="M3 16.5h4" />
              <path d="M17 3v18" />
              <path d="M17 7.5h4" />
              <path d="M17 16.5h4" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              {emptyMessage}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Try adjusting your filters or check back later for new content.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Video grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video, index) => (
        <VideoCard
          key={video.id}
          video={video}
          priority={index < 4} // Prioritize first 4 images for LCP
        />
      ))}
    </div>
  )
}

// Loading skeleton component
function VideoCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-card border border-border animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="aspect-video bg-background" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-background rounded w-full" />
          <div className="h-4 bg-background rounded w-3/4" />
        </div>

        {/* Creator skeleton */}
        <div className="h-3 bg-background rounded w-1/2" />

        {/* Metadata row skeleton */}
        <div className="flex items-center justify-between gap-2">
          <div className="h-6 bg-background rounded w-16" />
          <div className="h-4 bg-background rounded w-12" />
        </div>

        {/* Genre badge skeleton */}
        <div className="h-6 bg-background rounded w-20" />
      </div>
    </div>
  )
}

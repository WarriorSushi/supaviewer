'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, Film } from 'lucide-react'
import type { VideoWithCreator } from '@/types'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface VideoCardProps {
  video: VideoWithCreator
  priority?: boolean
  featured?: boolean
}

export function VideoCard({ video, priority = false, featured = false }: VideoCardProps) {
  const displayRating = video.avg_rating ? video.avg_rating.toFixed(1) : 'N/A'
  const ratingCount = video.total_ratings
  const [imageError, setImageError] = useState(false)

  return (
    <Link href={`/video/${video.id}`} className="group block">
      {/* YouTube-inspired card: Neutral container, bright content */}
      <div className="bg-card rounded-none md:rounded-xl overflow-hidden transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_8px_20px_hsl(var(--border)/0.15)]">

        {/* Thumbnail - 80% of card visual weight */}
        <div className="relative aspect-video overflow-hidden bg-background rounded-t-none md:rounded-t-xl">
          {imageError ? (
            // Fallback placeholder
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-crimson/20 to-amber/20">
              <Film className="w-16 h-16 text-muted-foreground" />
            </div>
          ) : (
            <Image
              src={video.thumbnail_url}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-250 group-hover:scale-[1.03]"
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              onError={() => setImageError(true)}
            />
          )}

          {/* Featured badge - top right */}
          {video.featured && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-amber text-background text-xs font-semibold rounded">
              Featured
            </div>
          )}

          {/* Duration overlay - YouTube style bottom-right */}
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[0.75rem] font-medium text-white">
            {formatDuration(video.duration_seconds)}
          </div>

          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250" />
        </div>

        {/* Text Area - 20% of card, maximum 3 visual hierarchies */}
        <div className="p-3 space-y-1">

          {/* PRIMARY: Video Title - YouTube spec: 14px, white, weight 500 */}
          <h3 className="text-[0.875rem] font-medium leading-5 line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200">
            {video.title}
          </h3>

          {/* SECONDARY: Creator Name - YouTube spec: 12px, rgb(96,96,96) equivalent */}
          <div className="text-[0.75rem] font-normal text-[#606060] dark:text-[#aaa]">
            {video.creator.name}
          </div>

          {/* TERTIARY: Meta Info - YouTube spec: 12px, same gray as channel */}
          <div className="flex items-center gap-1.5 text-[0.75rem] font-normal text-[#606060] dark:text-[#aaa]">
            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber text-amber" />
              <span>{displayRating}</span>
              {ratingCount > 0 && (
                <span>({ratingCount})</span>
              )}
            </div>

            {/* Genre if present */}
            {video.genre && (
              <>
                <span>•</span>
                <span>{video.genre}</span>
              </>
            )}

            {/* Dot separator */}
            <span>•</span>

            {/* AI Tool */}
            <span>{video.ai_tool}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Helper function to format duration
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes === 0) {
    return `${seconds}s`
  }

  if (remainingSeconds === 0) {
    return `${minutes}m`
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

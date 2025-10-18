import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { VideoCard } from '@/components/video/video-card'
import type { VideoWithCreator } from '@/types'

interface FeaturedVideosSectionProps {
  videos: VideoWithCreator[]
}

export function FeaturedVideosSection({ videos }: FeaturedVideosSectionProps) {
  if (videos.length === 0) {
    return null
  }

  return (
    <section className="py-16">
      <div className="container-custom">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-h1 text-gradient-crimson mb-2">
              Featured Videos
            </h2>
            <p className="text-muted-foreground">
              Hand-picked gems from the AI filmmaking world
            </p>
          </div>
        </div>

        {/* Video grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {videos.map((video, index) => (
            <VideoCard
              key={video.id}
              video={video}
              priority={index < 4}
              featured
            />
          ))}
        </div>
      </div>
    </section>
  )
}

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VideoCard } from '@/components/video/video-card'
import type { VideoWithCreator } from '@/types'

interface LatestVideosSectionProps {
  videos: VideoWithCreator[]
}

export function LatestVideosSection({ videos }: LatestVideosSectionProps) {
  if (videos.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-card/30">
      <div className="container-custom">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-h1 text-gradient-amber mb-2">
              Latest Videos
            </h2>
            <p className="text-muted-foreground">
              Fresh AI-generated content from our community
            </p>
          </div>

          {/* View all button */}
          <Button
            asChild
            variant="ghost"
            className="hidden md:flex items-center gap-2 text-amber hover:text-amber/90"
          >
            <Link href="/discover">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Video grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>

        {/* Mobile view all button */}
        <div className="mt-8 text-center md:hidden">
          <Button
            asChild
            variant="ghost"
            className="text-amber hover:text-amber/90"
          >
            <Link href="/discover" className="flex items-center gap-2 mx-auto">
              View All Videos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

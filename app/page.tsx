import { createClient } from '@/lib/supabase/server'
import { HeroSection } from '@/components/home/hero-section'
import { CategoryTabs } from '@/components/home/category-tabs'
import { VideoCard } from '@/components/video/video-card'
import type { VideoWithCreator } from '@/types'

export default async function Home() {
  // Fetch all approved videos (we'll show all for now, filtering can be added later)
  const supabase = await createClient()

  const { data: videos } = await supabase
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
    .limit(20)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Category Tabs */}
      <CategoryTabs />

      {/* Videos Grid */}
      <section className="py-8">
        <div className="container-custom">
          {videos && videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video, index) => (
                <VideoCard
                  key={video.id}
                  video={video as VideoWithCreator}
                  priority={index < 4}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">
                No videos yet. Be the first to submit!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

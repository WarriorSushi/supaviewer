import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { VideoCard } from '@/components/video/video-card'
import { ExternalLink, Twitter, Star, Film } from 'lucide-react'
import Link from 'next/link'
import type { VideoWithCreator } from '@/types'

interface CreatorPageProps {
  params: Promise<{ slug: string }>
}

export default async function CreatorPage({ params }: CreatorPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch creator by slug
  const { data: creator, error: creatorError } = await supabase
    .from('creators')
    .select('*')
    .eq('slug', slug)
    .single()

  // Handle 404 if creator not found
  if (creatorError || !creator) {
    notFound()
  }

  // Fetch all approved videos by this creator
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
    .eq('creator_id', creator.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  const creatorVideos = (videos as VideoWithCreator[]) || []

  // Calculate stats
  const videoCount = creatorVideos.length
  const avgRating = creatorVideos.length > 0
    ? creatorVideos.reduce((sum, v) => sum + (v.avg_rating || 0), 0) / creatorVideos.length
    : null

  return (
    <div className="min-h-screen">
      <div className="container-custom py-12">

        {/* Creator Header */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">

            {/* Avatar */}
            <Avatar className="w-32 h-32 ring-4 ring-border">
              <AvatarImage src={creator.avatar_url || undefined} alt={creator.name} />
              <AvatarFallback className="bg-gradient-to-br from-crimson to-amber text-white text-4xl font-bold">
                {creator.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Creator Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-3">
                {creator.name}
              </h1>

              {creator.bio && (
                <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                  {creator.bio}
                </p>
              )}

              {/* Links */}
              <div className="flex flex-wrap gap-4 mb-6">
                {creator.website && (
                  <Link
                    href={creator.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Website
                  </Link>
                )}

                {creator.twitter_handle && (
                  <Link
                    href={`https://twitter.com/${creator.twitter_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                    @{creator.twitter_handle.replace('@', '')}
                  </Link>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Film className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">{videoCount}</div>
                    <div className="text-xs text-muted-foreground">
                      {videoCount === 1 ? 'Video' : 'Videos'}
                    </div>
                  </div>
                </div>

                {avgRating !== null && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber fill-amber" />
                    <div>
                      <div className="text-2xl font-bold text-foreground">{avgRating.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">Avg Rating</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Videos Section */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            All Videos {videoCount > 0 && `(${videoCount})`}
          </h2>

          {creatorVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {creatorVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Film className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">
                No videos yet from {creator.name}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

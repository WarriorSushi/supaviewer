import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { VideoWithCreator } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { VideoCard } from '@/components/video/video-card'
import { VideoRatingDisplay, VideoRatingInteractive } from '@/components/video/video-rating'
import { Eye, Calendar, Play } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface VideoPageProps {
  params: Promise<{ id: string }>
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch video with creator info
  const { data: video, error } = await supabase
    .from('videos')
    .select(`
      *,
      creator:creators(
        id,
        name,
        slug,
        avatar_url,
        bio
      )
    `)
    .eq('id', id)
    .eq('status', 'approved')
    .single()

  // Handle 404 if video not found or not approved
  if (error || !video) {
    notFound()
  }

  const videoData = video as VideoWithCreator

  // Fetch related videos (same creator or same AI tool)
  const { data: relatedVideos } = await supabase
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
    .neq('id', id)
    .or(`creator_id.eq.${videoData.creator_id},ai_tool.eq.${videoData.ai_tool}`)
    .order('created_at', { ascending: false })
    .limit(6)

  const related = (relatedVideos as VideoWithCreator[]) || []

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Format rating to 1 decimal place
  const formattedRating = videoData.avg_rating
    ? videoData.avg_rating.toFixed(1)
    : 'No ratings yet'

  return (
    <div className="min-h-screen">
      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Video Player and Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Video Player and Primary Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* YouTube Embed - Responsive 16:9 */}
            <div className="relative w-full aspect-video bg-card rounded-xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${videoData.youtube_id}?rel=0`}
                title={videoData.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>

            {/* Video Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-3">
                {videoData.title}
              </h1>

              {/* Rating Display */}
              <VideoRatingDisplay
                avgRating={videoData.avg_rating}
                totalRatings={videoData.total_ratings}
              />
            </div>

            {/* Badges Row - AI Tool, Genre, Duration */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="bg-card border border-border text-sm px-3 py-1 text-foreground font-medium"
              >
                <Play className="w-3 h-3 mr-1.5" />
                {videoData.ai_tool}
              </Badge>

              {videoData.genre && (
                <Badge
                  variant="secondary"
                  className="bg-card border border-border text-sm px-3 py-1 text-[#606060] dark:text-[#aaa] font-normal"
                >
                  {videoData.genre}
                </Badge>
              )}

              <Badge
                variant="secondary"
                className="bg-card border border-border text-sm px-3 py-1 text-[#606060] dark:text-[#aaa] font-normal"
              >
                {formatDuration(videoData.duration_seconds)}
              </Badge>
            </div>

            {/* Stats Row - Views, Date */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#606060] dark:text-[#aaa] font-normal">
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>{videoData.view_count.toLocaleString()} views</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{formatDistanceToNow(new Date(videoData.created_at), { addSuffix: true })}</span>
              </div>
            </div>

            {/* Interactive Rating Section */}
            <VideoRatingInteractive videoId={videoData.id} />

            {/* Creator & Description on Mobile */}
            <div className="lg:hidden">
              {/* Creator Info Card */}
              <div className="rounded-xl p-6" style={{ backgroundColor: 'hsl(217, 24%, 12%)', border: '1px solid hsl(215, 20%, 18%)' }}>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Link href={`/creator/${videoData.creator.slug}`}>
                      <Avatar className="w-12 h-12 ring-2 ring-border hover:ring-primary transition-all">
                        <AvatarImage src={videoData.creator.avatar_url || undefined} alt={videoData.creator.name} />
                        <AvatarFallback className="bg-muted text-foreground font-semibold">
                          {videoData.creator.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    <div className="flex-1">
                      <Link
                        href={`/creator/${videoData.creator.slug}`}
                        className="text-sm font-medium text-[#606060] dark:text-[#aaa] hover:text-primary transition-colors"
                      >
                        {videoData.creator.name}
                      </Link>
                      {videoData.creator.bio && (
                        <p className="text-xs text-[#606060] dark:text-[#aaa] mt-1 opacity-70 leading-relaxed">
                          {videoData.creator.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description in same card */}
                  {videoData.description && (
                    <>
                      <div className="border-t border-border pt-4">
                        <h3 className="text-sm font-semibold text-foreground mb-3">Description</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {videoData.description}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Sidebar - Creator & Description (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            {/* Creator Info Card */}
            <div className="rounded-xl p-6 sticky top-24" style={{ backgroundColor: 'hsl(217, 24%, 12%)', border: '1px solid hsl(215, 20%, 18%)' }}>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Link href={`/creator/${videoData.creator.slug}`}>
                    <Avatar className="w-12 h-12 ring-2 ring-border hover:ring-primary transition-all">
                      <AvatarImage src={videoData.creator.avatar_url || undefined} alt={videoData.creator.name} />
                      <AvatarFallback className="bg-muted text-foreground font-semibold">
                        {videoData.creator.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="flex-1">
                    <Link
                      href={`/creator/${videoData.creator.slug}`}
                      className="text-sm font-medium text-[#606060] dark:text-[#aaa] hover:text-primary transition-colors"
                    >
                      {videoData.creator.name}
                    </Link>
                    {videoData.creator.bio && (
                      <p className="text-xs text-[#606060] dark:text-[#aaa] mt-1 opacity-70 leading-relaxed">
                        {videoData.creator.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description in sidebar */}
                {videoData.description && (
                  <>
                    <div className="border-t border-border pt-6 mt-2">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Description</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed line-clamp-6">
                        {videoData.description}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Related Videos Section */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Related Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {related.slice(0, 4).map((relatedVideo) => (
                <VideoCard key={relatedVideo.id} video={relatedVideo} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

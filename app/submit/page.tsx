'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { videoSubmissionSchema, extractYouTubeId, type VideoSubmission } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, CheckCircle2, AlertCircle, Youtube } from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'

export default function SubmitPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [youtubePreview, setYoutubePreview] = useState<string | null>(null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<VideoSubmission>({
    resolver: zodResolver(videoSubmissionSchema),
  })

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        // Pre-fill creator info for logged-in users
        setValue('creator_name', user.user_metadata?.full_name || user.email?.split('@')[0] || '')
        setValue('creator_email', user.email || '')
      }
    })
  }, [supabase.auth, setValue])

  // Watch YouTube URL for preview
  const youtubeUrl = watch('youtube_url')
  useEffect(() => {
    if (youtubeUrl) {
      const videoId = extractYouTubeId(youtubeUrl)
      setYoutubePreview(videoId)
    } else {
      setYoutubePreview(null)
    }
  }, [youtubeUrl])

  const onSubmit = async (data: VideoSubmission) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit video')
      }

      toast.success(result.message)
      setIsSuccess(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="container-custom max-w-2xl text-center">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Submission Successful!
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Thank you for submitting your video. Our team will review it and publish it once approved.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => setIsSuccess(false)} variant="outline">
              Submit Another Video
            </Button>
            <Button asChild>
              <Link href="/">Browse Videos</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient-cinema mb-3">
            Submit Your AI Video
          </h1>
          <p className="text-lg text-muted-foreground">
            Share your AI-generated video with the community. All submissions are reviewed before publishing.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Video Information */}
          <div className="bg-card rounded-xl p-6 border border-border space-y-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Video Information</h2>

            <div>
              <Label htmlFor="youtube_url">
                YouTube URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="youtube_url"
                placeholder="https://www.youtube.com/watch?v=..."
                {...register('youtube_url')}
                className="mt-2"
              />
              {errors.youtube_url && (
                <p className="text-sm text-destructive mt-1">{errors.youtube_url.message}</p>
              )}

              {/* YouTube Preview */}
              {youtubePreview && (
                <div className="mt-4">
                  <div className="aspect-video bg-card rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubePreview}`}
                      title="YouTube preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Youtube className="w-3 h-3" />
                    Preview of your YouTube video
                  </p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="title">
                Video Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="My Amazing AI-Generated Film"
                {...register('title')}
                className="mt-2"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell us about your video, the creative process, and what makes it special..."
                rows={4}
                {...register('description')}
                className="mt-2"
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ai_tool">
                  AI Tool Used <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ai_tool"
                  placeholder="e.g., Runway, Pika, Sora"
                  {...register('ai_tool')}
                  className="mt-2"
                />
                {errors.ai_tool && (
                  <p className="text-sm text-destructive mt-1">{errors.ai_tool.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="genre">Genre</Label>
                <Input
                  id="genre"
                  placeholder="e.g., Sci-Fi, Horror, Documentary"
                  {...register('genre')}
                  className="mt-2"
                />
                {errors.genre && (
                  <p className="text-sm text-destructive mt-1">{errors.genre.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Creator Information */}
          <div className="bg-card rounded-xl p-6 border border-border space-y-6">
            <div className="flex items-start justify-between">
              <h2 className="text-2xl font-bold text-foreground">Creator Information</h2>
              {user && (
                <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">
                  Logged in
                </span>
              )}
            </div>

            <div>
              <Label htmlFor="creator_name">
                Your Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="creator_name"
                placeholder="John Doe"
                {...register('creator_name')}
                className="mt-2"
                disabled={!!user}
              />
              {errors.creator_name && (
                <p className="text-sm text-destructive mt-1">{errors.creator_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="creator_email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="creator_email"
                type="email"
                placeholder="john@example.com"
                {...register('creator_email')}
                className="mt-2"
                disabled={!!user}
              />
              {errors.creator_email && (
                <p className="text-sm text-destructive mt-1">{errors.creator_email.message}</p>
              )}
              {!user && (
                <p className="text-xs text-muted-foreground mt-1">
                  We&apos;ll never share your email publicly
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="creator_website">Website</Label>
              <Input
                id="creator_website"
                type="url"
                placeholder="https://yourwebsite.com"
                {...register('creator_website')}
                className="mt-2"
              />
              {errors.creator_website && (
                <p className="text-sm text-destructive mt-1">{errors.creator_website.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="creator_twitter">Twitter Handle</Label>
              <Input
                id="creator_twitter"
                placeholder="@yourhandle"
                {...register('creator_twitter')}
                className="mt-2"
              />
              {errors.creator_twitter && (
                <p className="text-sm text-destructive mt-1">{errors.creator_twitter.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between p-6 bg-card rounded-xl border border-border">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Video requirements:
                </p>
                <p className="text-xs text-muted-foreground">
                  Must be at least 30 seconds long • All submissions are reviewed
                </p>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-crimson to-amber hover:from-crimson/90 hover:to-amber/90 text-white font-bold shadow-lg hover:shadow-xl transition-all"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Submitting...' : 'Submit Video'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

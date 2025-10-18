'use client'

import { useState } from 'react'
import { Rating, RatingButton } from '@/components/ui/shadcn-io/rating'
import { Button } from '@/components/ui/button'
import { Share2, X, LogIn } from 'lucide-react'
import { toast } from 'sonner'

interface VideoRatingDisplayProps {
  avgRating: number | null
  totalRatings: number
}

interface VideoRatingInteractiveProps {
  videoId: string
}

interface VideoRatingProps {
  avgRating: number | null
  totalRatings: number
  videoId: string
}

export function VideoRating({ avgRating, totalRatings, videoId }: VideoRatingProps) {
  const [userRating, setUserRating] = useState(0)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)

  const handleRatingChange = (rating: number) => {
    // Store rating temporarily in localStorage
    const tempRatings = JSON.parse(localStorage.getItem('temp_ratings') || '{}')
    tempRatings[videoId] = {
      rating,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('temp_ratings', JSON.stringify(tempRatings))

    setUserRating(rating)
    setShowAuthPrompt(true)
    toast.success(`You rated this ${rating} stars!`)
  }

  const handleSignIn = () => {
    window.location.href = '/auth'
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }

  const displayAvg = avgRating ? avgRating.toFixed(1) : '0.0'
  const readOnlyValue = avgRating ? Math.round(avgRating) : 0

  return (
    <div className="space-y-3">
      {/* Compact Rating Card */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Average Rating Display */}
          <div className="flex items-center gap-2" style={{ color: 'hsl(38, 92%, 50%)' }}>
            <Rating value={readOnlyValue} readOnly className="gap-0.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <RatingButton
                  key={index}
                  size={18}
                />
              ))}
            </Rating>
            <span className="text-lg font-bold text-foreground">{displayAvg}</span>
            <span className="text-xs text-muted-foreground">
              ({totalRatings})
            </span>
          </div>

          {/* Interactive Rating */}
          <div className="flex items-center gap-2" style={{ color: 'hsl(38, 92%, 50%)' }}>
            <Rating
              value={userRating}
              onValueChange={handleRatingChange}
              className="gap-1"
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <RatingButton
                  key={index}
                  size={20}
                  className="hover:scale-110 transition-all"
                />
              ))}
            </Rating>
          </div>
        </div>

        {userRating > 0 && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            You rated {userRating} stars
          </p>
        )}
      </div>

      {/* Share Button - Compact */}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleCopyLink}
      >
        <Share2 className="w-3 h-3 mr-2" />
        Share
      </Button>

      {/* Auth Prompt Banner */}
      {showAuthPrompt && userRating > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-card border-2 border-primary rounded-xl p-5 shadow-2xl max-w-sm mx-4 relative">
            <button
              onClick={() => setShowAuthPrompt(false)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <LogIn className="w-5 h-5 text-primary" />
              </div>

              <div className="flex-1 pr-4">
                <h4 className="text-base font-bold text-foreground mb-1">
                  Save your rating
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Sign in to save your <span className="font-semibold" style={{ color: 'hsl(38, 92%, 50%)' }}>{userRating}-star</span> rating
                </p>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSignIn}
                    className="flex-1 bg-primary hover:bg-primary/90 h-8 text-xs"
                  >
                    <LogIn className="w-3 h-3 mr-1" />
                    Sign In
                  </Button>
                  <Button
                    onClick={() => setShowAuthPrompt(false)}
                    variant="outline"
                    className="h-8 text-xs px-3"
                  >
                    Later
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Display-only component for showing average rating below title
export function VideoRatingDisplay({ avgRating, totalRatings }: VideoRatingDisplayProps) {
  const displayAvg = avgRating ? avgRating.toFixed(1) : '0.0'
  const readOnlyValue = avgRating ? Math.round(avgRating) : 0

  return (
    <div className="flex items-center gap-2" style={{ color: 'hsl(38, 92%, 50%)' }}>
      <Rating value={readOnlyValue} readOnly className="gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <RatingButton key={index} size={18} />
        ))}
      </Rating>
      <span className="text-base font-semibold text-foreground">{displayAvg}</span>
      <span className="text-sm text-muted-foreground">
        ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
      </span>
    </div>
  )
}

// Interactive component for rating above creator section
export function VideoRatingInteractive({ videoId }: VideoRatingInteractiveProps) {
  const [userRating, setUserRating] = useState(0)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)

  const handleRatingChange = (rating: number) => {
    // Store rating temporarily in localStorage
    const tempRatings = JSON.parse(localStorage.getItem('temp_ratings') || '{}')
    tempRatings[videoId] = {
      rating,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('temp_ratings', JSON.stringify(tempRatings))

    setUserRating(rating)
    setShowAuthPrompt(true)
    toast.success(`You rated this ${rating} stars!`)
  }

  const handleSignIn = () => {
    window.location.href = '/auth'
  }

  return (
    <>
      <div className="rounded-lg p-4" style={{ backgroundColor: 'hsl(217, 24%, 12%)', border: '1px solid hsl(215, 20%, 22%)' }}>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-foreground">Rate this video</span>

          <div className="flex items-center gap-2" style={{ color: 'hsl(38, 92%, 50%)' }}>
            <Rating
              value={userRating}
              onValueChange={handleRatingChange}
              className="gap-1"
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <RatingButton
                  key={index}
                  size={20}
                  className="hover:scale-110 transition-all"
                />
              ))}
            </Rating>
          </div>
        </div>

        {userRating > 0 && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            You rated {userRating} stars
          </p>
        )}
      </div>

      {/* Auth Prompt Banner */}
      {showAuthPrompt && userRating > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-card border-2 border-primary rounded-xl p-5 shadow-2xl max-w-sm mx-4 relative">
            <button
              onClick={() => setShowAuthPrompt(false)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <LogIn className="w-5 h-5 text-primary" />
              </div>

              <div className="flex-1 pr-4">
                <h4 className="text-base font-bold text-foreground mb-1">
                  Save your rating
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Sign in to save your <span className="font-semibold" style={{ color: 'hsl(38, 92%, 50%)' }}>{userRating}-star</span> rating
                </p>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSignIn}
                    className="flex-1 bg-primary hover:bg-primary/90 h-8 text-xs"
                  >
                    <LogIn className="w-3 h-3 mr-1" />
                    Sign In
                  </Button>
                  <Button
                    onClick={() => setShowAuthPrompt(false)}
                    variant="outline"
                    className="h-8 text-xs px-3"
                  >
                    Later
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

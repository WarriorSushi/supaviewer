import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const ratingSchema = z.object({
  video_id: z.string().uuid(),
  rating: z.number().min(0.5).max(5).refine((val) => val % 0.5 === 0, {
    message: 'Rating must be in 0.5 increments',
  }),
})

// Helper to recalculate video rating
async function recalculateVideoRating(videoId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: ratings } = await supabase
    .from('ratings')
    .select('rating')
    .eq('video_id', videoId)

  if (!ratings || ratings.length === 0) {
    await supabase
      .from('videos')
      .update({ avg_rating: null, total_ratings: 0 })
      .eq('id', videoId)
    return
  }

  const avgRating = ratings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / ratings.length
  const totalRatings = ratings.length

  await supabase
    .from('videos')
    .update({ avg_rating: avgRating, total_ratings: totalRatings })
    .eq('id', videoId)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = ratingSchema.parse(body)

    // Check if user already rated this video
    const { data: existingRating } = await supabase
      .from('ratings')
      .select('id')
      .eq('video_id', validatedData.video_id)
      .eq('user_id', user.id)
      .single()

    if (existingRating) {
      return NextResponse.json(
        { error: 'You have already rated this video. Use PATCH to update.' },
        { status: 400 }
      )
    }

    // Create new rating
    const { data: rating, error } = await supabase
      .from('ratings')
      .insert({
        video_id: validatedData.video_id,
        user_id: user.id,
        rating: validatedData.rating,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating rating:', error)
      return NextResponse.json({ error: 'Failed to create rating' }, { status: 500 })
    }

    // Recalculate video average rating
    await recalculateVideoRating(validatedData.video_id, supabase)

    return NextResponse.json({ rating }, { status: 201 })
  } catch (error) {
    console.error('Rating error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid rating data', details: (error as z.ZodError).issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

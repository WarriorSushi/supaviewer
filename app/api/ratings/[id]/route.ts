import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateRatingSchema = z.object({
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateRatingSchema.parse(body)

    // Get existing rating to verify ownership and get video_id
    const { data: existingRating } = await supabase
      .from('ratings')
      .select('id, user_id, video_id')
      .eq('id', id)
      .single()

    if (!existingRating) {
      return NextResponse.json({ error: 'Rating not found' }, { status: 404 })
    }

    if (existingRating.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update rating
    const { data: rating, error } = await supabase
      .from('ratings')
      .update({ rating: validatedData.rating })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating rating:', error)
      return NextResponse.json({ error: 'Failed to update rating' }, { status: 500 })
    }

    // Recalculate video average rating
    await recalculateVideoRating(existingRating.video_id, supabase)

    return NextResponse.json({ rating })
  } catch (error) {
    console.error('Update rating error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid rating data', details: (error as z.ZodError).issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get existing rating to verify ownership and get video_id
    const { data: existingRating } = await supabase
      .from('ratings')
      .select('id, user_id, video_id')
      .eq('id', id)
      .single()

    if (!existingRating) {
      return NextResponse.json({ error: 'Rating not found' }, { status: 404 })
    }

    if (existingRating.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete rating
    const { error } = await supabase.from('ratings').delete().eq('id', id)

    if (error) {
      console.error('Error deleting rating:', error)
      return NextResponse.json({ error: 'Failed to delete rating' }, { status: 500 })
    }

    // Recalculate video average rating
    await recalculateVideoRating(existingRating.video_id, supabase)

    return NextResponse.json({ message: 'Rating deleted successfully' })
  } catch (error) {
    console.error('Delete rating error:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

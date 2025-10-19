import { isAdmin } from '@/lib/admin-auth'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const videoUpdateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  ai_tool: z.string().min(1).optional(),
  genre: z.string().min(1).optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  featured: z.boolean().optional(),
})

export async function GET(
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role

    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch video with full details
    const { data: video, error } = await supabase
      .from('videos')
      .select(
        `
        id,
        title,
        description,
        youtube_id,
        youtube_url,
        duration_seconds,
        ai_tool,
        genre,
        status,
        featured,
        created_at,
        updated_at,
        avg_rating,
        total_ratings,
        creator:creators(
          id,
          name,
          slug,
          email,
          website,
          twitter_handle,
          avatar_url,
          bio
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching video:', error)
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    return NextResponse.json({ video })
  } catch (error) {
    console.error('Error in video detail API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role

    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = videoUpdateSchema.parse(body)

    // Check if video exists
    const { data: existingVideo, error: fetchError } = await supabase
      .from('videos')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existingVideo) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Update video
    const updateData: {
      title?: string
      description?: string
      ai_tool?: string
      genre?: string
      status?: 'pending' | 'approved' | 'rejected'
      featured?: boolean
      updated_at: string
    } = {
      ...validatedData,
      updated_at: new Date().toISOString(),
    }

    const { data: video, error } = await supabase
      .from('videos')
      .update(updateData)
      .eq('id', id)
      .select(
        `
        *,
        creator:creators(*)
      `
      )
      .single()

    if (error) {
      console.error('Error updating video:', error)
      return NextResponse.json(
        { error: 'Failed to update video' },
        { status: 500 }
      )
    }

    return NextResponse.json({ video })
  } catch (error) {
    console.error('Error in video update API:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: (error as z.ZodError).issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role

    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if video exists
    const { data: existingVideo, error: fetchError } = await supabase
      .from('videos')
      .select('id, title')
      .eq('id', id)
      .single()

    if (fetchError || !existingVideo) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Delete associated ratings first (if needed, or use CASCADE in database)
    await supabase.from('ratings').delete().eq('video_id', id)

    // Delete video
    const { error } = await supabase.from('videos').delete().eq('id', id)

    if (error) {
      console.error('Error deleting video:', error)
      return NextResponse.json(
        { error: 'Failed to delete video' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully',
    })
  } catch (error) {
    console.error('Error in video delete API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

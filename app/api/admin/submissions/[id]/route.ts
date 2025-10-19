import { isAdmin } from '@/lib/admin-auth'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // Fetch submission with full details
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
      console.error('Error fetching submission:', error)
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ video })
  } catch (error) {
    console.error('Error in submission detail API:', error)
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
    const { status } = body

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be pending, approved, or rejected' },
        { status: 400 }
      )
    }

    // Update video status
    const { data: video, error } = await supabase
      .from('videos')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating submission:', error)
      return NextResponse.json(
        { error: 'Failed to update submission' },
        { status: 500 }
      )
    }

    return NextResponse.json({ video })
  } catch (error) {
    console.error('Error in submission update API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

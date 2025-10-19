import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') // 'pending', 'approved', 'rejected', or null for all
    const search = searchParams.get('search') // Search term for title/creator
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
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
          avatar_url
        )
      `,
        { count: 'exact' }
      )

    // Filter by status if provided
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.eq('status', status)
    }

    // Search functionality
    if (search) {
      query = query.or(`title.ilike.%${search}%,creators.name.ilike.%${search}%`)
    }

    // Sort: pending by oldest first (FIFO), others by newest
    if (status === 'pending') {
      query = query.order('created_at', { ascending: true })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: videos, error, count } = await query

    if (error) {
      console.error('Error fetching submissions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      videos: videos || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Error in submissions API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

import { isAdmin } from '@/lib/admin-auth'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const aiTool = searchParams.get('ai_tool')
    const creatorId = searchParams.get('creator_id')
    const featured = searchParams.get('featured') // 'true', 'false', or null
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sort_by') || 'created_at' // created_at, title, avg_rating
    const sortOrder = searchParams.get('sort_order') || 'desc' // asc, desc
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
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
          avatar_url
        )
      `,
        { count: 'exact' }
      )

    // Apply filters
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.eq('status', status)
    }

    if (aiTool) {
      query = query.eq('ai_tool', aiTool)
    }

    if (creatorId) {
      query = query.eq('creator_id', creatorId)
    }

    if (featured === 'true') {
      query = query.eq('featured', true)
    } else if (featured === 'false') {
      query = query.eq('featured', false)
    }

    // Date range filter
    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    // Search functionality
    if (search) {
      query = query.or(`title.ilike.%${search}%,creators.name.ilike.%${search}%`)
    }

    // Sorting
    const validSortColumns = ['created_at', 'title', 'avg_rating', 'total_ratings']
    const validSortOrders = ['asc', 'desc']

    if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: videos, error, count } = await query

    if (error) {
      console.error('Error fetching videos:', error)
      return NextResponse.json(
        { error: 'Failed to fetch videos' },
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
    console.error('Error in videos API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

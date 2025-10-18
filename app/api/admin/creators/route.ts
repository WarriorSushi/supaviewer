import { isAdmin } from '@/lib/admin-auth'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createCreatorSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  email: z.string().email(),
  bio: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  twitter_handle: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
})

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
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = (page - 1) * limit

    // Build query - get creators with video count
    let query = supabase
      .from('creators')
      .select(
        `
        id,
        name,
        slug,
        email,
        bio,
        website,
        twitter_handle,
        avatar_url,
        created_at
      `,
        { count: 'exact' }
      )

    // Search functionality
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Sort by name
    query = query.order('name', { ascending: true })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: creators, error, count } = await query

    if (error) {
      console.error('Error fetching creators:', error)
      return NextResponse.json(
        { error: 'Failed to fetch creators' },
        { status: 500 }
      )
    }

    // Fetch video counts and avg ratings for each creator
    const creatorsWithStats = await Promise.all(
      (creators || []).map(async (creator) => {
        // Get video count
        const { count: videoCount } = await supabase
          .from('videos')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', creator.id)
          .eq('status', 'approved')

        // Get videos to calculate avg rating
        const { data: videos } = await supabase
          .from('videos')
          .select('avg_rating')
          .eq('creator_id', creator.id)
          .eq('status', 'approved')

        const avgRating =
          videos && videos.length > 0
            ? videos.reduce((sum, v) => sum + (v.avg_rating || 0), 0) / videos.length
            : null

        return {
          ...creator,
          video_count: videoCount || 0,
          avg_rating: avgRating,
        }
      })
    )

    return NextResponse.json({
      creators: creatorsWithStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error('Error in creators API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const validatedData = createCreatorSchema.parse(body)

    // Check if slug already exists
    const { data: existingCreator } = await supabase
      .from('creators')
      .select('id')
      .eq('slug', validatedData.slug)
      .single()

    if (existingCreator) {
      return NextResponse.json(
        { error: 'A creator with this slug already exists' },
        { status: 400 }
      )
    }

    // Create creator
    const { data: creator, error } = await supabase
      .from('creators')
      .insert({
        name: validatedData.name,
        slug: validatedData.slug,
        email: validatedData.email,
        bio: validatedData.bio || null,
        website: validatedData.website || null,
        twitter_handle: validatedData.twitter_handle || null,
        avatar_url: validatedData.avatar_url || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating creator:', error)
      return NextResponse.json(
        { error: 'Failed to create creator' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      creator,
      message: 'Creator created successfully',
    })
  } catch (error: any) {
    console.error('Error in create creator API:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

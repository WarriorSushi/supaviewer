import { isAdmin } from '@/lib/admin-auth'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateCreatorSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
  email: z.string().email().optional(),
  bio: z.string().optional().nullable(),
  website: z.string().url().optional().or(z.literal('')).nullable(),
  twitter_handle: z.string().optional().nullable(),
  avatar_url: z.string().url().optional().or(z.literal('')).nullable(),
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

    // Fetch creator with stats
    const { data: creator, error } = await supabase
      .from('creators')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    // Get video count
    const { count: videoCount } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', id)

    return NextResponse.json({
      creator: {
        ...creator,
        video_count: videoCount || 0,
      },
    })
  } catch (error: any) {
    console.error('Error in creator detail API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
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
    const validatedData = updateCreatorSchema.parse(body)

    // Check if creator exists
    const { data: existingCreator, error: fetchError } = await supabase
      .from('creators')
      .select('id, slug')
      .eq('id', id)
      .single()

    if (fetchError || !existingCreator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    // If slug is being changed, check if new slug already exists
    if (validatedData.slug && validatedData.slug !== existingCreator.slug) {
      const { data: slugExists } = await supabase
        .from('creators')
        .select('id')
        .eq('slug', validatedData.slug)
        .neq('id', id)
        .single()

      if (slugExists) {
        return NextResponse.json(
          { error: 'A creator with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Update creator
    const updateData: any = {}
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.slug !== undefined) updateData.slug = validatedData.slug
    if (validatedData.email !== undefined) updateData.email = validatedData.email
    if (validatedData.bio !== undefined) updateData.bio = validatedData.bio || null
    if (validatedData.website !== undefined) updateData.website = validatedData.website || null
    if (validatedData.twitter_handle !== undefined) updateData.twitter_handle = validatedData.twitter_handle || null
    if (validatedData.avatar_url !== undefined) updateData.avatar_url = validatedData.avatar_url || null

    const { data: creator, error } = await supabase
      .from('creators')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating creator:', error)
      return NextResponse.json(
        { error: 'Failed to update creator' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      creator,
      message: 'Creator updated successfully',
    })
  } catch (error: any) {
    console.error('Error in update creator API:', error)

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

    // Check if creator exists
    const { data: existingCreator, error: fetchError } = await supabase
      .from('creators')
      .select('id, name')
      .eq('id', id)
      .single()

    if (fetchError || !existingCreator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    // Check if creator has any videos
    const { count: videoCount } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', id)

    if (videoCount && videoCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete creator with existing videos' },
        { status: 400 }
      )
    }

    // Delete creator
    const { error } = await supabase.from('creators').delete().eq('id', id)

    if (error) {
      console.error('Error deleting creator:', error)
      return NextResponse.json(
        { error: 'Failed to delete creator' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Creator deleted successfully',
    })
  } catch (error: any) {
    console.error('Error in delete creator API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

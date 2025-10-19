import { isAdmin } from '@/lib/admin-auth'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const approvalSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  ai_tool: z.string().min(1),
  genre: z.string().min(1),
  creator_id: z.string().uuid().optional(),
  new_creator: z
    .object({
      name: z.string().min(2),
      email: z.string().email(),
      bio: z.string().optional(),
      website: z.string().url().optional().or(z.literal('')),
      twitter_handle: z.string().optional(),
    })
    .optional(),
  featured: z.boolean().default(false),
})

export async function POST(
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
    const validatedData = approvalSchema.parse(body)

    // Get the video submission
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single()

    if (videoError || !video) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    let creatorId = validatedData.creator_id

    // Handle creator - create new or use existing
    if (!creatorId && validatedData.new_creator) {
      // Create new creator
      const newCreator = validatedData.new_creator

      // Generate slug from name
      const slug = newCreator.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      // Check if slug already exists
      const { data: existingCreator } = await supabase
        .from('creators')
        .select('id')
        .eq('slug', slug)
        .single()

      let finalSlug = slug
      if (existingCreator) {
        // Add random suffix if slug exists
        finalSlug = `${slug}-${Math.random().toString(36).substr(2, 6)}`
      }

      const { data: creator, error: creatorError } = await supabase
        .from('creators')
        .insert({
          name: newCreator.name,
          slug: finalSlug,
          email: newCreator.email,
          bio: newCreator.bio || null,
          website: newCreator.website || null,
          twitter_handle: newCreator.twitter_handle || null,
        })
        .select()
        .single()

      if (creatorError) {
        console.error('Error creating creator:', creatorError)
        return NextResponse.json(
          { error: 'Failed to create creator' },
          { status: 500 }
        )
      }

      creatorId = creator.id
    } else if (!creatorId) {
      return NextResponse.json(
        { error: 'Creator ID or new creator data is required' },
        { status: 400 }
      )
    }

    // Update video with approved status and new details
    const { data: updatedVideo, error: updateError } = await supabase
      .from('videos')
      .update({
        title: validatedData.title,
        description: validatedData.description,
        ai_tool: validatedData.ai_tool,
        genre: validatedData.genre,
        creator_id: creatorId,
        featured: validatedData.featured,
        status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(
        `
        *,
        creator:creators(*)
      `
      )
      .single()

    if (updateError) {
      console.error('Error updating video:', updateError)
      return NextResponse.json(
        { error: 'Failed to approve submission' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      video: updatedVideo,
      message: 'Video approved and published successfully',
    })
  } catch (error) {
    console.error('Error in approval API:', error)

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

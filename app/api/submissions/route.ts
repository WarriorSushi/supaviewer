import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { videoSubmissionSchema, extractYouTubeId } from '@/lib/validations'
import { z } from 'zod'

// Fetch YouTube video metadata using oEmbed API
async function getYouTubeMetadata(videoId: string) {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch YouTube metadata')
    }

    const data = await response.json()
    return {
      title: data.title,
      thumbnail_url: data.thumbnail_url,
      author_name: data.author_name,
    }
  } catch (error) {
    console.error('Error fetching YouTube metadata:', error)
    return null
  }
}

// Helper to create or get creator slug
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = videoSubmissionSchema.parse(body)

    // Extract YouTube ID
    const youtubeId = extractYouTubeId(validatedData.youtube_url)
    if (!youtubeId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      )
    }

    // Get YouTube metadata
    const metadata = await getYouTubeMetadata(youtubeId)
    if (!metadata) {
      return NextResponse.json(
        { error: 'Could not fetch video information from YouTube' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current user (if logged in)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Check or create creator
    const creatorSlug = createSlug(validatedData.creator_name)

    // First, try to find existing creator by email
    const { data: existingCreator } = await supabase
      .from('creators')
      .select('id')
      .eq('slug', creatorSlug)
      .single()

    let creatorId: string

    if (existingCreator) {
      creatorId = existingCreator.id
    } else {
      // Create new creator
      const { data: newCreator, error: creatorError } = await supabase
        .from('creators')
        .insert({
          name: validatedData.creator_name,
          slug: creatorSlug,
          email: validatedData.creator_email,
          bio: null,
          website: validatedData.creator_website || null,
          twitter_handle: validatedData.creator_twitter || null,
          avatar_url: null,
          user_id: user?.id || null,
        })
        .select('id')
        .single()

      if (creatorError || !newCreator) {
        console.error('Error creating creator:', creatorError)
        return NextResponse.json(
          { error: 'Failed to create creator profile' },
          { status: 500 }
        )
      }

      creatorId = newCreator.id
    }

    // Create video submission
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .insert({
        title: validatedData.title,
        description: validatedData.description || null,
        youtube_id: youtubeId,
        youtube_url: validatedData.youtube_url,
        thumbnail_url: metadata.thumbnail_url,
        creator_id: creatorId,
        ai_tool: validatedData.ai_tool,
        genre: validatedData.genre || null,
        duration_seconds: 30, // Placeholder - will be updated by admin
        status: 'pending', // Requires approval
        submitted_by_user_id: user?.id || null,
      })
      .select('id')
      .single()

    if (videoError || !video) {
      console.error('Error creating video:', videoError)
      return NextResponse.json(
        { error: 'Failed to submit video' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        videoId: video.id,
        message: 'Video submitted successfully! It will be reviewed before being published.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Submission error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'An error occurred while submitting your video' },
      { status: 500 }
    )
  }
}

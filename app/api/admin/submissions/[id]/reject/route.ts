import { isAdmin } from '@/lib/admin-auth'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const rejectionSchema = z.object({
  notes: z.string().optional(),
  notify_submitter: z.boolean().default(false),
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
    const validatedData = rejectionSchema.parse(body)

    // Get the video submission
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('*, creator:creators(*)')
      .eq('id', id)
      .single()

    if (videoError || !video) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    // Update video status to rejected
    const { data: updatedVideo, error: updateError } = await supabase
      .from('videos')
      .update({
        status: 'rejected',
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
        { error: 'Failed to reject submission' },
        { status: 500 }
      )
    }

    // Store rejection notes in metadata (you might want to create a separate table for this)
    if (validatedData.notes) {
      // For now, we'll just log it. In a real app, you'd store this in a rejections table
      console.log(`Rejection notes for video ${id}:`, validatedData.notes)
    }

    // Handle notification (optional)
    if (validatedData.notify_submitter && video.creator?.email) {
      // TODO: Implement email notification
      // For now, we'll just log it
      console.log(`Would notify ${video.creator.email} about rejection`)

      // In production, you'd use a service like:
      // - Resend
      // - SendGrid
      // - AWS SES
      // - Supabase Edge Functions with email
    }

    return NextResponse.json({
      success: true,
      video: updatedVideo,
      message: 'Video rejected successfully',
    })
  } catch (error) {
    console.error('Error in rejection API:', error)

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

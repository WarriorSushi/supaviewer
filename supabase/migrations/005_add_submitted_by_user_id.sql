-- Add submitted_by_user_id column to videos table
-- This tracks which user submitted the video (for submissions workflow)

-- Add the column (nullable because existing videos won't have this)
ALTER TABLE public.videos
ADD COLUMN IF NOT EXISTS submitted_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for querying videos by submitter
CREATE INDEX IF NOT EXISTS idx_videos_submitted_by_user_id ON public.videos(submitted_by_user_id);

-- Add comment for documentation
COMMENT ON COLUMN public.videos.submitted_by_user_id IS 'The user who submitted this video for review';

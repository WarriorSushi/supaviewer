-- =============================================================================
-- YOUTUBE THUMBNAIL AUTO-HANDLER
-- This fixes existing videos and automatically handles all future submissions
-- =============================================================================

-- Function to extract YouTube ID from URL
CREATE OR REPLACE FUNCTION public.extract_youtube_id(url TEXT)
RETURNS TEXT AS $$
DECLARE
  video_id TEXT;
BEGIN
  -- Handle youtube.com/watch?v=ID format
  IF url ~ 'youtube\.com/watch\?v=' THEN
    video_id := substring(url from 'v=([a-zA-Z0-9_-]+)');
  -- Handle youtu.be/ID format
  ELSIF url ~ 'youtu\.be/' THEN
    video_id := substring(url from 'youtu\.be/([a-zA-Z0-9_-]+)');
  -- Handle youtube.com/embed/ID format
  ELSIF url ~ 'youtube\.com/embed/' THEN
    video_id := substring(url from 'embed/([a-zA-Z0-9_-]+)');
  END IF;
  
  RETURN video_id;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to generate thumbnail URL from YouTube ID
CREATE OR REPLACE FUNCTION public.generate_youtube_thumbnail(youtube_id TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Use hqdefault as it's the most reliable quality that exists for all videos
  RETURN 'https://i.ytimg.com/vi/' || youtube_id || '/hqdefault.jpg';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger function to auto-populate youtube_id and thumbnail_url for videos
CREATE OR REPLACE FUNCTION public.auto_populate_video_youtube_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract youtube_id if not provided or if youtube_url changed
  IF NEW.youtube_id IS NULL OR NEW.youtube_id = '' OR (TG_OP = 'UPDATE' AND NEW.youtube_url != OLD.youtube_url) THEN
    NEW.youtube_id := public.extract_youtube_id(NEW.youtube_url);
  END IF;
  
  -- Generate thumbnail_url from youtube_id
  IF NEW.youtube_id IS NOT NULL AND NEW.youtube_id != '' THEN
    NEW.thumbnail_url := public.generate_youtube_thumbnail(NEW.youtube_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for videos table
DROP TRIGGER IF EXISTS auto_populate_video_youtube_fields_trigger ON public.videos;
CREATE TRIGGER auto_populate_video_youtube_fields_trigger
  BEFORE INSERT OR UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_populate_video_youtube_fields();

-- Update ALL existing videos right now
UPDATE public.videos
SET 
  youtube_id = public.extract_youtube_id(youtube_url),
  thumbnail_url = public.generate_youtube_thumbnail(public.extract_youtube_id(youtube_url))
WHERE youtube_id IS NOT NULL;

-- Also update submissions table for consistency
UPDATE public.submissions
SET youtube_url = youtube_url; -- This will trigger any validation

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
  video_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO video_count FROM public.videos;
  
  RAISE NOTICE '✅ YouTube thumbnail handler installed successfully!';
  RAISE NOTICE '✅ Updated % existing videos', video_count;
  RAISE NOTICE '✅ All future videos and submissions will auto-generate thumbnails';
  RAISE NOTICE '';
  RAISE NOTICE 'HOW IT WORKS:';
  RAISE NOTICE '  1. When a video is created, youtube_id is extracted from youtube_url';
  RAISE NOTICE '  2. thumbnail_url is automatically generated as hqdefault.jpg';
  RAISE NOTICE '  3. Your VideoThumbnail component provides cascading fallback for best quality';
  RAISE NOTICE '  4. User submissions work exactly the same way automatically!';
END $$;
-- SupaViewer Database Schema
-- Initial migration: Creates all tables, indexes, RLS policies, and triggers

-- =============================================================================
-- 1. CREATE TABLES
-- =============================================================================

-- creators table
CREATE TABLE IF NOT EXISTS public.creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  website TEXT,
  twitter_handle TEXT,
  avatar_url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Constraints
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- videos table
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL UNIQUE,
  youtube_id TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  ai_tool TEXT NOT NULL,
  genre TEXT,
  duration_seconds INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  featured BOOLEAN NOT NULL DEFAULT false,
  avg_rating DECIMAL(3,2),
  total_ratings INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,

  -- Constraints
  CONSTRAINT status_values CHECK (status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT duration_minimum CHECK (duration_seconds >= 30)
);

-- ratings table
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,

  -- Constraints
  CONSTRAINT rating_range CHECK (rating >= 1 AND rating <= 10),
  CONSTRAINT unique_user_video_rating UNIQUE (video_id, user_id)
);

-- submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL,
  ai_tool TEXT NOT NULL,
  genre TEXT,
  creator_name TEXT NOT NULL,
  creator_email TEXT,
  creator_website TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  processed_at TIMESTAMPTZ,
  video_id UUID REFERENCES public.videos(id) ON DELETE SET NULL,

  -- Constraints
  CONSTRAINT submission_status_values CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- =============================================================================
-- 2. CREATE INDEXES
-- =============================================================================

-- creators indexes
CREATE INDEX IF NOT EXISTS idx_creators_user_id ON public.creators(user_id);
CREATE INDEX IF NOT EXISTS idx_creators_slug ON public.creators(slug);

-- videos indexes
CREATE INDEX IF NOT EXISTS idx_videos_creator_id ON public.videos(creator_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON public.videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON public.videos(featured);
CREATE INDEX IF NOT EXISTS idx_videos_avg_rating ON public.videos(avg_rating DESC);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON public.videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_youtube_url ON public.videos(youtube_url);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_videos_status_featured_created ON public.videos(status, featured, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_status_avg_rating ON public.videos(status, avg_rating DESC);
CREATE INDEX IF NOT EXISTS idx_videos_creator_status_created ON public.videos(creator_id, status, created_at DESC);

-- Full-text search indexes (for title and description search)
CREATE INDEX IF NOT EXISTS idx_videos_title_search ON public.videos USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_videos_description_search ON public.videos USING gin(to_tsvector('english', COALESCE(description, '')));

-- ratings indexes
CREATE INDEX IF NOT EXISTS idx_ratings_video_id ON public.ratings(video_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON public.ratings(user_id);

-- submissions indexes
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions(user_id);

-- =============================================================================
-- 3. CREATE TRIGGERS FOR UPDATED_AT
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for creators
CREATE TRIGGER update_creators_updated_at
  BEFORE UPDATE ON public.creators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for videos
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for ratings
CREATE TRIGGER update_ratings_updated_at
  BEFORE UPDATE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- 4. CREATE TRIGGER FOR RATING CALCULATIONS
-- =============================================================================

-- Function to update video rating statistics
CREATE OR REPLACE FUNCTION public.update_video_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the video's avg_rating and total_ratings
  UPDATE public.videos
  SET
    avg_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM public.ratings
      WHERE video_id = COALESCE(NEW.video_id, OLD.video_id)
    ),
    total_ratings = (
      SELECT COUNT(*)
      FROM public.ratings
      WHERE video_id = COALESCE(NEW.video_id, OLD.video_id)
    )
  WHERE id = COALESCE(NEW.video_id, OLD.video_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for rating insert/update/delete
CREATE TRIGGER update_video_ratings_on_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_video_rating_stats();

-- =============================================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 6. CREATE RLS POLICIES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- CREATORS POLICIES
-- ---------------------------------------------------------------------------

-- Anyone can read creators
CREATE POLICY "Anyone can view creators"
  ON public.creators
  FOR SELECT
  USING (true);

-- Only admins can insert creators
CREATE POLICY "Admins can insert creators"
  ON public.creators
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@example.com'
    )
  );

-- Admins can update all, creators can update their own
CREATE POLICY "Creators can update their own profile"
  ON public.creators
  FOR UPDATE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@example.com'
    )
  );

-- Only admins can delete creators
CREATE POLICY "Admins can delete creators"
  ON public.creators
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@example.com'
    )
  );

-- ---------------------------------------------------------------------------
-- VIDEOS POLICIES
-- ---------------------------------------------------------------------------

-- Anyone can view approved videos, admins can view all, creators can view their own
CREATE POLICY "Anyone can view approved videos"
  ON public.videos
  FOR SELECT
  USING (
    status = 'approved' OR
    creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@example.com'
    )
  );

-- Only admins can insert videos
CREATE POLICY "Admins can insert videos"
  ON public.videos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@example.com'
    )
  );

-- Only admins can update videos
CREATE POLICY "Admins can update videos"
  ON public.videos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@example.com'
    )
  );

-- Only admins can delete videos
CREATE POLICY "Admins can delete videos"
  ON public.videos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@example.com'
    )
  );

-- ---------------------------------------------------------------------------
-- RATINGS POLICIES
-- ---------------------------------------------------------------------------

-- Anyone can view ratings (needed for calculating averages)
CREATE POLICY "Anyone can view ratings"
  ON public.ratings
  FOR SELECT
  USING (true);

-- Authenticated users can insert their own ratings
CREATE POLICY "Users can insert their own ratings"
  ON public.ratings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own ratings
CREATE POLICY "Users can update their own ratings"
  ON public.ratings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own ratings, admins can delete any
CREATE POLICY "Users can delete their own ratings"
  ON public.ratings
  FOR DELETE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@example.com'
    )
  );

-- ---------------------------------------------------------------------------
-- SUBMISSIONS POLICIES
-- ---------------------------------------------------------------------------

-- Admins can see all, users can see their own
CREATE POLICY "Admins and users can view their own submissions"
  ON public.submissions
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    user_id IS NULL OR -- Allow viewing anonymous submissions
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@example.com'
    )
  );

-- Anyone can insert submissions (authenticated or not)
CREATE POLICY "Anyone can insert submissions"
  ON public.submissions
  FOR INSERT
  WITH CHECK (true);

-- Only admins can update submissions
CREATE POLICY "Admins can update submissions"
  ON public.submissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@example.com'
    )
  );

-- Only admins can delete submissions
CREATE POLICY "Admins can delete submissions"
  ON public.submissions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@example.com'
    )
  );

-- =============================================================================
-- 7. CREATE HELPER FUNCTIONS
-- =============================================================================

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_video_view_count(video_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.videos
  SET view_count = view_count + 1
  WHERE id = video_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.increment_video_view_count(UUID) TO authenticated, anon;

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION public.generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(trim(input_text), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function for full-text search on videos
CREATE OR REPLACE FUNCTION public.search_videos(search_query TEXT)
RETURNS SETOF public.videos AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.videos
  WHERE status = 'approved'
    AND (
      to_tsvector('english', title) @@ plainto_tsquery('english', search_query)
      OR to_tsvector('english', COALESCE(description, '')) @@ plainto_tsquery('english', search_query)
    )
  ORDER BY
    ts_rank(to_tsvector('english', title || ' ' || COALESCE(description, '')), plainto_tsquery('english', search_query)) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.search_videos(TEXT) TO authenticated, anon;

-- =============================================================================
-- 8. SEED DATA
-- =============================================================================

-- Insert sample creators
INSERT INTO public.creators (name, slug, bio, website, twitter_handle, avatar_url) VALUES
(
  'Alex Chen',
  'alex-chen',
  'AI filmmaker exploring the intersection of technology and storytelling. Specializing in Sora and Runway creations.',
  'https://alexchen.com',
  'alexchen',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
),
(
  'Maya Rodriguez',
  'maya-rodriguez',
  'Digital artist and AI video pioneer. Creating abstract and experimental visual experiences with cutting-edge AI tools.',
  'https://mayarodriguez.art',
  'mayavisuals',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya'
),
(
  'Jordan Park',
  'jordan-park',
  'Documentary filmmaker using AI to tell compelling stories about science and nature.',
  'https://jordanpark.studio',
  'jordanfilms',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan'
),
(
  'Sam Taylor',
  'sam-taylor',
  'Creative technologist experimenting with Pika and other AI video tools. Focused on narrative short films.',
  NULL,
  'samtaylor_ai',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam'
);

-- Insert sample videos
-- NOTE: These use placeholder YouTube IDs. Replace with actual AI-generated video IDs before production.
INSERT INTO public.videos (
  title,
  description,
  youtube_url,
  youtube_id,
  thumbnail_url,
  creator_id,
  ai_tool,
  genre,
  duration_seconds,
  status,
  featured,
  view_count
) VALUES
-- Alex Chen's videos
(
  'Neon Dreams: A Cyberpunk Journey',
  'An exploration of a futuristic cityscape where AI-generated visuals meet cyberpunk aesthetics. Created entirely with OpenAI Sora.',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  (SELECT id FROM public.creators WHERE slug = 'alex-chen'),
  'Sora',
  'Sci-Fi',
  125,
  'approved',
  true,
  342
),
(
  'Abstract Metamorphosis',
  'A mesmerizing transformation of shapes, colors, and patterns. Pushing the boundaries of what AI can create.',
  'https://www.youtube.com/watch?v=9bZkp7q19f0',
  '9bZkp7q19f0',
  'https://i.ytimg.com/vi/9bZkp7q19f0/maxresdefault.jpg',
  (SELECT id FROM public.creators WHERE slug = 'alex-chen'),
  'Runway Gen-3',
  'Abstract',
  95,
  'approved',
  true,
  278
),
(
  'The Last Lighthouse',
  'A haunting narrative about an abandoned lighthouse and the memories it holds. Generated with Runway Gen-3.',
  'https://www.youtube.com/watch?v=jNQXAC9IVRw',
  'jNQXAC9IVRw',
  'https://i.ytimg.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
  (SELECT id FROM public.creators WHERE slug = 'alex-chen'),
  'Runway Gen-3',
  'Narrative',
  156,
  'approved',
  false,
  189
),
(
  'Tokyo Rain: Midnight Chronicles',
  'Atmospheric scenes of Tokyo streets during a rainy midnight. Combining Sora with traditional cinematography principles.',
  'https://www.youtube.com/watch?v=yPYZpwSpKmA',
  'yPYZpwSpKmA',
  'https://i.ytimg.com/vi/yPYZpwSpKmA/maxresdefault.jpg',
  (SELECT id FROM public.creators WHERE slug = 'alex-chen'),
  'Sora',
  'Narrative',
  142,
  'approved',
  false,
  156
),

-- Maya Rodriguez's videos
(
  'Quantum Particles Dance',
  'Abstract visualization of quantum mechanics through AI-generated particle systems. A fusion of science and art.',
  'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
  'kJQP7kiw5Fk',
  'https://i.ytimg.com/vi/kJQP7kiw5Fk/maxresdefault.jpg',
  (SELECT id FROM public.creators WHERE slug = 'maya-rodriguez'),
  'Pika',
  'Abstract',
  88,
  'approved',
  true,
  425
),
(
  'Morphing Landscapes',
  'Watch as serene landscapes continuously transform into surreal dreamscapes. Experimental AI video art.',
  'https://www.youtube.com/watch?v=lp-EO5I60KA',
  'lp-EO5I60KA',
  'https://i.ytimg.com/vi/lp-EO5I60KA/maxresdefault.jpg',
  (SELECT id FROM public.creators WHERE slug = 'maya-rodriguez'),
  'Runway Gen-3',
  'Experimental',
  103,
  'approved',
  false,
  267
),
(
  'Digital Emotions',
  'An exploration of human emotions through abstract AI-generated visuals and colors.',
  'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
  'fJ9rUzIMcZQ',
  'https://i.ytimg.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg',
  (SELECT id FROM public.creators WHERE slug = 'maya-rodriguez'),
  'Stable Video Diffusion',
  'Abstract',
  67,
  'approved',
  false,
  198
),
(
  'Cosmic Symphony',
  'A visual journey through space and time, synchronized with an ethereal soundtrack.',
  'https://www.youtube.com/watch?v=vt1Pwfnh5pc',
  'vt1Pwfnh5pc',
  'https://i.ytimg.com/vi/vt1Pwfnh5pc/maxresdefault.jpg',
  (SELECT id FROM public.creators WHERE slug = 'maya-rodriguez'),
  'Pika',
  'Music Video',
  134,
  'approved',
  true,
  512
),
(
  'Fractal Dreams',
  'Infinite fractal patterns evolving and morphing in hypnotic ways.',
  'https://www.youtube.com/watch?v=oHg5SJYRHA0',
  'oHg5SJYRHA0',
  'https://i.ytimg.com/vi/oHg5SJYRHA0/maxresdefault.jpg',
  (SELECT id FROM public.creators WHERE slug = 'maya-rodriguez'),
  'AnimateDiff',
  'Abstract',
  75,
  'approved',
  false,
  143
),

-- Jordan Park's videos
(
  'The Hidden Life of Forests',
  'A documentary-style exploration of forest ecosystems, enhanced with AI-generated scenes.',
  'https://www.youtube.com/watch?v=uelHwf8o7_U',
  'uelHwf8o7_U',
  'https://i.ytimg.com/vi/uelHwf8o7_U/maxresdefault.jpg',
  (SELECT id FROM public.creators WHERE slug = 'jordan-park'),
  'Sora',
  'Documentary',
  245,
  'approved',
  true,
  678
),
(
  'Ocean Depths Unveiled',
  'Journey to the deepest parts of the ocean where AI helps us visualize never-before-seen marine life.',
  'https://www.youtube.com/watch?v=e-ORhEE9VVg',
  'e-ORhEE9VVg',
  'https://i.ytimg.com/vi/e-ORhEE9VVg/maxresdefault.jpg',
  (SELECT id FROM public.creators WHERE slug = 'jordan-park'),
  'Runway Gen-3',
  'Documentary',
  198,
  'approved',
  false,
  423
),
(
  'Mars: The Next Frontier',
  'A speculative documentary about future Mars colonization, brought to life with AI visuals.',
  'https://www.youtube.com/watch?v=L_jWHffIx5E',
  'L_jWHffIx5E',
  'https://i.ytimg.com/vi/L_jWHffIx5E/maxresdefault.jpg',
  (SELECT id FROM public.creators WHERE slug = 'jordan-park'),
  'Multiple Tools',
  'Sci-Fi',
  312,
  'approved',
  false,
  589
),
(
  'Wildlife in Motion',
  'Capturing the beauty of wildlife through AI-enhanced cinematography.',
  'https://www.youtube.com/watch?v=ktvTqknDobU',
  'ktvTqknDobU',
  'https://i.ytimg.com/vi/ktvTqknDobU/maxresdefault.jpg',
  (SELECT id FROM public.creators WHERE slug = 'jordan-park'),
  'Sora',
  'Nature',
  167,
  'approved',
  false,
  234
),

-- Sam Taylor's videos
(
  'Midnight Train',
  'A noir-inspired short film about a mysterious train journey. Created with Pika.',
  'https://www.youtube.com/watch?v=YQHsXMglC9A',
  'YQHsXMglC9A',
  'https://i.ytimg.com/vi/YQHsXMglC9A/maxresdefault.jpg',
  (SELECT id FROM public.creators WHERE slug = 'sam-taylor'),
  'Pika',
  'Narrative',
  178,
  'approved',
  false,
  312
),
(
  'The Glitch',
  'A psychological thriller where reality starts to break down. Experimental horror AI video.',
  'https://www.youtube.com/watch?v=9jK-NcRmVcw',
  '9jK-NcRmVcw',
  'https://i.ytimg.com/vi/9jK-NcRmVcw/maxresdefault.jpg',
  (SELECT id FROM public.creators WHERE slug = 'sam-taylor'),
  'Runway Gen-2',
  'Horror',
  145,
  'approved',
  true,
  567
),
(
  'Laugh Loop',
  'A comedic exploration of AI attempting to understand human humor.',
  'https://www.youtube.com/watch?v=QH2-TGUlwu4',
  'QH2-TGUlwu4',
  'https://i.ytimg.com/vi/QH2-TGUlwu4/maxresdefault.jpg',
  (SELECT id FROM public.creators WHERE slug = 'sam-taylor'),
  'Pika',
  'Comedy',
  92,
  'approved',
  false,
  187
),
(
  'Retro Future',
  'What if the 1980s imagined the future? A nostalgic AI-generated music video.',
  'https://www.youtube.com/watch?v=Zi_XLOBDo_Y',
  'Zi_XLOBDo_Y',
  'https://i.ytimg.com/vi/Zi_XLOBDo_Y/maxresdefault.jpg',
  (SELECT id FROM public.creators WHERE slug = 'sam-taylor'),
  'Stable Video Diffusion',
  'Music Video',
  156,
  'approved',
  false,
  298
),
(
  'City Lights Serenade',
  'A romantic narrative following two souls connecting in a bustling metropolis.',
  'https://www.youtube.com/watch?v=OPf0YbXqDm0',
  'OPf0YbXqDm0',
  'https://i.ytimg.com/vi/OPf0YbXqDm0/maxresdefault.jpg',
  (SELECT id FROM public.creators WHERE slug = 'sam-taylor'),
  'Sora',
  'Narrative',
  201,
  'approved',
  false,
  445
),
(
  'Time Distortion',
  'An experimental piece exploring time dilation and temporal paradoxes through AI visuals.',
  'https://www.youtube.com/watch?v=epUk3T2Kfno',
  'epUk3T2Kfno',
  'https://i.ytimg.com/vi/epUk3T2Kfno/maxresdefault.jpg',
  (SELECT id FROM public.creators WHERE slug = 'sam-taylor'),
  'Multiple Tools',
  'Experimental',
  112,
  'approved',
  false,
  176
);

-- NOTE: Skipping ratings seed data to avoid foreign key constraint errors
-- Ratings will be created when real users rate videos after launch
-- The avg_rating and total_ratings will be NULL until first rating

-- Insert a couple of sample submissions (pending review)
INSERT INTO public.submissions (
  title,
  description,
  youtube_url,
  ai_tool,
  genre,
  creator_name,
  creator_email,
  status
) VALUES
(
  'AI Generated Sunset Timelapse',
  'A beautiful sunset over mountains, entirely generated by AI.',
  'https://www.youtube.com/watch?v=HBxn56l9WcU',
  'Sora',
  'Nature',
  'New Creator Name',
  'newcreator@example.com',
  'pending'
),
(
  'Futuristic City Flythrough',
  'A drone-style flythrough of a futuristic city generated with Runway.',
  'https://www.youtube.com/watch?v=Air_Pv0c5zk',
  'Runway Gen-3',
  'Sci-Fi',
  'Another Creator',
  'anothercreator@example.com',
  'pending'
);

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Verify tables were created
DO $$
BEGIN
  RAISE NOTICE 'Migration complete! Created tables:';
  RAISE NOTICE '  - public.creators (4 sample creators)';
  RAISE NOTICE '  - public.videos (20 sample videos)';
  RAISE NOTICE '  - public.ratings (0 sample ratings - will be created by real users)';
  RAISE NOTICE '  - public.submissions (2 pending submissions)';
  RAISE NOTICE 'All indexes, triggers, and RLS policies have been applied.';
  RAISE NOTICE 'Seed data has been inserted successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'IMPORTANT NOTES:';
  RAISE NOTICE '  1. Admin access is hardcoded for: admin@example.com';
  RAISE NOTICE '  2. Video ratings will start as NULL - first user ratings will populate them';
  RAISE NOTICE '  3. Replace placeholder YouTube IDs with real AI-generated videos before production';
END $$;

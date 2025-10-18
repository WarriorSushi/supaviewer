-- Fix RLS Policies for Anonymous Access
-- This migration fixes the "permission denied for table users" error

-- =============================================================================
-- DROP OLD POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Anyone can view approved videos" ON public.videos;
DROP POLICY IF EXISTS "Admins can insert videos" ON public.videos;
DROP POLICY IF EXISTS "Admins can update videos" ON public.videos;
DROP POLICY IF EXISTS "Admins can delete videos" ON public.videos;

DROP POLICY IF EXISTS "Anyone can view creators" ON public.creators;
DROP POLICY IF EXISTS "Admins can insert creators" ON public.creators;
DROP POLICY IF EXISTS "Creators can update their own profile" ON public.creators;
DROP POLICY IF EXISTS "Admins can delete creators" ON public.creators;

-- =============================================================================
-- CREATE NEW POLICIES (FIXED)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- CREATORS POLICIES (Fixed to not require auth.users access for reading)
-- ---------------------------------------------------------------------------

-- Anyone can read creators (no auth check needed)
CREATE POLICY "Anyone can view creators"
  ON public.creators
  FOR SELECT
  USING (true);

-- Only authenticated admins can insert creators
CREATE POLICY "Admins can insert creators"
  ON public.creators
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.jwt() ->> 'email' = 'admin@example.com'
  );

-- Admins and creators can update profiles
CREATE POLICY "Creators can update their own profile"
  ON public.creators
  FOR UPDATE
  USING (
    user_id = auth.uid() OR
    (auth.uid() IS NOT NULL AND auth.jwt() ->> 'email' = 'admin@example.com')
  );

-- Only admins can delete creators
CREATE POLICY "Admins can delete creators"
  ON public.creators
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND
    auth.jwt() ->> 'email' = 'admin@example.com'
  );

-- ---------------------------------------------------------------------------
-- VIDEOS POLICIES (Fixed to allow anonymous reads of approved videos)
-- ---------------------------------------------------------------------------

-- Anyone can view approved videos (no auth check)
-- Authenticated users can see their own videos
-- Admins can see all videos
CREATE POLICY "Anyone can view approved videos"
  ON public.videos
  FOR SELECT
  USING (
    status = 'approved' OR
    (
      auth.uid() IS NOT NULL AND
      (
        creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid()) OR
        auth.jwt() ->> 'email' = 'admin@example.com'
      )
    )
  );

-- Only admins can insert videos
CREATE POLICY "Admins can insert videos"
  ON public.videos
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.jwt() ->> 'email' = 'admin@example.com'
  );

-- Only admins can update videos
CREATE POLICY "Admins can update videos"
  ON public.videos
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    auth.jwt() ->> 'email' = 'admin@example.com'
  );

-- Only admins can delete videos
CREATE POLICY "Admins can delete videos"
  ON public.videos
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND
    auth.jwt() ->> 'email' = 'admin@example.com'
  );

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE 'RLS policies updated successfully!';
  RAISE NOTICE 'Changes:';
  RAISE NOTICE '  - Removed dependency on auth.users table for anonymous reads';
  RAISE NOTICE '  - Used auth.jwt() ->> email instead for admin checks';
  RAISE NOTICE '  - Anonymous users can now read approved videos and all creators';
  RAISE NOTICE '';
  RAISE NOTICE 'Test by visiting your homepage - videos should now appear!';
END $$;

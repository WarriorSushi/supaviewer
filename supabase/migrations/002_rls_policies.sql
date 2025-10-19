-- ============================================
-- Row Level Security (RLS) Policies for SupaViewer
-- ============================================
-- Simplified version using direct email matching
-- IMPORTANT: Replace 'YOUR_ADMIN_EMAIL@EXAMPLE.COM' with your actual admin email
-- ============================================

-- ============================================
-- CREATORS TABLE POLICIES
-- ============================================

-- Enable RLS on creators table
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (for re-running this migration)
DROP POLICY IF EXISTS "Public can view creators" ON creators;
DROP POLICY IF EXISTS "Authenticated users can create creators" ON creators;
DROP POLICY IF EXISTS "Users can update own creator profile" ON creators;
DROP POLICY IF EXISTS "Admins can update any creator" ON creators;
DROP POLICY IF EXISTS "Admins can delete creators" ON creators;

-- Allow anyone to read all creators (needed for public browsing)
CREATE POLICY "Public can view creators"
ON creators
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to create creators
-- They can only set their own user_id or leave it null
CREATE POLICY "Authenticated users can create creators"
ON creators
FOR INSERT
TO authenticated
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);

-- Allow users to update their own creator profiles
CREATE POLICY "Users can update own creator profile"
ON creators
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow admins to update any creator profile
-- REPLACE 'YOUR_ADMIN_EMAIL@EXAMPLE.COM' WITH YOUR ACTUAL ADMIN EMAIL
CREATE POLICY "Admins can update any creator"
ON creators
FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'YOUR_ADMIN_EMAIL@EXAMPLE.COM'
);

-- Allow admins to delete creators
-- REPLACE 'YOUR_ADMIN_EMAIL@EXAMPLE.COM' WITH YOUR ACTUAL ADMIN EMAIL
CREATE POLICY "Admins can delete creators"
ON creators
FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'YOUR_ADMIN_EMAIL@EXAMPLE.COM'
);


-- ============================================
-- VIDEOS TABLE POLICIES
-- ============================================

-- Enable RLS on videos table
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view approved videos" ON videos;
DROP POLICY IF EXISTS "Authenticated users can view all videos" ON videos;
DROP POLICY IF EXISTS "Authenticated users can submit videos" ON videos;
DROP POLICY IF EXISTS "Admins can create videos with any status" ON videos;
DROP POLICY IF EXISTS "Admins can update videos" ON videos;
DROP POLICY IF EXISTS "Admins can delete videos" ON videos;

-- Allow anyone to read approved videos only
CREATE POLICY "Public can view approved videos"
ON videos
FOR SELECT
TO public
USING (status = 'approved');

-- Allow authenticated users to view all videos (needed for admin dashboard)
CREATE POLICY "Authenticated users can view all videos"
ON videos
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to submit videos (with pending status only)
-- This ensures all public submissions go through moderation
CREATE POLICY "Authenticated users can submit videos"
ON videos
FOR INSERT
TO authenticated
WITH CHECK (
  status = 'pending' AND
  (submitted_by_user_id IS NULL OR submitted_by_user_id = auth.uid())
);

-- Allow admins to insert videos with any status
-- REPLACE 'YOUR_ADMIN_EMAIL@EXAMPLE.COM' WITH YOUR ACTUAL ADMIN EMAIL
CREATE POLICY "Admins can create videos with any status"
ON videos
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'email' = 'YOUR_ADMIN_EMAIL@EXAMPLE.COM'
);

-- Allow admins to update any video (approve, reject, edit, etc.)
-- REPLACE 'YOUR_ADMIN_EMAIL@EXAMPLE.COM' WITH YOUR ACTUAL ADMIN EMAIL
CREATE POLICY "Admins can update videos"
ON videos
FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'YOUR_ADMIN_EMAIL@EXAMPLE.COM'
);

-- Allow admins to delete videos
-- REPLACE 'YOUR_ADMIN_EMAIL@EXAMPLE.COM' WITH YOUR ACTUAL ADMIN EMAIL
CREATE POLICY "Admins can delete videos"
ON videos
FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'YOUR_ADMIN_EMAIL@EXAMPLE.COM'
);


-- ============================================
-- RATINGS TABLE POLICIES
-- ============================================

-- Enable RLS on ratings table
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view ratings" ON ratings;
DROP POLICY IF EXISTS "Authenticated users can create ratings" ON ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON ratings;
DROP POLICY IF EXISTS "Users can delete own ratings" ON ratings;
DROP POLICY IF EXISTS "Admins can delete any rating" ON ratings;

-- Allow anyone to read ratings (needed for displaying average ratings)
CREATE POLICY "Public can view ratings"
ON ratings
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to create ratings
-- They can only create ratings with their own user_id
CREATE POLICY "Authenticated users can create ratings"
ON ratings
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow users to update only their own ratings
CREATE POLICY "Users can update own ratings"
ON ratings
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow users to delete only their own ratings
CREATE POLICY "Users can delete own ratings"
ON ratings
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Allow admins to delete any rating (moderation)
-- REPLACE 'YOUR_ADMIN_EMAIL@EXAMPLE.COM' WITH YOUR ACTUAL ADMIN EMAIL
CREATE POLICY "Admins can delete any rating"
ON ratings
FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'YOUR_ADMIN_EMAIL@EXAMPLE.COM'
);

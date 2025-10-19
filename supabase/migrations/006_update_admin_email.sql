-- Update admin email in all RLS policies
-- This fixes the admin access issue by setting the correct admin email

-- ============================================
-- CREATORS TABLE - Update Admin Policies
-- ============================================

DROP POLICY IF EXISTS "Admins can update any creator" ON creators;
DROP POLICY IF EXISTS "Admins can delete creators" ON creators;

CREATE POLICY "Admins can update any creator"
ON creators
FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'drsyedirfan93@gmail.com'
);

CREATE POLICY "Admins can delete creators"
ON creators
FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'drsyedirfan93@gmail.com'
);


-- ============================================
-- VIDEOS TABLE - Update Admin Policies
-- ============================================

DROP POLICY IF EXISTS "Admins can create videos with any status" ON videos;
DROP POLICY IF EXISTS "Admins can update videos" ON videos;
DROP POLICY IF EXISTS "Admins can delete videos" ON videos;

CREATE POLICY "Admins can create videos with any status"
ON videos
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'email' = 'drsyedirfan93@gmail.com'
);

CREATE POLICY "Admins can update videos"
ON videos
FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'drsyedirfan93@gmail.com'
);

CREATE POLICY "Admins can delete videos"
ON videos
FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'drsyedirfan93@gmail.com'
);


-- ============================================
-- RATINGS TABLE - Update Admin Policies
-- ============================================

DROP POLICY IF EXISTS "Admins can delete any rating" ON ratings;

CREATE POLICY "Admins can delete any rating"
ON ratings
FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'drsyedirfan93@gmail.com'
);

-- Migration: Convert rating system from 1-10 to 1-5 stars
-- This migration updates the existing database to support 5-star ratings with half-star precision
-- Run this in Supabase SQL Editor AFTER the initial schema has been created

-- =============================================================================
-- STEP 1: Convert existing data (if any exists)
-- =============================================================================

-- Convert existing ratings from 1-10 scale to 1-5 scale (divide by 2)
UPDATE public.ratings
SET rating = rating / 2.0
WHERE rating IS NOT NULL;

-- Convert existing avg_rating in videos table from 1-10 scale to 1-5 scale
UPDATE public.videos
SET avg_rating = avg_rating / 2.0
WHERE avg_rating IS NOT NULL;

-- =============================================================================
-- STEP 2: Modify table structure for 5-star system
-- =============================================================================

-- Drop the old rating constraint (1-10 range)
ALTER TABLE public.ratings
  DROP CONSTRAINT IF EXISTS rating_range;

-- Change rating column from INTEGER to DECIMAL(2,1) to support half-stars (e.g., 3.5)
ALTER TABLE public.ratings
  ALTER COLUMN rating TYPE DECIMAL(2,1);

-- Add new constraint for 1.0-5.0 range with half-star precision
ALTER TABLE public.ratings
  ADD CONSTRAINT rating_range CHECK (rating >= 1.0 AND rating <= 5.0);

-- Update videos table avg_rating column type for consistency
-- Already DECIMAL(3,2) which supports 5-star system, but let's ensure it's correct
ALTER TABLE public.videos
  ALTER COLUMN avg_rating TYPE DECIMAL(3,2);

-- =============================================================================
-- VERIFICATION (Optional - comment out if not needed)
-- =============================================================================

-- Check min/max ratings to verify conversion
-- SELECT
--   MIN(rating) as min_rating,
--   MAX(rating) as max_rating,
--   AVG(rating) as avg_rating,
--   COUNT(*) as total_ratings
-- FROM public.ratings;

-- Check videos avg_rating
-- SELECT
--   MIN(avg_rating) as min_avg,
--   MAX(avg_rating) as max_avg,
--   COUNT(*) as videos_with_ratings
-- FROM public.videos
-- WHERE avg_rating IS NOT NULL;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
-- All ratings are now on a 1.0-5.0 scale with 0.5 increment precision
-- Half-star ratings like 3.5, 4.5 are now supported

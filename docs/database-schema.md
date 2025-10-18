# Database Schema

## Overview

SupaViewer uses PostgreSQL via Supabase. The schema is designed for simplicity, performance, and future extensibility. All tables include timestamps for audit trails. Row Level Security (RLS) enforces permissions at the database level.

## Schema Principles

- **Normalization**: Proper relationships, no data duplication
- **Extensibility**: Easy to add fields without breaking existing functionality
- **Performance**: Indexes on frequently queried fields
- **Security**: RLS policies on all tables
- **Auditability**: Created/updated timestamps on all tables

---

## Tables

### videos

Stores all AI-generated videos submitted to the platform.

**Columns**:

- `id` - UUID, Primary Key, Default: `gen_random_uuid()`
- `created_at` - Timestamp with timezone, Default: `now()`
- `updated_at` - Timestamp with timezone, Default: `now()`
- `title` - Text, NOT NULL
  - Video title, max recommended 120 characters
- `description` - Text, Nullable
  - Optional longer description of the video
- `youtube_url` - Text, NOT NULL, UNIQUE
  - Full YouTube URL (e.g., https://www.youtube.com/watch?v=...)
- `youtube_id` - Text, NOT NULL
  - Extracted YouTube video ID (e.g., dQw4w9WgXcQ)
  - Used for embedding
- `thumbnail_url` - Text, NOT NULL
  - YouTube thumbnail URL, fetched automatically
- `creator_id` - UUID, Foreign Key to `creators.id`, NOT NULL
  - Who created/submitted this video
- `ai_tool` - Text, NOT NULL
  - AI tool used (e.g., "Sora", "Runway Gen-3", "Pika", "Multiple")
- `genre` - Text, Nullable
  - Genre (e.g., "Sci-Fi", "Documentary", "Abstract", "Narrative")
- `duration_seconds` - Integer, NOT NULL
  - Video duration in seconds
  - Must be >= 30 (enforced in app logic)
- `status` - Text, NOT NULL, Default: 'pending'
  - Possible values: 'pending', 'approved', 'rejected'
  - Admin controls this
- `featured` - Boolean, NOT NULL, Default: false
  - Whether video is featured on homepage
- `avg_rating` - Decimal (3,2), Default: null
  - Calculated average rating (e.g., 8.5)
  - Updated when ratings change
- `total_ratings` - Integer, NOT NULL, Default: 0
  - Count of ratings
  - Updated when ratings change
- `view_count` - Integer, NOT NULL, Default: 0
  - Number of times video page was viewed

**Indexes**:
- Primary key on `id`
- Unique index on `youtube_url`
- Index on `creator_id` for fast creator lookups
- Index on `status` for filtering
- Index on `featured` for homepage queries
- Index on `avg_rating DESC` for top-rated queries
- Index on `created_at DESC` for newest-first queries

**Constraints**:
- Foreign key: `creator_id` references `creators(id)` ON DELETE CASCADE
- Check constraint: `status` must be in ('pending', 'approved', 'rejected')

---

### creators

Stores information about video creators.

**Columns**:

- `id` - UUID, Primary Key, Default: `gen_random_uuid()`
- `created_at` - Timestamp with timezone, Default: `now()`
- `updated_at` - Timestamp with timezone, Default: `now()`
- `name` - Text, NOT NULL
  - Creator's display name
- `slug` - Text, NOT NULL, UNIQUE
  - URL-friendly version of name (e.g., "john-smith")
  - Used in URLs: /creator/john-smith
- `bio` - Text, Nullable
  - Short bio about the creator
  - Max recommended: 500 characters
- `website` - Text, Nullable
  - Creator's website or portfolio URL
- `twitter_handle` - Text, Nullable
  - Twitter/X username (without @)
- `avatar_url` - Text, Nullable
  - URL to creator's avatar image
  - Future: Store in Supabase Storage
- `user_id` - UUID, Foreign Key to `auth.users.id`, Nullable
  - Links creator to a user account
  - Null if admin-created profile without user account
  - When not null, creator can claim/edit their profile

**Indexes**:
- Primary key on `id`
- Unique index on `slug`
- Index on `user_id` for user→creator lookups

**Constraints**:
- Foreign key: `user_id` references `auth.users(id)` ON DELETE SET NULL
- Check constraint: `slug` must be lowercase, alphanumeric + hyphens only

---

### ratings

Stores individual ratings from users.

**Columns**:

- `id` - UUID, Primary Key, Default: `gen_random_uuid()`
- `created_at` - Timestamp with timezone, Default: `now()`
- `updated_at` - Timestamp with timezone, Default: `now()`
- `video_id` - UUID, Foreign Key to `videos.id`, NOT NULL
- `user_id` - UUID, Foreign Key to `auth.users.id`, NOT NULL
- `rating` - Decimal(2,1), NOT NULL
  - Rating value from 1.0 to 5.0 (half-star precision)
  - 5.0 = highest quality

**Indexes**:
- Primary key on `id`
- Index on `video_id` for fast video→ratings lookups
- Index on `user_id` for user rating history
- Unique composite index on `(video_id, user_id)` - one rating per user per video

**Constraints**:
- Foreign key: `video_id` references `videos(id)` ON DELETE CASCADE
- Foreign key: `user_id` references `auth.users(id)` ON DELETE CASCADE
- Check constraint: `rating` >= 1.0 AND `rating` <= 5.0
- Unique constraint: `(video_id, user_id)` - prevents duplicate ratings

---

### submissions

Stores video submissions before they're approved/rejected.

**Columns**:

- `id` - UUID, Primary Key, Default: `gen_random_uuid()`
- `created_at` - Timestamp with timezone, Default: `now()`
- `title` - Text, NOT NULL
- `description` - Text, Nullable
- `youtube_url` - Text, NOT NULL
- `ai_tool` - Text, NOT NULL
- `genre` - Text, Nullable
- `creator_name` - Text, NOT NULL
  - Submitter's name (may not match existing creator)
- `creator_email` - Text, Nullable
  - For follow-up
- `creator_website` - Text, Nullable
- `user_id` - UUID, Foreign Key to `auth.users.id`, Nullable
  - If submitted by logged-in user
- `status` - Text, NOT NULL, Default: 'pending'
  - Possible values: 'pending', 'approved', 'rejected'
- `admin_notes` - Text, Nullable
  - Internal notes from admin review
- `processed_at` - Timestamp with timezone, Nullable
  - When admin approved/rejected
- `video_id` - UUID, Foreign Key to `videos.id`, Nullable
  - If approved, links to created video

**Indexes**:
- Primary key on `id`
- Index on `status` for filtering pending submissions
- Index on `created_at DESC` for chronological order
- Index on `user_id` for user submission history

**Constraints**:
- Foreign key: `user_id` references `auth.users(id)` ON DELETE SET NULL
- Foreign key: `video_id` references `videos(id)` ON DELETE SET NULL
- Check constraint: `status` must be in ('pending', 'approved', 'rejected')

---

## Relationships

```
auth.users (Supabase built-in)
  ├─ has many → ratings (one user can rate many videos)
  ├─ has one → creators (user can claim creator profile)
  └─ has many → submissions (user can submit many videos)

creators
  ├─ has many → videos (one creator can have many videos)
  └─ belongs to → auth.users (optional, if profile is claimed)

videos
  ├─ belongs to → creators (every video has one creator)
  └─ has many → ratings (one video can have many ratings)

ratings
  ├─ belongs to → videos
  └─ belongs to → auth.users

submissions
  ├─ belongs to → auth.users (optional)
  └─ references → videos (if approved)
```

---

## Calculated Fields

### videos.avg_rating and videos.total_ratings

These are denormalized for performance. Updated via database trigger or application logic when ratings change.

**Update Logic**:
When a rating is inserted/updated/deleted:
1. Recalculate average rating for that video
2. Update `videos.avg_rating` and `videos.total_ratings`

**Database Trigger** (optional):
```sql
-- Trigger function to update video ratings
-- This is the SQL logic, implement in Supabase
```

Or handle in application layer after rating mutations.

---

## Enums / Valid Values

### video.status
- `pending` - Awaiting admin review
- `approved` - Live on the platform
- `rejected` - Admin rejected, not visible

### submission.status
- `pending` - Awaiting admin review
- `approved` - Processed and video created
- `rejected` - Admin rejected submission

### video.ai_tool (Common Values)
- "Sora"
- "Runway Gen-3"
- "Runway Gen-2"
- "Pika"
- "Stable Video Diffusion"
- "AnimateDiff"
- "Multiple Tools"
- "Other"

These are not enforced constraints (to allow new tools), but these are the common values.

### video.genre (Common Values)
- "Sci-Fi"
- "Abstract"
- "Narrative"
- "Documentary"
- "Music Video"
- "Experimental"
- "Comedy"
- "Horror"
- "Nature"
- "Other"

Again, not enforced constraints for flexibility.

---

## Row Level Security (RLS) Policies

All tables must have RLS enabled. Here are the access rules:

### videos table

**SELECT (Read)**:
- Anyone can read approved videos (no auth required)
- Admins can read all videos
- Creator can read their own pending/rejected videos

**INSERT (Create)**:
- Admins only (via video creation from approved submissions)

**UPDATE (Edit)**:
- Admins only

**DELETE**:
- Admins only

### creators table

**SELECT (Read)**:
- Anyone can read (no auth required)

**INSERT (Create)**:
- Admins only

**UPDATE (Edit)**:
- Admins can edit all
- Creator can edit their own profile (if user_id matches)

**DELETE**:
- Admins only

### ratings table

**SELECT (Read)**:
- Anyone can read all ratings (for calculating averages)
- Users can see their own ratings

**INSERT (Create)**:
- Authenticated users only
- User can only create rating with their own user_id

**UPDATE (Edit)**:
- Users can update their own ratings only
- Update timestamp must be tracked

**DELETE**:
- Users can delete their own ratings only
- Admins can delete any rating

### submissions table

**SELECT (Read)**:
- Admins can see all submissions
- Users can see their own submissions

**INSERT (Create)**:
- Anyone (authenticated or not) can submit
- If authenticated, user_id is auto-set

**UPDATE (Edit)**:
- Admins only (for status changes, notes)

**DELETE**:
- Admins only

---

## Indexes Strategy

### Performance-Critical Queries

**Homepage (Featured Videos)**:
- Index: `videos(featured, status, created_at DESC)`
- Query: WHERE status = 'approved' AND featured = true ORDER BY created_at DESC

**Browse Page (All Videos)**:
- Index: `videos(status, created_at DESC)`
- Index: `videos(status, avg_rating DESC)`
- Query: WHERE status = 'approved' ORDER BY [created_at or avg_rating] DESC

**Creator Page**:
- Index: `videos(creator_id, status, created_at DESC)`
- Query: WHERE creator_id = X AND status = 'approved' ORDER BY created_at DESC

**Admin Dashboard**:
- Index: `submissions(status, created_at DESC)`
- Query: WHERE status = 'pending' ORDER BY created_at DESC

**Video Detail Page**:
- Index: Primary key on videos.id (automatic)
- Join with creators via creator_id (indexed as FK)

---

## Migration Strategy

### Initial Setup

Create tables in this order (respecting foreign keys):
1. creators
2. videos
3. ratings
4. submissions

### Future Schema Changes

When adding new fields:
- Add as nullable initially
- Backfill data if needed
- Make NOT NULL if required
- Add indexes as needed

Always test migrations on staging environment first.

---

## Data Validation

### Application-Level Validation

Before inserting into database:

**Videos**:
- YouTube URL format is valid
- Duration >= 30 seconds
- Title is 1-120 characters
- AI tool is from known list (warn if not)

**Ratings**:
- User hasn't already rated this video
- Rating is decimal 1.0-5.0 (0.5 increments)

**Creators**:
- Slug generation from name (lowercase, replace spaces with hyphens)
- Slug uniqueness check
- Website URL format if provided

**Submissions**:
- All required fields present
- YouTube URL valid and video exists
- Email format valid if provided

### Database-Level Validation

- Check constraints on rating values
- Check constraints on status enums
- Foreign key constraints enforced
- Unique constraints on youtube_url, creator slug, etc.

---

## Backup & Maintenance

### Automated Backups
Supabase handles daily backups automatically.

### Data Retention
- Keep all submissions (even rejected) for audit trail
- Keep deleted ratings in case of disputes (soft delete option)
- Archive old pending submissions after 90 days

### Cleanup Tasks
- Remove duplicate submissions (same youtube_url)
- Archive processed submissions older than 6 months

---

## Future Considerations

### Potential New Tables

**video_collections**:
- Curated playlists/collections
- Admin or community-created

**comments**:
- If adding discussion features
- Would need moderation system

**likes/favorites**:
- Users bookmarking videos
- Simple many-to-many table

**tags**:
- More flexible than genre
- Many-to-many relationship with videos

**notifications**:
- User notification system
- Creator notified when video approved

**api_keys**:
- If building public API
- Rate limiting info

These are NOT in MVP, but schema should allow easy addition.
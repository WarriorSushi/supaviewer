# API Routes

## Overview

SupaViewer uses Next.js Route Handlers for API endpoints and Server Actions for mutations. This document outlines all backend endpoints, their purposes, and expected behavior.

**Architecture Decision**: 
- Use Route Handlers for external-facing APIs and complex logic
- Use Server Actions for form submissions and simple mutations
- Query Supabase directly from Server Components for reads when possible

---

## Route Handler Conventions

### File Location
All route handlers in `/app/api/[endpoint]/route.ts`

### HTTP Methods
- `GET` - Retrieve data
- `POST` - Create new resource
- `PUT` or `PATCH` - Update existing resource
- `DELETE` - Delete resource

### Response Format
All responses return JSON with consistent structure:

**Success Response**:
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (logged in but insufficient permissions)
- `404` - Not found
- `500` - Server error

---

## Public API Routes

### GET /api/videos

**Purpose**: Get list of videos with filtering and pagination

**Authentication**: None required

**Query Parameters**:
- `page` (number): Page number, default 1
- `limit` (number): Results per page, default 20, max 50
- `sort` (string): Sort order - "newest", "rating", "views", default "newest"
- `ai_tool` (string): Filter by AI tool
- `genre` (string): Filter by genre
- `min_rating` (number): Minimum rating (1-10)
- `search` (string): Search in title, description, creator name

**Response**:
```json
{
  "success": true,
  "data": {
    "videos": [
      {
        "id": "uuid",
        "title": "Amazing AI Video",
        "thumbnail_url": "https://...",
        "creator": {
          "id": "uuid",
          "name": "Creator Name",
          "slug": "creator-slug"
        },
        "ai_tool": "Sora",
        "genre": "Sci-Fi",
        "avg_rating": 8.5,
        "total_ratings": 42,
        "view_count": 1500,
        "duration_seconds": 120,
        "created_at": "2025-01-15T10:30:00Z"
      }
      // ... more videos
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "total_pages": 8
    }
  }
}
```

**Logic**:
1. Parse and validate query parameters
2. Build Supabase query with filters
3. Apply sorting
4. Execute query with pagination
5. Return formatted results

---

### GET /api/videos/[id]

**Purpose**: Get single video details

**Authentication**: None required

**Path Parameter**:
- `id` (string): Video UUID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Amazing AI Video",
    "description": "Full description...",
    "youtube_url": "https://youtube.com/watch?v=...",
    "youtube_id": "...",
    "thumbnail_url": "https://...",
    "creator": {
      "id": "uuid",
      "name": "Creator Name",
      "slug": "creator-slug",
      "avatar_url": "https://...",
      "bio": "Short bio"
    },
    "ai_tool": "Sora",
    "genre": "Sci-Fi",
    "duration_seconds": 120,
    "avg_rating": 8.5,
    "total_ratings": 42,
    "view_count": 1500,
    "featured": false,
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Logic**:
1. Fetch video by ID from database
2. Join with creator table
3. Check if video status is "approved" (hide others from public)
4. Return 404 if not found or not approved
5. Increment view_count (async, don't block response)

---

### GET /api/videos/[id]/related

**Purpose**: Get related videos for a video

**Authentication**: None required

**Path Parameter**:
- `id` (string): Video UUID

**Query Parameters**:
- `limit` (number): Number of results, default 6, max 12

**Response**:
```json
{
  "success": true,
  "data": {
    "videos": [
      /* Same structure as GET /api/videos */
    ]
  }
}
```

**Logic**:
1. Get the video details
2. Find related videos by:
   - Same creator (priority)
   - Same genre
   - Same AI tool
   - Similar rating
3. Exclude current video
4. Randomize order slightly for variety
5. Return limited results

---

### GET /api/creators

**Purpose**: Get list of creators

**Authentication**: None required

**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Results per page
- `sort` (string): "name", "videos", "rating"
- `search` (string): Search creator names

**Response**:
```json
{
  "success": true,
  "data": {
    "creators": [
      {
        "id": "uuid",
        "name": "Creator Name",
        "slug": "creator-slug",
        "avatar_url": "https://...",
        "bio": "Short bio",
        "website": "https://...",
        "video_count": 12,
        "avg_rating": 8.2
      }
      // ... more creators
    ],
    "pagination": { /* same structure */ }
  }
}
```

**Logic**:
1. Query creators table
2. Calculate video_count and avg_rating (join or aggregate)
3. Apply search/sort
4. Paginate
5. Return results

---

### GET /api/creators/[slug]

**Purpose**: Get single creator profile with videos

**Authentication**: None required

**Path Parameter**:
- `slug` (string): Creator slug

**Response**:
```json
{
  "success": true,
  "data": {
    "creator": {
      "id": "uuid",
      "name": "Creator Name",
      "slug": "creator-slug",
      "bio": "Full bio...",
      "avatar_url": "https://...",
      "website": "https://...",
      "twitter_handle": "handle",
      "video_count": 12,
      "avg_rating": 8.2
    },
    "videos": [
      /* Same structure as GET /api/videos */
    ]
  }
}
```

**Logic**:
1. Find creator by slug
2. Return 404 if not found
3. Get all approved videos by this creator
4. Sort videos by newest first
5. Calculate aggregate stats
6. Return complete profile

---

### POST /api/submissions

**Purpose**: Submit a new video for review

**Authentication**: Optional (works for both guests and logged-in users)

**Request Body**:
```json
{
  "title": "Video Title",
  "description": "Optional description",
  "youtube_url": "https://youtube.com/watch?v=...",
  "ai_tool": "Sora",
  "genre": "Sci-Fi",
  "creator_name": "Creator Name",
  "creator_email": "optional@email.com",
  "creator_website": "https://..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "submission_id": "uuid",
    "status": "pending",
    "message": "Submission received! We'll review within 48 hours."
  }
}
```

**Logic**:
1. Validate all required fields
2. Validate YouTube URL format
3. Fetch video metadata from YouTube API:
   - Video exists and is accessible
   - Get duration (check >= 30 seconds)
   - Get thumbnail URL
4. Check if YouTube URL already submitted
5. Get user_id from session if logged in (otherwise null)
6. Create submission record with status="pending"
7. Send confirmation email if email provided
8. Notify admin of new submission (optional)
9. Return success response

**Validation Errors**:
- Invalid YouTube URL: 400 error
- Video too short (<30s): 400 error
- Already submitted: 400 error
- Missing required fields: 400 error

---

### POST /api/ratings

**Purpose**: Rate a video

**Authentication**: Required

**Request Body**:
```json
{
  "video_id": "uuid",
  "rating": 8
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "rating_id": "uuid",
    "video_id": "uuid",
    "rating": 8,
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Logic**:
1. Check user is authenticated (401 if not)
2. Validate rating (1.0-5.0, 0.5 increments)
3. Check video exists and is approved
4. Check if user already rated this video:
   - If yes, update existing rating
   - If no, insert new rating
5. Recalculate video avg_rating and total_ratings
6. Update videos table
7. Return success response

**Error Handling**:
- Not logged in: 401
- Invalid rating value: 400
- Video not found: 404
- Database error: 500

---

### PATCH /api/ratings/[id]

**Purpose**: Update existing rating

**Authentication**: Required (must own the rating)

**Path Parameter**:
- `id` (string): Rating UUID

**Request Body**:
```json
{
  "rating": 9
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "rating_id": "uuid",
    "rating": 9,
    "updated_at": "2025-01-15T11:00:00Z"
  }
}
```

**Logic**:
1. Check user is authenticated
2. Verify rating belongs to user (403 if not)
3. Validate new rating value
4. Update rating in database
5. Recalculate video averages
6. Return success

---

### DELETE /api/ratings/[id]

**Purpose**: Delete a rating

**Authentication**: Required (must own the rating)

**Path Parameter**:
- `id` (string): Rating UUID

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Rating deleted successfully"
  }
}
```

**Logic**:
1. Check user is authenticated
2. Verify rating belongs to user
3. Delete rating from database
4. Recalculate video averages
5. Return success

---

## Admin API Routes

All admin routes require authentication + admin role check.

### GET /api/admin/submissions

**Purpose**: Get all submissions for admin review

**Authentication**: Required (admin only)

**Query Parameters**:
- `status` (string): "pending", "approved", "rejected", default "pending"
- `page` (number): Page number
- `limit` (number): Results per page

**Response**:
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": "uuid",
        "title": "Video Title",
        "youtube_url": "https://...",
        "thumbnail_url": "https://...",
        "creator_name": "Creator Name",
        "ai_tool": "Sora",
        "genre": "Sci-Fi",
        "duration_seconds": 120,
        "status": "pending",
        "created_at": "2025-01-15T10:30:00Z",
        "user_id": "uuid or null"
      }
      // ... more submissions
    ],
    "pagination": { /* standard */ }
  }
}
```

**Logic**:
1. Verify admin role (403 if not admin)
2. Query submissions table with filters
3. Sort by created_at (oldest first for pending queue)
4. Return results

---

### GET /api/admin/submissions/[id]

**Purpose**: Get submission details for review

**Authentication**: Required (admin only)

**Path Parameter**:
- `id` (string): Submission UUID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Video Title",
    "description": "Full description",
    "youtube_url": "https://...",
    "youtube_id": "...",
    "thumbnail_url": "https://...",
    "creator_name": "Creator Name",
    "creator_email": "email@example.com",
    "creator_website": "https://...",
    "ai_tool": "Sora",
    "genre": "Sci-Fi",
    "duration_seconds": 120,
    "status": "pending",
    "admin_notes": "Previous notes if any",
    "created_at": "2025-01-15T10:30:00Z",
    "user_id": "uuid or null"
  }
}
```

---

### POST /api/admin/submissions/[id]/approve

**Purpose**: Approve submission and create video

**Authentication**: Required (admin only)

**Path Parameter**:
- `id` (string): Submission UUID

**Request Body**:
```json
{
  "creator_id": "uuid",
  "create_new_creator": false,
  "new_creator_data": {
    "name": "Creator Name",
    "bio": "...",
    "website": "..."
  },
  "video_data": {
    "title": "Edited title if needed",
    "description": "Edited description",
    "ai_tool": "Sora",
    "genre": "Sci-Fi",
    "featured": false
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "video_id": "uuid",
    "message": "Video approved and published"
  }
}
```

**Logic**:
1. Verify admin role
2. Get submission details
3. If create_new_creator is true:
   - Create new creator profile
   - Use returned creator_id
4. Create video record with status="approved"
5. Link to creator
6. Update submission status to "approved"
7. Link submission to created video
8. Send notification email if submitter email exists
9. Return success

---

### POST /api/admin/submissions/[id]/reject

**Purpose**: Reject submission

**Authentication**: Required (admin only)

**Path Parameter**:
- `id` (string): Submission UUID

**Request Body**:
```json
{
  "admin_notes": "Reason for rejection",
  "notify_submitter": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Submission rejected"
  }
}
```

**Logic**:
1. Verify admin role
2. Update submission status to "rejected"
3. Save admin notes
4. Set processed_at timestamp
5. Send notification email if requested and email exists
6. Return success

---

### GET /api/admin/videos

**Purpose**: Get all videos (including non-approved)

**Authentication**: Required (admin only)

**Query Parameters**:
- `status` (string): "approved", "pending", "rejected", or "all"
- `page`, `limit`, `sort` (same as public videos endpoint)

**Response**: Same structure as GET /api/videos but includes all statuses

---

### PATCH /api/admin/videos/[id]

**Purpose**: Update video details

**Authentication**: Required (admin only)

**Path Parameter**:
- `id` (string): Video UUID

**Request Body**:
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "creator_id": "uuid",
  "ai_tool": "Runway Gen-3",
  "genre": "Abstract",
  "featured": true,
  "status": "approved"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "video": { /* updated video object */ }
  }
}
```

---

### DELETE /api/admin/videos/[id]

**Purpose**: Delete video

**Authentication**: Required (admin only)

**Path Parameter**:
- `id` (string): Video UUID

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Video deleted successfully"
  }
}
```

**Logic**:
1. Verify admin role
2. Delete video (cascade deletes ratings)
3. Keep submission record for audit
4. Return success

---

### POST /api/admin/creators

**Purpose**: Create new creator profile

**Authentication**: Required (admin only)

**Request Body**:
```json
{
  "name": "Creator Name",
  "slug": "creator-name",
  "bio": "Bio text",
  "website": "https://...",
  "twitter_handle": "handle",
  "avatar_url": "https://..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "creator": { /* creator object */ }
  }
}
```

**Logic**:
1. Verify admin role
2. Validate required fields
3. Generate slug from name if not provided
4. Check slug uniqueness
5. Create creator profile
6. Return success

---

### PATCH /api/admin/creators/[id]

**Purpose**: Update creator profile

**Authentication**: Required (admin only)

**Path Parameter**:
- `id` (string): Creator UUID

**Request Body**: Same as POST /api/admin/creators

**Response**: Same as POST /api/admin/creators

---

## Server Actions

Server Actions are used for form mutations. They live in separate files and are imported into components.

### File: `/app/actions/videos.ts`

#### updateViewCount(videoId: string)
- Increments view counter
- Called when video page loads
- No auth required

### File: `/app/actions/ratings.ts`

#### createOrUpdateRating(videoId: string, rating: number)
- Creates new rating or updates existing
- Requires authentication
- Returns updated video stats

#### deleteRating(ratingId: string)
- Deletes user's rating
- Requires authentication and ownership

### File: `/app/actions/submissions.ts`

#### submitVideo(formData: SubmissionFormData)
- Handles video submission
- Works with or without auth
- Validates and creates submission

---

## Authentication Flow

### Session Management
- Supabase Auth handles sessions
- Use `@supabase/ssr` for Next.js App Router
- Server Components can access session
- Client Components get session via context

### Checking Auth Status
```typescript
// In Route Handler
const supabase = createServerClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
```

### Checking Admin Role
```typescript
// Check if user has admin role
const { data: profile } = await supabase
  .from('user_profiles')
  .select('role')
  .eq('user_id', user.id)
  .single()

if (profile?.role !== 'admin') {
  return Response.json({ error: 'Forbidden' }, { status: 403 })
}
```

---

## Error Handling Pattern

All routes should follow this error handling pattern:

```typescript
try {
  // Route logic
  return Response.json({ success: true, data: result })
} catch (error) {
  console.error('Route error:', error)
  return Response.json(
    { 
      success: false, 
      error: error.message || 'Internal server error',
      code: 'ERROR_CODE'
    },
    { status: 500 }
  )
}
```

---

## Rate Limiting (Future)

Not in MVP, but plan for:
- Per-IP rate limits on submission endpoint
- Per-user rate limits on rating endpoints
- Admin endpoints: No rate limit (trusted users)

Implementation: Use Vercel Edge Config or Redis for rate limiting.

---

## CORS Policy

- All API routes allow same-origin by default
- No CORS needed for MVP (same domain)
- If building public API later, add CORS headers:
  - Allow specific origins
  - Allow GET, POST, PATCH, DELETE
  - Require API key for authentication

---

## Testing Endpoints

For each endpoint, test:
1. Success case with valid data
2. Missing required fields
3. Invalid data format
4. Authentication failure (if required)
5. Permission denied (if admin-only)
6. Not found errors
7. Database errors (simulate)

Use tools: Postman, Thunder Client, or automated tests with Vitest.
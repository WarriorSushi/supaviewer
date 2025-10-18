# User Flows

## Overview

This document maps out all user journeys through SupaViewer. Each flow describes step-by-step what happens from the user's perspective and what the system does behind the scenes.

---

## Flow 1: Guest Discovers and Views Video

**User Type**: Unauthenticated visitor

**Entry Point**: Homepage or direct link

**Steps**:

1. User lands on SupaViewer homepage
   - System displays featured videos and latest approved videos
   - No login required, content immediately visible
   - Fast page load with optimized images

2. User browses video grid
   - Sees thumbnail, title, creator name, rating, AI tool used
   - Can filter by: AI tool, genre, rating, date
   - Can sort by: newest, highest rated, most viewed

3. User clicks on a video
   - Navigates to video detail page
   - URL format: `/video/[video-id]` or `/video/[slug]`
   - Page loads with all video metadata

4. Video detail page displays:
   - Embedded YouTube player (auto-loads)
   - Video title and description
   - Creator name (clickable link to creator profile)
   - AI tool badge
   - Genre badge
   - Average rating (stars) and total ratings count
   - View count
   - "Rate this video" button (prompts login)

5. User watches video
   - YouTube embed handles playback
   - System increments view_count after a few seconds
   - Related videos shown below

6. User wants to rate video
   - Clicks "Rate this video"
   - System shows login/signup modal
   - Explains: "Sign in to rate videos and save favorites"

**Exit Points**:
- Continue browsing videos
- Sign up to rate
- Leave site

---

## Flow 2: User Signs Up

**User Type**: Guest wanting to rate or submit videos

**Entry Point**: Login/signup button or prompted when trying to rate

**Steps**:

1. User clicks "Sign Up" or "Rate Video" (which triggers signup)
   - Modal appears with signup form
   - Options: Email/password or OAuth (Google, GitHub)

2. Email/Password Signup:
   - User enters email and password
   - System validates:
     - Email format correct
     - Password meets requirements (min 8 chars)
     - Email not already registered
   - System sends verification email via Supabase Auth
   - User shown: "Check your email to verify account"

3. OAuth Signup (Google/GitHub):
   - User clicks OAuth button
   - Redirects to provider
   - User authorizes
   - Redirects back to SupaViewer
   - Account created automatically (no email verification needed)

4. After successful signup:
   - User is logged in
   - Modal closes
   - Returned to previous page
   - Can now rate videos

**Error Handling**:
- Email already exists: "Account exists, please log in"
- Invalid email: "Please enter valid email"
- Weak password: "Password must be at least 8 characters"

---

## Flow 3: User Rates a Video

**User Type**: Authenticated user

**Entry Point**: Video detail page

**Steps**:

1. Logged-in user views video
   - "Rate this video" button is active
   - If user already rated, shows: "Your rating: X/10" with edit option

2. User clicks to rate
   - Rating interface appears (1-10 stars or slider)
   - User selects rating (1-10)

3. First-time rating:
   - User clicks submit
   - System validates:
     - User is authenticated
     - Rating is 1-10
     - User hasn't already rated this video
   - System inserts rating into database
   - System recalculates video average and total ratings
   - Optimistic UI update (shows immediately)
   - Success toast: "Rating submitted!"

4. Updating existing rating:
   - User clicks "Edit rating"
   - Same interface appears with current rating pre-selected
   - User changes rating and clicks update
   - System updates rating in database
   - System recalculates averages
   - Success toast: "Rating updated!"

5. Deleting rating:
   - User clicks "Remove rating"
   - Confirmation: "Remove your rating?"
   - System deletes rating
   - System recalculates averages
   - Success toast: "Rating removed"

**Edge Cases**:
- User tries to rate while logged out: Redirect to login
- User tries to rate twice: Show update interface instead
- Database error: Show error toast, don't update UI

---

## Flow 4: User Submits Video

**User Type**: Authenticated or guest (both allowed)

**Entry Point**: "Submit Video" button in navigation

**Steps**:

1. User clicks "Submit Video"
   - Navigates to `/submit` page
   - Form loads with fields

2. Submission form displays:
   - Video title (required)
   - Description (optional)
   - YouTube URL (required)
   - AI tool used (required, dropdown)
   - Genre (optional, dropdown)
   - Creator name (required, pre-filled if logged in)
   - Creator email (optional)
   - Creator website (optional)

3. User fills form:
   - As user types YouTube URL, system validates format
   - When valid URL entered, system fetches:
     - Video thumbnail (for preview)
     - Video duration (to check >= 30 seconds)
     - Video title (auto-fills if empty)
   - User sees preview of what will be submitted

4. User submits form:
   - System validates all required fields
   - System checks:
     - YouTube URL is valid and accessible
     - Duration >= 30 seconds
     - URL not already submitted
   - System creates submission record with status='pending'
   - If user is logged in, links user_id
   - Success page: "Submission received! We'll review within 48 hours"
   - Option: "Submit another video" or "Browse videos"

5. System sends notification:
   - If email provided, send confirmation email
   - Admin gets notified of new submission

**Error Handling**:
- Invalid YouTube URL: "Please enter valid YouTube link"
- Video too short: "Video must be at least 30 seconds long"
- Already submitted: "This video has already been submitted"
- Missing required fields: Highlight fields in red
- Network error: "Error submitting. Please try again"

**After Submission**:
- User can view submission status if logged in (My Submissions page)
- Guest receives email updates if provided email

---

## Flow 5: User Views Creator Profile

**User Type**: Any (authenticated or guest)

**Entry Point**: Clicking creator name anywhere on site

**Steps**:

1. User clicks creator name
   - Navigates to `/creator/[slug]`
   - URL uses creator slug, e.g., `/creator/john-smith`

2. Creator profile page loads:
   - Creator name and avatar
   - Bio (if provided)
   - Links: Website, Twitter (if provided)
   - Stats: Total videos, average rating across all videos
   - Grid of all approved videos by this creator
   - Videos sorted by newest first

3. User can:
   - View all videos from creator
   - Click on any video to watch
   - See creator's body of work

**If Creator Not Found**:
- 404 page: "Creator not found"
- Suggestion: "Browse all creators"

---

## Flow 6: Admin Reviews Submission

**User Type**: Admin

**Entry Point**: Admin dashboard

**Steps**:

1. Admin logs in
   - Uses admin account credentials
   - Redirects to `/admin` dashboard
   - Dashboard requires admin role

2. Admin dashboard displays:
   - Pending submissions count (badge)
   - Quick stats: Total videos, total submissions, recent activity
   - Tabs: Pending Submissions, All Videos, Creators, Analytics

3. Admin views pending submissions:
   - List view with key info:
     - Thumbnail preview
     - Title
     - Creator name
     - AI tool
     - Duration
     - Submitted date
     - YouTube link
   - Sorted by oldest first (FIFO queue)

4. Admin clicks on submission to review:
   - Full detail view opens (modal or dedicated page)
   - Shows all submitted information
   - Embedded video player to watch
   - Admin actions:
     - Approve (green button)
     - Reject (red button)
     - Add notes (text field for internal notes)

5. Admin approves submission:
   - Admin clicks "Approve"
   - System prompts: "This will create a public video"
   - Admin can edit details before final approval:
     - Match to existing creator or create new creator
     - Adjust title/description if needed
     - Verify AI tool and genre
   - Admin clicks "Confirm Approval"
   - System:
     - Creates or links to creator profile
     - Creates video record with status='approved'
     - Updates submission status to 'approved'
     - Links submission to created video
     - Video is now live on platform
   - Success message: "Video approved and published!"
   - If submitter email provided, send notification

6. Admin rejects submission:
   - Admin clicks "Reject"
   - Modal: "Reason for rejection?" (optional notes)
   - Admin enters reason (helps submitter if they ask)
   - Admin clicks "Confirm Rejection"
   - System:
     - Updates submission status to 'rejected'
     - Saves admin notes
     - Submission removed from pending queue
   - Optional: Send rejection email if email provided

**Edge Cases**:
- Duplicate submission: Admin can mark as duplicate and link to existing video
- Low quality: Admin rejects with quality notes
- Policy violation: Admin rejects with policy reason

---

## Flow 7: Admin Manages Videos

**User Type**: Admin

**Entry Point**: Admin dashboard → All Videos tab

**Steps**:

1. Admin views all videos:
   - List includes approved, pending, rejected
   - Filters: Status, AI tool, creator, date range
   - Search: By title, creator name
   - Sortable columns

2. Admin selects video to edit:
   - Clicks on video
   - Edit modal/page opens

3. Admin can modify:
   - Title, description
   - Creator (change or link to different creator)
   - AI tool, genre
   - Featured status (toggle)
   - Status (approve, reject previously approved video)

4. Admin features video:
   - Toggles "Featured" checkbox
   - Video appears on homepage
   - Only X videos can be featured at once (configurable)
   - If limit reached, admin must unfeature another video

5. Admin deletes video:
   - Click delete button
   - Confirmation: "Are you sure? This will delete all ratings"
   - Admin confirms
   - System:
     - Deletes video
     - Cascade deletes all ratings (or soft delete)
     - Keeps submission record for audit

**Bulk Actions** (Future):
- Select multiple videos
- Bulk approve, reject, feature, or delete

---

## Flow 8: Admin Manages Creators

**User Type**: Admin

**Entry Point**: Admin dashboard → Creators tab

**Steps**:

1. Admin views all creators:
   - List with name, video count, average rating
   - Search by name
   - Sort by video count, rating, name

2. Admin creates new creator:
   - Clicks "Add Creator"
   - Form:
     - Name (required)
     - Slug (auto-generated from name, editable)
     - Bio
     - Website
     - Twitter handle
     - Avatar URL
   - Admin submits
   - System creates creator profile

3. Admin edits existing creator:
   - Clicks on creator
   - Same form as creation
   - Can update any field
   - Can't change slug if videos exist (warn about breaking links)

4. Admin merges creators (Future):
   - If duplicate creators exist
   - Select two creators
   - Choose primary creator
   - System moves all videos to primary creator
   - Deletes duplicate creator

5. Admin links creator to user:
   - If creator claims their profile
   - Admin finds user account
   - Links creator.user_id to user
   - Now creator can edit their own profile

---

## Flow 9: User Browses and Filters

**User Type**: Any (authenticated or guest)

**Entry Point**: Browse page

**Steps**:

1. User navigates to browse page:
   - URL: `/browse` or `/videos`
   - Shows all approved videos

2. Default view:
   - Grid layout (4 columns desktop, responsive)
   - Sorted by newest first
   - Pagination or infinite scroll

3. User applies filters:
   - Filter panel (sidebar on desktop, dropdown on mobile)
   - Available filters:
     - AI Tool (multi-select checkboxes)
     - Genre (multi-select checkboxes)
     - Minimum rating (slider: 1-10)
     - Duration (ranges: 30s-1min, 1-3min, 3-5min, 5min+)
   - Filters applied immediately (URL params update)
   - Results update without page reload

4. User changes sort:
   - Dropdown: Newest, Highest Rated, Most Viewed, Most Rated
   - Grid updates with new order
   - URL params update

5. User searches:
   - Search bar at top
   - Searches: Video title, creator name, description
   - Results filter as user types (debounced)
   - Clear search button appears

6. User clears filters:
   - "Clear all filters" button
   - Returns to default view (all videos, newest first)

**Performance**:
- Filters are client-side if result set is small (< 100 videos)
- Server-side filtering if large dataset
- Paginate results (20-50 per page)

---

## Flow 10: User Views Homepage

**User Type**: Any (authenticated or guest)

**Entry Point**: Landing on supaviewer.com

**Steps**:

1. Page loads:
   - Fast initial render (< 1.5s)
   - Hero section with tagline
   - Featured videos section
   - Latest videos section
   - Top rated section (this week/month)
   - Call-to-action: "Submit your AI video"

2. Hero section:
   - Bold headline: "Discover the Best AI-Generated Films"
   - Subheading: "Curated AI video content, rated by the community"
   - Primary CTA: "Browse Videos"
   - Secondary CTA: "Submit Video"
   - Background: Subtle animation or featured video preview

3. Featured videos:
   - 3-4 manually curated videos
   - Larger thumbnails
   - "Featured" badge
   - Horizontal scroll on mobile
   - Click to watch

4. Latest videos:
   - Grid of newest approved videos (12-20)
   - Sorted by created_at DESC
   - "View all" link to browse page

5. Top rated:
   - Videos with highest avg_rating (minimum rating count)
   - This week or this month filter
   - Shows rating prominently

6. User interactions:
   - Hover video card: Subtle animation, border highlight
   - Click video: Navigate to detail page
   - Click creator: Navigate to creator profile
   - Click "Submit Video": Navigate to submission form

**Personalization** (Future):
- If logged in, show "Recommended for you"
- Based on rating history

---

## Flow 11: Error Handling

**User Type**: Any

**Scenarios**:

### Video Not Found (404)
- User navigates to `/video/invalid-id`
- System: Video doesn't exist or is not approved
- Show: 404 page with "Video not found"
- Suggestions: Browse all videos, return home

### Creator Not Found (404)
- User navigates to `/creator/invalid-slug`
- System: Creator doesn't exist
- Show: 404 page
- Suggestions: Browse all creators

### Permission Denied (403)
- User tries to access admin dashboard without permission
- System: Check user role
- Show: "Access denied" page
- Suggestion: Return to homepage

### Network Error
- API call fails
- System: Catch error
- Show: Toast notification "Something went wrong. Please try again"
- Don't crash the page
- Option to retry

### Form Validation Error
- User submits form with invalid data
- System: Validate on client first
- Show: Inline error messages under fields
- Highlight invalid fields in red
- Prevent submission until fixed

### Rate Limiting (Future)
- User performs too many actions quickly
- System: Detect rate limit
- Show: "You're doing that too fast. Please wait a moment"
- Disable action temporarily

---

## Flow 12: Responsive Behavior

**User Type**: Any

**Device-Specific Flows**:

### Mobile (< 768px)
- Navigation: Hamburger menu
- Video grid: Single column
- Filters: Dropdown at top, not sidebar
- Forms: Full-width inputs, larger touch targets
- Modal: Full screen takeover
- Video player: Full width, responsive aspect ratio

### Tablet (768px - 1024px)
- Navigation: Horizontal nav, some items in dropdown
- Video grid: 2-3 columns
- Filters: Collapsible sidebar
- Forms: 2-column layout where appropriate

### Desktop (> 1024px)
- Navigation: Full horizontal nav
- Video grid: 4 columns
- Filters: Fixed sidebar
- Forms: Optimized layout with grouping
- Hover states active

---

## Key User Experience Principles

1. **Speed First**: Every page should load in under 2 seconds
2. **No Login Required**: Browse and watch videos without account
3. **Progressive Enhancement**: Core features work without JavaScript
4. **Accessibility**: Keyboard navigation, screen reader support
5. **Feedback**: Every action gets immediate feedback (optimistic UI, toasts)
6. **Error Recovery**: Clear error messages with actionable solutions
7. **Mobile-First**: Design for mobile, enhance for desktop
8. **Loading States**: Never show blank screen, use skeletons/spinners
9. **Success States**: Celebrate actions (confetti on first rating, etc.)
10. **Empty States**: Helpful messages when no content ("No videos yet, be the first to submit!")

---

## Future Flows (Not in MVP)

- **User Collections**: Save favorite videos to collections
- **Comments/Discussion**: Comment on videos
- **Following Creators**: Follow creators for updates
- **Notifications**: Get notified when followed creator posts
- **Creator Dashboard**: Analytics for creators
- **Social Sharing**: Share videos to social media with preview cards
- **Embed Videos**: Embed SupaViewer videos on other sites
- **API Access**: Developers fetch video data via API
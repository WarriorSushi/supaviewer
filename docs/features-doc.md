# Features

## MVP Features (Phase 1)

These are the essential features needed for launch. Focus on these exclusively until MVP is shipped.

### Public-Facing Features

#### Homepage
- **Hero Section**: Bold headline, tagline, primary CTAs
- **Featured Videos**: 3-4 manually curated videos with "Featured" badge
- **Latest Videos**: Grid showing newest approved videos (12-20 items)
- **Top Rated Section**: Highest rated videos from past week/month
- **Footer**: Links to submit, about, contact

**Why MVP**: First impression matters. Homepage needs to be impressive but simple.

---

#### Video Browse/Discovery Page
- **Video Grid**: Responsive grid layout (4 cols desktop → 1 col mobile)
- **Filtering**: Filter by AI tool, genre, minimum rating
- **Sorting**: Sort by newest, highest rated, most viewed
- **Search**: Search by title, creator name (simple text search)
- **Pagination**: Show 20-50 videos per page with pagination
- **No Login Required**: Anyone can browse

**Why MVP**: Core value prop is discovery. Must be functional and fast.

---

#### Video Detail Page
- **Embedded Player**: YouTube embed with video
- **Video Information**:
  - Title and description
  - Creator name (clickable to profile)
  - AI tool used (badge)
  - Genre (badge if present)
  - Duration display
  - Upload/approval date
- **Rating Display**: Average rating (stars) and total count
- **Rating Action**: Button to rate (prompts login if needed)
- **View Counter**: Display view count
- **Related Videos**: 4-6 similar videos below (same creator or genre)
- **Share Button**: Copy link to clipboard

**Why MVP**: This is where users spend time. Needs to be polished.

---

#### Creator Profile Page
- **Creator Info**: Name, avatar, bio, links (website, Twitter)
- **Stats**: Total videos, average rating across all videos
- **Video Grid**: All approved videos by this creator
- **Sort Options**: Newest first, highest rated
- **No Edit Access** (for now): Creators can't edit their own profiles yet

**Why MVP**: Gives creators presence and portfolio. Important for creator buy-in.

---

#### Video Submission Form
- **Form Fields**:
  - Video title (required)
  - Description (optional, textarea)
  - YouTube URL (required, validates format)
  - AI tool used (required, dropdown of common tools)
  - Genre (optional, dropdown)
  - Creator name (required, pre-filled if logged in)
  - Creator email (optional, for updates)
  - Creator website (optional)
- **YouTube Preview**: Auto-fetch thumbnail and duration when valid URL entered
- **Validation**: Check duration >= 30 seconds
- **Duplicate Check**: Warn if YouTube URL already submitted
- **Success Page**: Confirmation with "We'll review within 48 hours" message
- **Works Without Login**: Anyone can submit

**Why MVP**: Need content pipeline. Must be easy to submit.

---

#### Authentication
- **Sign Up/Login Modal**: Clean modal overlay, not separate page
- **Email/Password**: Standard email authentication via Supabase
- **OAuth**: Google and GitHub login options
- **Email Verification**: Required for email/password signups
- **Password Reset**: Forgot password flow
- **User Session**: Persistent login with secure cookies
- **No User Profiles Yet**: Just auth, no profile pages

**Why MVP**: Needed for ratings and preventing spam. Keep it simple.

---

#### Rating System
- **Star Rating**: 1-10 scale (or 1-5 stars, each worth 2 points)
- **One Rating Per User Per Video**: Enforce uniqueness
- **Update Rating**: Users can change their rating
- **Delete Rating**: Users can remove their rating
- **Optimistic UI**: Show updated rating immediately
- **Calculated Averages**: Real-time average and count display
- **Require Login**: Must be authenticated to rate

**Why MVP**: Core differentiator from YouTube. Community curation is key.

---

### Admin Features

#### Admin Dashboard
- **Protected Route**: Requires admin role, returns 403 for non-admins
- **Overview Tab**: Quick stats (pending submissions, total videos, total users)
- **Main Sections**: Tabs for Submissions, Videos, Creators

**Why MVP**: Need way to curate content. Manual moderation for now.

---

#### Submission Review
- **Pending Queue**: List of all pending submissions
- **Submission Detail View**: See all submission info, watch video
- **Actions**:
  - Approve (creates public video)
  - Reject (marks as rejected, optional notes)
  - Add internal notes
- **Approval Flow**:
  - Match to existing creator or create new creator
  - Edit video details if needed
  - Confirm and publish
- **Notification** (optional): Email submitter when approved/rejected

**Why MVP**: Content quality control. Admin must manually approve everything initially.

---

#### Video Management
- **All Videos List**: View all videos (approved, pending, rejected)
- **Filters**: By status, AI tool, creator, date
- **Search**: By title, creator
- **Edit Video**:
  - Change title, description
  - Update AI tool, genre
  - Change creator
  - Toggle featured status
- **Delete Video**: Remove video (with confirmation)
- **Feature Video**: Toggle featured status (appears on homepage)

**Why MVP**: Admin needs control over published content.

---

#### Creator Management
- **All Creators List**: View all creator profiles
- **Add Creator**: Manually create creator profile
- **Edit Creator**: Update name, bio, links, avatar
- **Auto-Slug Generation**: Create URL slug from name
- **Delete Creator** (careful): Remove creator (only if no videos)

**Why MVP**: Admin creates creator profiles when approving videos.

---

### Technical Features

#### Performance Optimizations
- **Image Optimization**: Next.js Image component for all images
- **Static Generation**: Homepage and browse page use ISR
- **Lazy Loading**: Videos load thumbnails lazily as user scrolls
- **Code Splitting**: Admin dashboard bundled separately
- **Edge Functions**: API routes run on edge where possible
- **Caching**: Aggressive caching for static content

**Why MVP**: Site must feel fast. Speed is a feature.

---

#### SEO Optimization
- **Meta Tags**: Proper title, description, OG tags on all pages
- **Semantic HTML**: Proper heading hierarchy, landmarks
- **Sitemap**: Auto-generated sitemap.xml
- **Robots.txt**: Allow crawling
- **Structured Data**: Schema.org markup for videos and creators
- **Dynamic OG Images**: Generate preview images for video pages

**Why MVP**: Need organic traffic. Good SEO from day one.

---

#### Security
- **Row Level Security**: All Supabase tables have RLS policies
- **Input Validation**: Client and server-side validation
- **XSS Protection**: Sanitize user input
- **CSRF Protection**: Built into Next.js
- **Rate Limiting** (basic): Prevent API abuse
- **Environment Variables**: Secrets in Vercel env vars
- **Admin Role Check**: Verify admin status on all admin routes

**Why MVP**: Can't launch without basic security.

---

#### Accessibility
- **Keyboard Navigation**: All interactive elements keyboard accessible
- **Focus Indicators**: Visible focus states
- **ARIA Labels**: Screen reader support
- **Color Contrast**: WCAG AA compliance
- **Alt Text**: All images have alt text
- **Semantic HTML**: Proper structure for assistive tech

**Why MVP**: Legal requirement, also the right thing to do.

---

## Phase 2 Features (Post-MVP)

These features come after successful MVP launch. Don't build these initially.

### User Features

#### User Profiles
- Public profile page for each user
- Display name, bio, avatar
- List of ratings given
- Statistics (videos rated, average rating given)

#### Favorites/Watchlist
- Users can save videos to watch later
- Private list, visible only to user
- Quick access from navigation

#### Following Creators
- Follow/unfollow creators
- Get notifications when followed creator uploads
- "Following" tab on homepage

#### Comments/Discussion
- Comment on videos
- Reply to comments
- Upvote/downvote comments
- Moderation tools

#### Social Sharing
- Share video with auto-generated preview card
- Twitter, Facebook, LinkedIn sharing
- Copy embed code for video

### Creator Features

#### Creator Dashboard
- Analytics: Views, ratings, engagement over time
- See who rated their videos
- Edit their own profile
- Submit videos directly (bypasses submission queue)
- Verified badge for established creators

#### Notifications
- Email notifications for new ratings
- In-app notifications
- Notification preferences

### Platform Features

#### Collections/Playlists
- Curated collections by admins or users
- "Best of Sora", "This Week's Top 10", etc.
- Featured collections on homepage

#### Advanced Search
- Full-text search with relevance ranking
- Filter by multiple criteria simultaneously
- Search within creator's work
- Search by tags

#### Video Tags
- More flexible than genre
- User-suggested tags (admin approved)
- Tag cloud/browse by tags

#### Trending Algorithm
- Calculate trending videos based on recent activity
- Trending section on homepage
- Trending page

#### Advanced Filters
- Date range picker
- Duration slider (exact range)
- Multiple AI tools selected
- Exclude filters

### Monetization (Future)

#### Premium Features
- Featured creator profiles (paid placement)
- Premium accounts with analytics
- Remove ads (if ads are added)

#### Creator Marketplace
- Brands can contact creators
- Creator directory with contact info
- Featured opportunities

### Community Features

#### User Roles
- Moderators (community trusted users)
- Verified creators
- Power users (high engagement)
- Badges and reputation

#### Reporting System
- Report videos for policy violations
- Report comments/users
- Admin review queue

### Technical Enhancements

#### Public API
- REST API for developers
- API keys and rate limiting
- Documentation
- Webhooks for new videos

#### Mobile Apps
- Native iOS app
- Native Android app
- Push notifications

#### Advanced Analytics
- Google Analytics integration
- Custom event tracking
- Heatmaps
- A/B testing framework

#### Internationalization
- Multi-language support
- Localized content
- Regional trending

#### Direct Video Hosting
- Allow video uploads (not just YouTube embeds)
- Video transcoding
- CDN delivery
- Storage management

---

## Explicitly Not Building (Now or Later)

These are out of scope for SupaViewer's mission:

### Short-Form Content (< 30 seconds)
- We focus on storytelling, not viral clips
- Minimum 30-second requirement stays

### Video Editing Tools
- We're a discovery platform, not creation tool
- Creators use external tools

### AI Video Generation
- We don't generate videos
- We showcase videos made with AI tools

### Social Network Features
- No friend requests, DMs, feeds
- Keep focus on content, not social graph

### Live Streaming
- Only pre-recorded videos
- Not a streaming platform

### Monetization via Ads
- Keep platform ad-free as long as possible
- Premium features, not ads

### NFT/Blockchain Integration
- Not relevant to core mission
- Adds complexity without value

---

## Feature Priority Matrix

### Must Have (MVP)
- Video browsing and discovery ⭐
- Video detail pages ⭐
- Rating system ⭐
- Submission form ⭐
- Admin approval workflow ⭐
- Creator profiles ⭐
- Authentication ⭐

### Should Have (Phase 2)
- User profiles
- Favorites/watchlist
- Comments
- Social sharing
- Creator dashboard

### Could Have (Phase 3+)
- Collections
- Following system
- Advanced search
- Mobile apps
- Public API

### Won't Have
- Short-form content
- Video editing
- AI generation
- Social networking
- Live streaming

---

## Success Metrics by Feature

### MVP Launch Success
- 100+ videos approved in first 3 months
- 500+ registered users
- 50+ active creators
- Average 4+ star ratings on content
- < 2 second page load times
- 90+ Lighthouse score

### Phase 2 Success
- 1,000+ videos
- 10,000+ users
- 5,000+ ratings given
- 100+ daily active users
- Featured in AI/tech publications

### Long-Term Success
- 10,000+ videos
- 100,000+ users
- Recognized as "the place" for AI video
- Self-sustaining community
- Revenue positive (if monetization added)

---

## Feature Development Guidelines

### Before Building Any Feature

Ask these questions:
1. **Does it serve content discovery?** Our core mission
2. **Does it improve video quality curation?** Our differentiator
3. **Does it help creators showcase work?** Our creators matter
4. **Is it needed for MVP?** Or can it wait?
5. **Does it add complexity?** Favor simple over feature-rich
6. **Can users work around it?** If yes, deprioritize

### When to Add a Feature

Add a feature when:
- Users explicitly request it (multiple times)
- It solves a clear, recurring problem
- It aligns with core mission
- We have capacity to maintain it
- It doesn't bloat the core experience

### When to Skip a Feature

Skip a feature when:
- Only one person wants it
- It's a "nice to have" not "need to have"
- It distracts from core value prop
- It adds significant complexity
- Existing solution (even clunky) works

---

## Tech Debt We Accept for MVP

These shortcuts are acceptable for MVP, fix in Phase 2:

- **No pagination on browse** (if < 500 videos): Load all, filter client-side
- **Basic search**: Simple text match, not full-text search
- **Manual creator matching**: Admin manually picks creator for each video
- **No undo for admin actions**: Be careful, no rollback
- **Single admin user**: Don't build role system yet
- **No caching layer**: Rely on Vercel/Supabase caching
- **No email queue**: Send emails synchronously
- **No background jobs**: Process everything in request/response cycle

Fix these when they become bottlenecks, not before.
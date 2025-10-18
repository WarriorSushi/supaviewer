# Admin Dashboard

## Overview

The admin dashboard is the control center for managing SupaViewer. It provides interfaces for reviewing submissions, managing videos, editing creator profiles, and viewing platform analytics.

---

## Access Control

### Admin Role

Only users with admin role can access the dashboard.

**Role Check**:
- Check on server side (layout.tsx or middleware)
- Redirect non-admins to homepage with error message
- Store admin role in user metadata or separate table

**Initial Admin Setup**:
- Set first admin manually via Supabase dashboard
- Update user metadata: `{ role: 'admin' }`
- Or create admin_users table with user_id references

---

## Dashboard Structure

### Route: `/admin`

```
/admin
├── /                    # Dashboard overview
├── /submissions         # Pending submissions queue
├── /submissions/[id]    # Review individual submission
├── /videos              # All videos management
├── /videos/[id]         # Edit video
└── /creators            # Creator management
    └── /[id]            # Edit creator
```

---

## Dashboard Layout

### File: `app/admin/layout.tsx`

**Purpose**: Shared layout for all admin pages

**Features**:
- Authentication check (redirect if not logged in)
- Admin role check (403 if not admin)
- Sidebar navigation (desktop) or top tabs (mobile)
- Header with user info and logout
- Consistent styling across admin pages

**Navigation Items**:
- Dashboard (overview)
- Submissions (with pending count badge)
- Videos
- Creators
- Settings (future)

**Layout Structure**:
```
┌─────────────────────────────────────┐
│ Header: SupaViewer Admin            │
├───────────┬─────────────────────────┤
│ Sidebar   │ Main Content Area       │
│           │                         │
│ Dashboard │ [Current Page Content]  │
│ Submissions│                        │
│ Videos    │                         │
│ Creators  │                         │
└───────────┴─────────────────────────┘
```

---

## Overview Page

### Route: `/admin`

**Purpose**: High-level dashboard with key metrics

**Sections**:

#### Stats Cards (Top Row)
Display key metrics in cards:
- **Total Videos**: Count of approved videos
- **Pending Submissions**: Count needing review (with badge/highlight)
- **Total Creators**: Count of creator profiles
- **Total Users**: Registered user count
- **Total Ratings**: All ratings given
- **This Week**: New videos this week (with trend indicator)

#### Recent Activity (Middle Section)
Timeline of recent actions:
- Latest video approvals
- Recent submissions
- Recent ratings
- User signups
- Show timestamp and quick action links

#### Quick Actions (Right Sidebar)
Buttons for common tasks:
- Review Pending Submissions
- Add New Creator
- Feature Video
- View Analytics (future)

#### Charts (Bottom Section - Future)
- Videos over time (line chart)
- Ratings distribution (bar chart)
- Top creators by video count
- Popular AI tools (pie chart)

**Data Sources**:
- Query Supabase for counts
- Use SQL aggregations for stats
- Cache results (5-minute revalidation)

---

## Submissions Management

### Route: `/admin/submissions`

**Purpose**: Review video submissions

**Layout**:

```
┌─────────────────────────────────────┐
│ Filters & Search                    │
├─────────────────────────────────────┤
│ Tabs: [Pending] [Approved] [Rejected]│
├─────────────────────────────────────┤
│ Submission List (Data Table)        │
│ ┌─────────────────────────────────┐│
│ │ Thumbnail | Title | Creator |   ││
│ │ AI Tool | Date | Actions       ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ Pagination                          │
└─────────────────────────────────────┘
```

**Features**:

#### Tabs
- **Pending** (default): Needs review, sorted by oldest first (FIFO)
- **Approved**: Already processed and published
- **Rejected**: Declined submissions

#### List View (Data Table)
Each row shows:
- **Thumbnail**: Small preview image
- **Title**: Submission title
- **Creator Name**: Who submitted
- **AI Tool**: Tool used badge
- **Duration**: Video length
- **Submitted Date**: When submitted
- **Actions**: Quick approve/reject buttons or "Review" button

#### Filters
- Date range (last 7 days, 30 days, all time)
- AI tool filter
- Search by title or creator name

#### Bulk Actions (Future)
- Select multiple submissions
- Bulk approve or reject

**Interactions**:
- Click row → Open submission detail modal or navigate to detail page
- Quick approve → Confirm dialog, then approve with defaults
- Quick reject → Confirm dialog with optional notes

---

### Route: `/admin/submissions/[id]`

**Purpose**: Detailed submission review

**Layout**:

```
┌─────────────────────────────────────┐
│ Video Preview (YouTube Embed)       │
│ ─────────────────────────────────── │
│                                     │
├─────────────────────────────────────┤
│ Submission Details                  │
│ • Title: [editable]                 │
│ • Description: [editable]           │
│ • Creator: [match to existing]      │
│ • AI Tool: [editable]               │
│ • Genre: [editable]                 │
│ • Duration: 2:35                    │
│ • Submitted by: user@email.com      │
│ • Submitted at: Jan 15, 2025        │
├─────────────────────────────────────┤
│ Admin Actions                       │
│ [Approve] [Reject] [Add Notes]      │
└─────────────────────────────────────┘
```

**Approval Workflow**:

1. **Watch Video**: Review quality and content
2. **Edit Details**: Clean up title, description if needed
3. **Match Creator**:
   - Search existing creators (autocomplete)
   - Or create new creator profile
   - Fill in creator details if new
4. **Set Genre/Tool**: Verify or update
5. **Feature Decision**: Check "Featured" if exceptional quality
6. **Click Approve**: Confirms and publishes video
7. **Success**: Video is live, submitter notified

**Rejection Workflow**:

1. **Click Reject**
2. **Add Notes** (optional but recommended):
   - Quality issues
   - Policy violation
   - Too short
   - Already exists
3. **Confirm Rejection**
4. **Success**: Submission marked rejected, submitter notified (if email)

**Validation Checks**:
Before approval:
- YouTube URL is valid and accessible
- Duration >= 30 seconds
- Not a duplicate (check by YouTube URL)
- Creator is selected or created
- All required fields filled

---

## Videos Management

### Route: `/admin/videos`

**Purpose**: Manage all published videos

**Layout**:

```
┌─────────────────────────────────────┐
│ Filters, Search, Sort               │
├─────────────────────────────────────┤
│ Videos List (Data Table)            │
│ ┌─────────────────────────────────┐│
│ │ Thumbnail | Title | Creator |   ││
│ │ Status | Rating | Featured |   ││
│ │ Views | Date | Actions         ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ Pagination                          │
└─────────────────────────────────────┘
```

**Features**:

#### Filters
- Status: All, Approved, Pending, Rejected
- AI Tool: Filter by tool
- Creator: Filter by creator
- Featured: Show only featured
- Date range

#### Search
- Search by title or creator name
- Real-time filtering

#### Sort Options
- Newest first (default)
- Oldest first
- Highest rated
- Most viewed
- Alphabetical

#### List Columns
- **Thumbnail**: Video preview
- **Title**: Video title
- **Creator**: Creator name
- **Status**: Badge (approved/pending/rejected)
- **Rating**: Average rating with star
- **Featured**: Toggle switch or icon
- **Views**: View count
- **Date**: Created date
- **Actions**: Edit, Delete, Feature

#### Row Actions
- **Edit**: Open video editor
- **Delete**: Confirm and delete (soft or hard)
- **Feature/Unfeature**: Toggle featured status
- **View**: Open video page in new tab

**Bulk Actions** (Future):
- Select multiple videos
- Bulk feature/unfeature
- Bulk status change
- Bulk delete

---

### Video Editor

**Triggered from**: Video list actions or video detail page

**Display**: Modal or dedicated page

**Editable Fields**:
- Title (text input)
- Description (textarea)
- Creator (dropdown/autocomplete)
- AI Tool (dropdown)
- Genre (dropdown)
- Featured (checkbox)
- Status (select: approved/pending/rejected)

**Actions**:
- **Save Changes**: Update video in database
- **Cancel**: Discard changes
- **Delete Video**: Permanent deletion with confirmation
- **View Live**: Open public video page

**Validation**:
- Title required, max 120 chars
- Creator must be selected
- AI Tool required

**After Save**:
- Success toast
- Update list view
- Revalidate video page cache

---

## Creators Management

### Route: `/admin/creators`

**Purpose**: Manage creator profiles

**Layout**:

```
┌─────────────────────────────────────┐
│ [Add New Creator] Search            │
├─────────────────────────────────────┤
│ Creators List (Data Table)          │
│ ┌─────────────────────────────────┐│
│ │ Avatar | Name | Videos | Rating ││
│ │ Verified | Actions             ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ Pagination                          │
└─────────────────────────────────────┘
```

**Features**:

#### Add New Creator
Button opens creator creation form:
- Name (required)
- Slug (auto-generated, editable)
- Bio (optional)
- Website (optional)
- Twitter handle (optional)
- Avatar URL (optional)
- Link to user account (optional, for claimed profiles)

#### List Columns
- **Avatar**: Profile picture or initials
- **Name**: Creator name (clickable to profile)
- **Slug**: URL slug
- **Video Count**: Number of videos
- **Average Rating**: Across all videos
- **Verified**: If linked to user account
- **Actions**: Edit, Delete

#### Sort & Filter
- Sort by name, video count, rating
- Search by name
- Filter by verified status

#### Row Actions
- **Edit**: Open creator editor
- **Delete**: Confirm and delete (only if no videos)
- **View Profile**: Open public creator page
- **Merge**: Merge duplicate creators (future)

---

### Creator Editor

**Editable Fields**:
- Name
- Slug (warn if changing, breaks links)
- Bio
- Website
- Twitter handle
- Avatar URL (or upload image - future)
- User account link (for claimed profiles)

**Actions**:
- Save Changes
- Cancel
- Delete Creator (if no videos)
- View Public Profile

**Slug Handling**:
- Auto-generate from name on creation
- Allow manual edit
- Check uniqueness
- Warn if changing slug on existing creator (breaks old links)

---

## Search & Filtering

### Universal Search (Header)

Quick search across:
- Videos (by title)
- Creators (by name)
- Submissions (by title)

Results dropdown with recent items and quick links.

### Advanced Filters

On each management page:
- Multiple filter criteria
- Save filter presets (future)
- Clear all filters button
- Filter state in URL params (shareable links)

---

## Notifications & Alerts

### In-Dashboard Notifications

Show important events:
- New submission waiting (badge on Submissions tab)
- Videos needing attention
- System alerts

### Email Notifications (Future)

Admin receives emails for:
- New submission (if enabled in settings)
- High-priority reports
- System issues

---

## Data Tables

### Consistent Table Design

All data tables share:
- Sortable columns (click header to sort)
- Row hover highlight
- Action buttons on hover/focus
- Loading skeleton when fetching
- Empty state with helpful message
- Pagination at bottom

### Table Components

Use `AdminDataTable` component:
- Define columns with type safety
- Automatic sorting, filtering
- Responsive design (cards on mobile)
- Keyboard navigation

---

## Performance Considerations

### Data Loading

- **Pagination**: Load 20-50 rows per page
- **Lazy Loading**: Load details on demand
- **Caching**: Cache list data (1-5 minute TTL)
- **Optimistic Updates**: Show changes immediately

### Search & Filter

- **Debounce Search**: Wait 300ms after typing
- **Client-Side Filter**: If dataset < 100 items
- **Server-Side Filter**: If dataset > 100 items
- **URL State**: Filter state in URL for bookmarking

---

## Mobile Responsiveness

### Mobile Layout Changes

**Navigation**:
- Sidebar → Top tabs or hamburger menu
- Compact header

**Tables**:
- Table → Card list
- Actions in dropdown menu
- Horizontal scroll if needed

**Forms**:
- Single column layout
- Larger touch targets
- Full-width inputs

---

## Security

### Access Control

- Check admin role on every admin route
- Use RLS policies as backup
- Log all admin actions (audit trail)
- Session timeout after inactivity

### Audit Trail (Future)

Log admin actions:
- Who approved/rejected what
- What was edited and when
- Deleted items (soft delete)
- Useful for accountability and recovery

---

## Future Enhancements

### Phase 2 Features

- **Bulk Operations**: Select and act on multiple items
- **Analytics Dashboard**: Charts and insights
- **User Management**: View and manage users
- **Settings Page**: Configure platform settings
- **Moderation Tools**: Report handling, user banning
- **Content Calendar**: Schedule featured videos
- **Export Data**: CSV exports for analysis
- **Activity Log**: Complete admin action history

### Phase 3 Features

- **Multiple Admin Roles**: Super admin, moderator, editor
- **Permissions System**: Granular access control
- **Team Collaboration**: Multiple admins, assignments
- **Workflow Automation**: Auto-approve trusted submitters
- **AI Moderation**: Auto-flag questionable content
- **Advanced Analytics**: Revenue, retention, growth

---

## Admin Dashboard Checklist

Before launch, ensure:
- [ ] All routes require authentication and admin role
- [ ] Submission review workflow is smooth
- [ ] Video editing works properly
- [ ] Creator management functional
- [ ] Stats display correctly
- [ ] Tables are sortable and filterable
- [ ] Mobile layout is usable
- [ ] Loading states everywhere
- [ ] Error handling in place
- [ ] Success messages for actions
- [ ] Keyboard navigation works
- [ ] Audit trail implemented (or planned)

The admin dashboard is critical for platform quality—make it efficient and pleasant to use.
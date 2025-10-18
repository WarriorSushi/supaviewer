# Component Library

## Overview

This document catalogs all components in SupaViewer, their purposes, props, and usage patterns. Components are organized by category and include both shadcn/ui components and custom components.

---

## shadcn/ui Components

These are installed via shadcn/ui CLI and customized for our Cinema Bold design system.

### Installation Command

```bash
npx shadcn-ui@latest add [component-name]
```

### Core UI Components to Install

#### Button
**Install**: `npx shadcn-ui@latest add button`

**Usage**:
```typescript
import { Button } from '@/components/ui/button'

<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="destructive">Delete</Button>
```

**Variants**: Default (crimson), secondary (amber), ghost, destructive, outline
**Sizes**: Default, sm, lg, icon

---

#### Card
**Install**: `npx shadcn-ui@latest add card`

**Usage**:
```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    Main content goes here
  </CardContent>
  <CardFooter>
    Footer actions
  </CardFooter>
</Card>
```

---

#### Dialog (Modal)
**Install**: `npx shadcn-ui@latest add dialog`

**Usage**:
```typescript
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Modal</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Modal Title</DialogTitle>
      <DialogDescription>Modal description</DialogDescription>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

---

#### Form Components
**Install**: `npx shadcn-ui@latest add form input textarea select`

**Usage**:
```typescript
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

<Form {...form}>
  <FormField
    control={form.control}
    name="title"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Title</FormLabel>
        <FormControl>
          <Input placeholder="Video title" {...field} />
        </FormControl>
        <FormDescription>Enter video title</FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

---

#### Badge
**Install**: `npx shadcn-ui@latest add badge`

**Usage**:
```typescript
import { Badge } from '@/components/ui/badge'

<Badge>Sora</Badge>
<Badge variant="secondary">Sci-Fi</Badge>
<Badge variant="destructive">Rejected</Badge>
```

---

#### Dropdown Menu
**Install**: `npx shadcn-ui@latest add dropdown-menu`

**Usage**:
```typescript
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

<DropdownMenu>
  <DropdownMenuTrigger>
    <Button>Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

#### Tabs
**Install**: `npx shadcn-ui@latest add tabs`

**Usage**:
```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

<Tabs defaultValue="pending">
  <TabsList>
    <TabsTrigger value="pending">Pending</TabsTrigger>
    <TabsTrigger value="approved">Approved</TabsTrigger>
  </TabsList>
  <TabsContent value="pending">Pending content</TabsContent>
  <TabsContent value="approved">Approved content</TabsContent>
</Tabs>
```

---

#### Toast (Notifications)
**Install**: `npx shadcn-ui@latest add toast`

**Usage**:
```typescript
import { useToast } from '@/hooks/use-toast'

const { toast } = useToast()

toast({
  title: "Success!",
  description: "Video submitted successfully",
})

toast({
  title: "Error",
  description: "Something went wrong",
  variant: "destructive",
})
```

---

#### Avatar
**Install**: `npx shadcn-ui@latest add avatar`

**Usage**:
```typescript
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

<Avatar>
  <AvatarImage src={creator.avatar_url} alt={creator.name} />
  <AvatarFallback>{creator.name[0]}</AvatarFallback>
</Avatar>
```

---

#### Separator
**Install**: `npx shadcn-ui@latest add separator`

**Usage**:
```typescript
import { Separator } from '@/components/ui/separator'

<div>
  <p>Section 1</p>
  <Separator className="my-4" />
  <p>Section 2</p>
</div>
```

---

## Custom Components

These are project-specific components we build.

### Navigation Components

#### Navbar
**Location**: `components/navigation/navbar.tsx`

**Purpose**: Main site navigation

**Props**:
```typescript
interface NavbarProps {
  // No props, uses auth context internally
}
```

**Usage**:
```typescript
import { Navbar } from '@/components/navigation/navbar'

<Navbar />
```

**Features**:
- Logo linking to homepage
- Navigation links (Browse, Submit, About)
- Auth buttons (Login/Signup or User menu if logged in)
- Responsive: Hamburger menu on mobile
- Sticky positioning with backdrop blur

---

#### Footer
**Location**: `components/navigation/footer.tsx`

**Purpose**: Site footer with links and info

**Props**: None

**Usage**:
```typescript
import { Footer } from '@/components/navigation/footer'

<Footer />
```

**Features**:
- Links to key pages
- Social media links (optional)
- Copyright notice
- Built with info

---

### Video Components

#### VideoCard
**Location**: `components/video/video-card.tsx`

**Purpose**: Display video in grid/list

**Props**:
```typescript
interface VideoCardProps {
  video: Video
  priority?: boolean  // For above-fold images
}
```

**Usage**:
```typescript
import { VideoCard } from '@/components/video/video-card'

<VideoCard video={video} priority={false} />
```

**Features**:
- Thumbnail with Next.js Image optimization
- Video title (max 2 lines, ellipsis)
- Creator name (clickable)
- Rating display (stars + average)
- AI tool badge
- Genre badge (if present)
- Hover effect (lift + border color change)
- Click navigates to video detail page

---

#### VideoGrid
**Location**: `components/video/video-grid.tsx`

**Purpose**: Responsive grid of video cards

**Props**:
```typescript
interface VideoGridProps {
  videos: Video[]
  emptyMessage?: string
}
```

**Usage**:
```typescript
import { VideoGrid } from '@/components/video/video-grid'

<VideoGrid 
  videos={videos} 
  emptyMessage="No videos found. Be the first to submit!"
/>
```

**Features**:
- Responsive grid: 4 cols → 3 cols → 2 cols → 1 col
- Gap spacing consistent with design system
- Empty state if no videos
- Renders VideoCard for each video

---

#### VideoPlayer
**Location**: `components/video/video-player.tsx`

**Purpose**: YouTube embed player

**Props**:
```typescript
interface VideoPlayerProps {
  youtubeId: string
  title: string
  autoplay?: boolean
}
```

**Usage**:
```typescript
import { VideoPlayer } from '@/components/video/video-player'

<VideoPlayer 
  youtubeId={video.youtube_id}
  title={video.title}
  autoplay={false}
/>
```

**Features**:
- Responsive 16:9 aspect ratio
- YouTube iframe embed
- Loading placeholder
- Handles YouTube API parameters

---

#### VideoInfo
**Location**: `components/video/video-info.tsx`

**Purpose**: Display video metadata on detail page

**Props**:
```typescript
interface VideoInfoProps {
  video: Video
  creator: Creator
}
```

**Usage**:
```typescript
import { VideoInfo } from '@/components/video/video-info'

<VideoInfo video={video} creator={creator} />
```

**Features**:
- Video title and description
- Creator info (name, avatar, link to profile)
- AI tool used
- Genre
- Duration
- View count
- Upload date
- Average rating display

---

#### VideoRating
**Location**: `components/video/video-rating.tsx`

**Purpose**: Interactive rating component

**Props**:
```typescript
interface VideoRatingProps {
  videoId: string
  initialRating?: number  // User's existing rating
  averageRating: number
  totalRatings: number
}
```

**Usage**:
```typescript
import { VideoRating } from '@/components/video/video-rating'

<VideoRating 
  videoId={video.id}
  initialRating={userRating}
  averageRating={video.avg_rating}
  totalRatings={video.total_ratings}
/>
```

**Features**:
- Display average rating (stars)
- Show total rating count
- If logged in: Interactive stars to rate
- If not logged in: Button to prompt login
- Update/delete own rating
- Optimistic UI updates

---

#### RelatedVideos
**Location**: `components/video/related-videos.tsx`

**Purpose**: Show related videos on detail page

**Props**:
```typescript
interface RelatedVideosProps {
  videoId: string
  limit?: number
}
```

**Usage**:
```typescript
import { RelatedVideos } from '@/components/video/related-videos'

<RelatedVideos videoId={video.id} limit={6} />
```

**Features**:
- Fetches related videos from API
- Displays in grid
- Shows loading state
- Falls back gracefully if no related videos

---

### Creator Components

#### CreatorCard
**Location**: `components/creator/creator-card.tsx`

**Purpose**: Display creator in grid

**Props**:
```typescript
interface CreatorCardProps {
  creator: Creator
}
```

**Usage**:
```typescript
import { CreatorCard } from '@/components/creator/creator-card'

<CreatorCard creator={creator} />
```

**Features**:
- Creator avatar
- Creator name
- Short bio (truncated)
- Video count
- Average rating across videos
- Click navigates to creator profile

---

#### CreatorProfile
**Location**: `components/creator/creator-profile.tsx`

**Purpose**: Full creator profile display

**Props**:
```typescript
interface CreatorProfileProps {
  creator: Creator
  videos: Video[]
}
```

**Usage**:
```typescript
import { CreatorProfile } from '@/components/creator/creator-profile'

<CreatorProfile creator={creator} videos={videos} />
```

**Features**:
- Large avatar
- Creator name and bio
- Links (website, Twitter)
- Stats (video count, avg rating)
- Grid of creator's videos
- Sort options for videos

---

### Form Components

#### SubmitVideoForm
**Location**: `components/forms/submit-video-form.tsx`

**Purpose**: Video submission form

**Props**:
```typescript
interface SubmitVideoFormProps {
  onSuccess?: () => void
}
```

**Usage**:
```typescript
import { SubmitVideoForm } from '@/components/forms/submit-video-form'

<SubmitVideoForm onSuccess={() => router.push('/success')} />
```

**Features**:
- All submission fields
- YouTube URL validation and preview
- Duration check (>= 30 seconds)
- Duplicate detection
- Loading states
- Success/error handling
- Auto-fill creator name if logged in

---

#### RatingForm
**Location**: `components/forms/rating-form.tsx`

**Purpose**: Standalone rating form (if needed)

**Props**:
```typescript
interface RatingFormProps {
  videoId: string
  onSubmit: (rating: number) => void
}
```

**Usage**: Embedded in VideoRating component

---

### Filter Components

#### VideoFilters
**Location**: `components/filters/video-filters.tsx`

**Purpose**: Filter panel for browse page

**Props**:
```typescript
interface VideoFiltersProps {
  onFilterChange: (filters: FilterState) => void
}
```

**Usage**:
```typescript
import { VideoFilters } from '@/components/filters/video-filters'

<VideoFilters onFilterChange={handleFilterChange} />
```

**Features**:
- AI tool multi-select
- Genre multi-select
- Minimum rating slider
- Duration range selector
- Clear all filters button
- Responsive: Sidebar on desktop, dropdown on mobile

---

### Loading & Empty States

#### LoadingSkeleton
**Location**: `components/loading/skeleton.tsx`

**Purpose**: Loading placeholder

**Props**:
```typescript
interface SkeletonProps {
  type: 'video-card' | 'video-grid' | 'profile' | 'text'
  count?: number
}
```

**Usage**:
```typescript
import { LoadingSkeleton } from '@/components/loading/skeleton'

<LoadingSkeleton type="video-grid" count={12} />
```

**Features**:
- Matches actual content dimensions
- Animated shimmer effect
- Different types for different content

---

#### EmptyState
**Location**: `components/empty-state.tsx`

**Purpose**: Display when no content

**Props**:
```typescript
interface EmptyStateProps {
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
  icon?: React.ReactNode
}
```

**Usage**:
```typescript
import { EmptyState } from '@/components/empty-state'

<EmptyState 
  title="No videos yet"
  description="Be the first to submit an AI-generated video!"
  action={{ label: "Submit Video", href: "/submit" }}
/>
```

---

### Admin Components

#### SubmissionReview
**Location**: `components/admin/submission-review.tsx`

**Purpose**: Review submission detail with approve/reject

**Props**:
```typescript
interface SubmissionReviewProps {
  submission: Submission
  onApprove: (data: ApprovalData) => void
  onReject: (notes: string) => void
}
```

**Usage**: Used in admin dashboard

**Features**:
- Full submission details
- Video preview (embedded YouTube)
- Creator matching (existing or create new)
- Edit video details before approval
- Rejection with notes
- Loading states during actions

---

#### VideoEditor
**Location**: `components/admin/video-editor.tsx`

**Purpose**: Edit video details

**Props**:
```typescript
interface VideoEditorProps {
  video: Video
  onSave: (data: VideoUpdateData) => void
}
```

**Usage**: Used in admin dashboard

**Features**:
- Edit all video fields
- Change creator
- Toggle featured status
- Change status (approve/reject)
- Delete video with confirmation

---

#### StatsCard
**Location**: `components/admin/stats-card.tsx`

**Purpose**: Display stat on dashboard

**Props**:
```typescript
interface StatsCardProps {
  title: string
  value: number | string
  trend?: {
    value: number
    isPositive: boolean
  }
  icon?: React.ReactNode
}
```

**Usage**:
```typescript
import { StatsCard } from '@/components/admin/stats-card'

<StatsCard 
  title="Total Videos"
  value={142}
  trend={{ value: 12, isPositive: true }}
/>
```

---

#### AdminDataTable
**Location**: `components/admin/data-table.tsx`

**Purpose**: Reusable data table for admin

**Props**:
```typescript
interface AdminDataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  searchKey?: string
  onRowClick?: (row: T) => void
}
```

**Usage**: For submissions list, videos list, creators list

**Features**:
- Sortable columns
- Search/filter
- Pagination
- Row actions
- Loading states

---

## Shared Utilities

### Icons
Use Lucide React for all icons.

**Common Icons**:
```typescript
import { 
  Star,           // Ratings
  Play,           // Video
  User,           // Creator/Profile
  Search,         // Search
  Filter,         // Filters
  Menu,           // Mobile menu
  X,              // Close
  ChevronDown,    // Dropdown
  ChevronRight,   // Navigation
  Check,          // Success
  AlertCircle,    // Error
  Upload,         // Submit
  Eye,            // View
  Calendar,       // Date
  Clock,          // Duration
} from 'lucide-react'

<Star className="w-5 h-5 text-amber" />
```

---

## Component Composition Patterns

### Compound Components

Group related components:

```typescript
// VideoCard compound
export function VideoCard({ video }: VideoCardProps) {
  return (
    <Card>
      <VideoCard.Thumbnail video={video} />
      <VideoCard.Content video={video} />
      <VideoCard.Footer video={video} />
    </Card>
  )
}

VideoCard.Thumbnail = function Thumbnail({ video }) { /* ... */ }
VideoCard.Content = function Content({ video }) { /* ... */ }
VideoCard.Footer = function Footer({ video }) { /* ... */ }
```

### Render Props

For flexible rendering:

```typescript
<VideoGrid 
  videos={videos}
  renderItem={(video) => (
    <CustomVideoCard video={video} />
  )}
/>
```

### Children as Function

For dynamic content:

```typescript
<DataFetcher url="/api/videos">
  {({ data, loading, error }) => {
    if (loading) return <LoadingSkeleton />
    if (error) return <ErrorMessage error={error} />
    return <VideoGrid videos={data} />
  }}
</DataFetcher>
```

---

## Accessibility Guidelines

All components must:

1. **Keyboard Navigation**:
   - All interactive elements accessible via Tab
   - Logical tab order
   - ESC closes modals/dropdowns

2. **ARIA Labels**:
   - Buttons have aria-label if no text
   - Form fields have labels
   - Status messages announced

3. **Focus Management**:
   - Visible focus indicators
   - Focus trapped in modals
   - Focus restored after modal close

4. **Color Contrast**:
   - Text meets WCAG AA standards
   - Interactive elements have 3:1 contrast

5. **Alt Text**:
   - All images have descriptive alt text
   - Decorative images have alt=""

---

## Performance Guidelines

### Image Optimization

Always use Next.js Image:
```typescript
<Image
  src={video.thumbnail_url}
  alt={video.title}
  width={640}
  height={360}
  loading={priority ? "eager" : "lazy"}
  placeholder="blur"
  blurDataURL={video.blur_data_url}
/>
```

### Code Splitting

Heavy components should be lazy loaded:
```typescript
const HeavyComponent = dynamic(
  () => import('./heavy-component'),
  { loading: () => <LoadingSkeleton /> }
)
```

### Memoization

Expensive renders use memo:
```typescript
export const VideoCard = memo(function VideoCard({ video }) {
  // Component logic
}, (prevProps, nextProps) => {
  // Custom comparison if needed
  return prevProps.video.id === nextProps.video.id
})
```

---

## Component Testing (Future)

Each component should have:

1. **Unit Tests**: Test component logic
2. **Visual Tests**: Screenshot comparison
3. **Accessibility Tests**: Check ARIA, keyboard nav
4. **Integration Tests**: Test with real data

Example test structure:
```typescript
describe('VideoCard', () => {
  it('renders video information correctly', () => {})
  it('navigates to video page on click', () => {})
  it('displays rating correctly', () => {})
  it('is keyboard accessible', () => {})
})
```

---

## Style Customization

### Theming shadcn Components

Customize in `tailwind.config.ts`:
```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#DC2626',      // Crimson
        secondary: '#F59E0B',    // Amber
        // ... other colors
      }
    }
  }
}
```

### Component Variants

Add variants to shadcn components:
```typescript
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "bg-crimson",
        secondary: "bg-amber",
        featured: "bg-gradient-to-r from-crimson to-amber",
      }
    }
  }
)
```

This component library provides everything needed to build SupaViewer's interface consistently and efficiently.
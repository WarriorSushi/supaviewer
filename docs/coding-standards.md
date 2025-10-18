# Coding Standards

## Overview

This document defines code organization, naming conventions, and best practices for SupaViewer. Following these standards ensures consistency, maintainability, and makes the codebase easier for AI coding assistants to understand and modify.

---

## Project Structure

```
supaviewer/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public routes (no auth required)
│   │   ├── page.tsx              # Homepage
│   │   ├── browse/               # Browse videos
│   │   │   └── page.tsx
│   │   ├── video/                # Video detail
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── creator/              # Creator profiles
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   └── submit/               # Video submission
│   │       └── page.tsx
│   ├── (auth)/                   # Auth routes
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts
│   ├── admin/                    # Admin dashboard (protected)
│   │   ├── layout.tsx            # Admin layout with auth check
│   │   ├── page.tsx              # Dashboard overview
│   │   ├── submissions/
│   │   │   └── page.tsx
│   │   ├── videos/
│   │   │   └── page.tsx
│   │   └── creators/
│   │       └── page.tsx
│   ├── api/                      # API routes
│   │   ├── videos/
│   │   │   ├── route.ts          # GET /api/videos
│   │   │   └── [id]/
│   │   │       ├── route.ts      # GET /api/videos/[id]
│   │   │       └── related/
│   │   │           └── route.ts
│   │   ├── creators/
│   │   ├── ratings/
│   │   ├── submissions/
│   │   └── admin/
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── not-found.tsx             # 404 page
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── video/                    # Video-specific components
│   │   ├── video-card.tsx
│   │   ├── video-grid.tsx
│   │   ├── video-player.tsx
│   │   └── video-rating.tsx
│   ├── creator/                  # Creator components
│   │   ├── creator-card.tsx
│   │   └── creator-profile.tsx
│   ├── forms/                    # Form components
│   │   ├── submit-video-form.tsx
│   │   └── rating-form.tsx
│   ├── navigation/               # Navigation components
│   │   ├── navbar.tsx
│   │   └── footer.tsx
│   └── admin/                    # Admin-specific components
│       ├── submission-review.tsx
│       ├── video-editor.tsx
│       └── stats-card.tsx
├── lib/                          # Utility functions
│   ├── supabase/                 # Supabase utilities
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Auth middleware
│   ├── utils.ts                  # General utilities
│   ├── youtube.ts                # YouTube API helpers
│   └── validations.ts            # Zod schemas
├── types/                        # TypeScript types
│   ├── database.ts               # Database types (generated)
│   ├── video.ts                  # Video types
│   ├── creator.ts                # Creator types
│   └── index.ts                  # Barrel exports
├── actions/                      # Server Actions
│   ├── videos.ts                 # Video mutations
│   ├── ratings.ts                # Rating mutations
│   └── submissions.ts            # Submission mutations
├── hooks/                        # Custom React hooks
│   ├── use-video.ts
│   ├── use-auth.ts
│   └── use-toast.ts
├── public/                       # Static assets
│   ├── images/
│   └── icons/
├── .env.local                    # Local environment variables (gitignored)
├── .env.example                  # Example env file (committed)
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies
└── README.md                     # Project documentation
```

---

## Naming Conventions

### Files and Folders

**Next.js Pages and Routes**:
- Use lowercase with hyphens: `browse-videos/page.tsx`
- Dynamic routes: `[id]/page.tsx`, `[slug]/page.tsx`
- Route groups (not in URL): `(public)`, `(auth)`, `(admin)`

**Components**:
- Use PascalCase: `VideoCard.tsx`, `SubmitVideoForm.tsx`
- Match component name to file name

**Utilities and Helpers**:
- Use lowercase with hyphens: `youtube-api.ts`, `format-date.ts`
- Or camelCase: `supabaseClient.ts`, `videoHelpers.ts`

**Types**:
- Use lowercase with hyphens: `video.ts`, `creator.ts`
- Or PascalCase for type files: `Video.ts`, `Creator.ts`

### Variables and Functions

**Variables**:
```typescript
// Use camelCase
const videoTitle = "Amazing AI Video"
const isApproved = true
const totalRatings = 42

// Constants use UPPER_SNAKE_CASE
const MAX_VIDEOS_PER_PAGE = 20
const DEFAULT_RATING = 5
```

**Functions**:
```typescript
// Use camelCase, start with verb
function getVideoById(id: string) {}
function calculateAverageRating(ratings: Rating[]) {}
function formatDuration(seconds: number) {}

// Async functions
async function fetchVideos() {}
async function createVideo(data: VideoData) {}
```

**React Components**:
```typescript
// Use PascalCase
export function VideoCard({ video }: VideoCardProps) {}
export function SubmitVideoForm() {}

// Custom hooks start with 'use'
export function useVideo(id: string) {}
export function useAuth() {}
```

**Event Handlers**:
```typescript
// Prefix with 'handle' or 'on'
function handleSubmit(e: FormEvent) {}
function onRatingChange(rating: number) {}
```

### Types and Interfaces

```typescript
// Types use PascalCase
type Video = {
  id: string
  title: string
}

// Interfaces use PascalCase
interface VideoCardProps {
  video: Video
  onRate?: (rating: number) => void
}

// Props interfaces suffix with 'Props'
interface SubmitFormProps {
  onSuccess: () => void
}

// Generic types use single capital letter
type ResponseData<T> = {
  success: boolean
  data: T
}
```

---

## Component Patterns

### Server Components (Default)

By default, components are Server Components. Use for:
- Pages that fetch data
- Static content
- SEO-critical content

```typescript
// app/browse/page.tsx
import { getVideos } from '@/lib/videos'

export default async function BrowsePage() {
  const videos = await getVideos()
  
  return (
    <div>
      <h1>Browse Videos</h1>
      <VideoGrid videos={videos} />
    </div>
  )
}
```

### Client Components

Add `'use client'` directive when you need:
- Event handlers (onClick, onChange)
- React hooks (useState, useEffect)
- Browser APIs (localStorage, window)

```typescript
// components/video/video-rating.tsx
'use client'

import { useState } from 'react'

export function VideoRating({ videoId }: { videoId: string }) {
  const [rating, setRating] = useState(0)
  
  function handleRate(value: number) {
    setRating(value)
    // API call to save rating
  }
  
  return (
    <div>
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} onClick={() => handleRate(star)}>
          ⭐
        </button>
      ))}
    </div>
  )
}
```

### Component Organization

```typescript
// 1. Imports (grouped and ordered)
import { Suspense } from 'react'           // React
import { getVideos } from '@/lib/videos'   // Internal libs
import { Button } from '@/components/ui'   // Components
import type { Video } from '@/types'       // Types

// 2. Types and interfaces
interface VideoPageProps {
  params: { id: string }
}

// 3. Component definition
export default async function VideoPage({ params }: VideoPageProps) {
  // Fetch data
  const video = await getVideoById(params.id)
  
  // Early returns for errors
  if (!video) {
    return <VideoNotFound />
  }
  
  // Render
  return (
    <div>
      <VideoPlayer video={video} />
      <VideoInfo video={video} />
    </div>
  )
}

// 4. Helper components (if small and related)
function VideoNotFound() {
  return <div>Video not found</div>
}
```

---

## Code Style

### TypeScript

**Always use TypeScript**, never JavaScript.

```typescript
// ✅ Good: Explicit types
function getVideoTitle(video: Video): string {
  return video.title
}

// ❌ Bad: Implicit any
function getVideoTitle(video) {
  return video.title
}
```

**Use type inference when obvious**:
```typescript
// ✅ Good: Type is obvious
const count = 5
const title = "Video Title"

// ❌ Unnecessary: Type is obvious
const count: number = 5
const title: string = "Video Title"
```

**Define interfaces for component props**:
```typescript
// ✅ Good
interface VideoCardProps {
  video: Video
  onRate?: (rating: number) => void
}

export function VideoCard({ video, onRate }: VideoCardProps) {}

// ❌ Bad: Inline types
export function VideoCard({ 
  video, 
  onRate 
}: { 
  video: Video
  onRate?: (rating: number) => void 
}) {}
```

### Async/Await

Always use async/await over promises chains.

```typescript
// ✅ Good
async function fetchVideo(id: string) {
  try {
    const video = await getVideoById(id)
    return video
  } catch (error) {
    console.error('Error fetching video:', error)
    throw error
  }
}

// ❌ Bad
function fetchVideo(id: string) {
  return getVideoById(id)
    .then((video) => video)
    .catch((error) => {
      console.error(error)
      throw error
    })
}
```

### Error Handling

Always handle errors, never let them silently fail.

```typescript
// ✅ Good
try {
  const result = await dangerousOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  // Handle error appropriately
  throw new Error('Failed to complete operation')
}

// ❌ Bad
const result = await dangerousOperation() // Could throw, no handling
```

### Comments

Comment WHY, not WHAT. Code should be self-explanatory.

```typescript
// ✅ Good: Explains reasoning
// Using Set to avoid O(n²) complexity when checking duplicates
const uniqueVideos = new Set(videos)

// ❌ Bad: States the obvious
// Create a new Set from videos array
const uniqueVideos = new Set(videos)
```

---

## Data Fetching Patterns

### Server Components (Preferred)

```typescript
// Fetch directly in Server Component
export default async function HomePage() {
  const videos = await supabase
    .from('videos')
    .select('*, creator:creators(*)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(12)
    
  return <VideoGrid videos={videos.data} />
}
```

### Client Components

```typescript
'use client'

import { useEffect, useState } from 'react'

export function VideoList() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await fetch('/api/videos')
        const data = await response.json()
        setVideos(data.videos)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchVideos()
  }, [])
  
  if (loading) return <LoadingSpinner />
  
  return <VideoGrid videos={videos} />
}
```

### Server Actions (for mutations)

```typescript
// actions/videos.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'

export async function rateVideo(videoId: string, rating: number) {
  const supabase = createServerClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  // Insert rating
  const { error } = await supabase
    .from('ratings')
    .upsert({
      video_id: videoId,
      user_id: user.id,
      rating
    })
    
  if (error) throw error
  
  // Revalidate video page
  revalidatePath(`/video/${videoId}`)
  
  return { success: true }
}
```

---

## Form Handling

Use React Hook Form + Zod for all forms.

```typescript
// lib/validations.ts
import { z } from 'zod'

export const submitVideoSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  youtube_url: z.string().url().regex(/youtube\.com|youtu\.be/),
  ai_tool: z.string().min(1),
  genre: z.string().optional(),
  creator_name: z.string().min(1),
  creator_email: z.string().email().optional(),
})

export type SubmitVideoFormData = z.infer<typeof submitVideoSchema>
```

```typescript
// components/forms/submit-video-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { submitVideoSchema } from '@/lib/validations'

export function SubmitVideoForm() {
  const form = useForm({
    resolver: zodResolver(submitVideoSchema),
    defaultValues: {
      title: '',
      youtube_url: '',
      ai_tool: '',
      creator_name: '',
    }
  })
  
  async function onSubmit(data: SubmitVideoFormData) {
    const response = await fetch('/api/submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    if (response.ok) {
      // Success
      form.reset()
    }
  }
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

---

## Styling with Tailwind

### Class Organization

Use consistent order:
1. Layout (display, position, flex, grid)
2. Spacing (margin, padding)
3. Sizing (width, height)
4. Typography (font, text)
5. Visual (background, border, shadow)
6. Interactive (hover, focus, transition)

```typescript
// ✅ Good: Organized
<div className="flex flex-col gap-4 p-6 w-full max-w-4xl bg-slate-800 border border-slate-700 rounded-lg hover:border-crimson transition-colors">

// ❌ Bad: Random order
<div className="border-slate-700 w-full transition-colors gap-4 bg-slate-800 p-6 hover:border-crimson rounded-lg flex flex-col border max-w-4xl">
```

### Use cn() Helper

For conditional classes, use the `cn()` helper:

```typescript
import { cn } from '@/lib/utils'

<button 
  className={cn(
    "px-4 py-2 rounded-lg font-semibold",
    featured && "bg-crimson text-white",
    !featured && "bg-slate-700 text-slate-200"
  )}
>
  Button
</button>
```

### Custom Colors

Define custom colors in tailwind.config.ts:

```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        crimson: '#DC2626',
        amber: '#F59E0B',
        'dark-bg': '#0F172A',
        'dark-surface': '#1E293B',
      }
    }
  }
}
```

Use as: `bg-crimson`, `text-amber`, `bg-dark-bg`

---

## Performance Best Practices

### Images

Always use Next.js Image component:

```typescript
import Image from 'next/image'

// ✅ Good
<Image
  src={video.thumbnail_url}
  alt={video.title}
  width={640}
  height={360}
  className="rounded-lg"
/>

// ❌ Bad
<img src={video.thumbnail_url} alt={video.title} />
```

### Dynamic Imports

For heavy components, use dynamic imports:

```typescript
import dynamic from 'next/dynamic'

// Lazy load admin dashboard
const AdminDashboard = dynamic(() => import('@/components/admin/dashboard'), {
  loading: () => <LoadingSpinner />,
  ssr: false, // Don't render on server
})
```

### Memoization

Use React.memo for expensive renders:

```typescript
import { memo } from 'react'

export const VideoCard = memo(function VideoCard({ video }: VideoCardProps) {
  // Component logic
})
```

---

## Testing Approach

For MVP, focus on:
1. Type safety (TypeScript catches many bugs)
2. Manual testing of critical flows
3. Vercel preview deployments for testing

Post-MVP, add:
- Unit tests with Vitest
- Integration tests with Playwright
- E2E tests for critical paths

---

## Common Patterns

### Loading States

```typescript
export default async function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DataComponent />
    </Suspense>
  )
}
```

### Error Boundaries

```typescript
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

### Not Found Pages

```typescript
// app/video/[id]/not-found.tsx
export default function VideoNotFound() {
  return <div>Video not found</div>
}

// In page component
import { notFound } from 'next/navigation'

if (!video) {
  notFound() // Renders not-found.tsx
}
```

---

## Code Review Checklist

Before committing code:

- [ ] TypeScript has no errors (`pnpm type-check`)
- [ ] Linter passes (`pnpm lint`)
- [ ] No console.logs (except intentional logging)
- [ ] Error handling in place
- [ ] Loading states handled
- [ ] Responsive design works (test mobile)
- [ ] Accessibility (keyboard nav, aria labels)
- [ ] Components are properly organized
- [ ] Naming follows conventions
- [ ] Comments explain WHY, not WHAT
- [ ] No hardcoded values (use constants)
- [ ] Environment variables for secrets

---

## Git Commit Messages

Follow conventional commits format:

```
feat: add video rating component
fix: resolve YouTube embed loading issue
docs: update API documentation
style: format code with prettier
refactor: simplify video fetching logic
perf: optimize image loading
test: add tests for rating system
chore: update dependencies
```

Be descriptive but concise. Focus on WHAT changed and WHY.
# Claude.md - SupaViewer Project Memory

## 🚨 Critical Learnings

### SVG Color Issues (SOLVED)
**Problem**: Stars (SVG elements) weren't filling with colors on hover despite correct state management.

**Root Cause**: Tailwind arbitrary values like `fill-[hsl(38,92%,50%)]` **DO NOT WORK** on SVG elements.

**Solutions that FAILED**:
- ❌ Tailwind classes: `fill-[hsl(...)]` and `stroke-[hsl(...)]`
- ❌ Applying `style` prop directly on `<RatingButton>` component
- ❌ Using `text-secondary` Tailwind class on buttons

**Solution that WORKS**: ✅
- Use **inline `style={{ color: '...' }}` on parent container**
- The shadcn Rating component uses `fill-current` class
- `fill-current` inherits from CSS `color` property
- Must be applied to parent, not individual buttons

```tsx
// ✅ WORKS
<div style={{ color: 'hsl(38, 92%, 50%)' }}>
  <Rating value={rating}>
    <RatingButton /> {/* Inherits amber color via fill-current */}
  </Rating>
</div>

// ❌ DOESN'T WORK
<RatingButton className="fill-[hsl(38,92%,50%)]" />
<RatingButton style={{ color: 'hsl(38, 92%, 50%)' }} />
```

### Design System Colors
**Primary Brand Colors**:
- Crimson: `hsl(0, 72%, 51%)` / `#DC2626` - Primary actions, brand
- Amber: `hsl(38, 92%, 50%)` / `#F59E0B` - Secondary, ratings, highlights

**Background Colors (Dark Theme)**:
- Background: `hsl(215, 29%, 8%)` / `#0E141B`
- Card: `hsl(217, 24%, 14%)` / `#1B2533`
- Border: `hsl(215, 20%, 22%)` / `#2A3443`

**Text Colors**:
- Foreground: `hsl(240, 5%, 98%)` / `#F9FAFB`
- Muted: `hsl(215, 16%, 65%)` / `#94A3B8`

## 📦 Key Components

### Rating System
**Component**: `components/video/video-rating.tsx`
- Uses shadcn Rating component from `components/ui/shadcn-io/rating`
- Installed via: `pnpm dlx shadcn@latest add https://www.shadcn.io/registry/rating.json`
- Features:
  - Read-only average rating display
  - Interactive 5-star rating
  - localStorage for temporary ratings (pre-auth)
  - Floating auth prompt banner
  - Share button

**Usage**:
```tsx
<VideoRating
  videoId={string}
  avgRating={number | null}
  totalRatings={number}
/>
```

### Button States
**Component**: `components/ui/button.tsx`
- All variants have proper hover/active states
- Active state: `active:bg-primary/80 active:scale-95`
- Works perfectly with standard CSS properties

## 🗄️ Database Schema

### Ratings Table
- Scale: **1-5 stars** (DECIMAL(2,1))
- Migration: `003_convert_to_5_star_rating.sql`
- Converted from old 1-10 scale by dividing by 2

### Videos Table
- `avg_rating`: DECIMAL(3,2) - Average of all ratings
- `total_ratings`: INTEGER - Count of ratings

## 🎨 Design Patterns

### Cinema Bold Design System
- **Principle**: Content-first, cinematic, warm palette
- **Inspiration**: Letterboxd, A24, film festivals
- **Font**: Outfit (Google Fonts) - weights 400, 600, 700
- **Avoid**: Purple/violet tones, neon colors, "generic SaaS" look

### Interactive States
```css
/* Hover */
hover:bg-primary/90
hover:scale-110

/* Active (press) */
active:bg-primary/80
active:scale-95

/* Focus */
focus-visible:ring-ring/50
focus-visible:ring-[3px]
```

## 🔧 Technical Stack

### Core
- Next.js 15.5.6 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4 (HSL color system)

### Backend
- Supabase (PostgreSQL, Auth, RLS)
- Google OAuth configured

### UI Libraries
- shadcn/ui components
- Radix UI primitives
- Lucide React icons
- Sonner (toasts)

## 📝 File Structure

```
app/
  (public)/
    video/[id]/page.tsx - Video detail page
  page.tsx - Homepage with tabs
  layout.tsx - Root layout with Toaster

components/
  video/
    video-rating.tsx - Rating component (NEW)
    video-card.tsx - Video thumbnail card
  ui/
    button.tsx - Button with active states
    shadcn-io/rating/ - Shadcn rating component

docs/
  features-doc.md - Feature specifications
  design-system.md - Full design system
  database-schema.md - DB structure
  user-flows.md - User interaction flows
```

## 🐛 Common Issues & Fixes

### Issue: Stars not filling on hover
**Fix**: Use inline `style={{ color: '...' }}` on parent container, not Tailwind classes

### Issue: TypeScript errors about missing properties
**Fix**: Check `types/video.ts` and ensure all fields are defined (e.g., `bio: string | null`)

### Issue: Event handlers in Server Components
**Fix**: Move to Client Component with `'use client'` directive

### Issue: Tailwind arbitrary values not working
**Fix**: For SVG properties (fill, stroke), use inline styles. For regular CSS properties, arbitrary values work fine.

## 🚀 Deployment Notes

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Google OAuth credentials (configured in Supabase dashboard)

### Database Migrations
Run in order:
1. Initial schema
2. Add creator bio field
3. Convert to 5-star rating system

## 📊 Current State (as of last session)

### ✅ Completed
- Video detail page with YouTube embed
- Rating system (5-star) with shadcn component
- Auth flow with Google OAuth setup
- Navbar with single "Sign In" button
- Temporary rating storage in localStorage
- Floating auth prompt banner
- Design system documentation

### 🔄 In Progress
- Homepage tab indicator color (needs to change from red to amber)

### 📋 TODO
- Implement actual rating submission to Supabase (after auth)
- Test complete auth flow
- Creator profile pages
- Video submission flow

## 💡 Key Insights

1. **Always use inline styles for SVG fill/stroke colors** - Tailwind arbitrary values don't work
2. **shadcn Rating uses `fill-current`** - It inherits from CSS `color` property
3. **HSL color system is powerful** - Easy to create theme variations
4. **Mobile-first design** - Tailwind breakpoints work well
5. **Button active states matter** - Users expect press feedback
6. **Context is critical** - Detailed comments help debugging

## 🎯 Project Goals

Create a premium platform for discovering and rating AI-generated videos with:
- Cinematic, film festival aesthetic
- Clean, minimal UI
- Fast, smooth interactions
- Professional dark theme
- Focus on video content

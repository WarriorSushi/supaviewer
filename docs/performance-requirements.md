# Performance Requirements

## Overview

SupaViewer must feel fast and responsive. Users expect instant feedback and quick page loads. This document defines performance targets, optimization strategies, and monitoring approaches.

---

## Performance Targets

### Core Web Vitals

**Largest Contentful Paint (LCP)**:
- Target: < 2.5 seconds
- Good: < 2.0 seconds
- Critical: Homepage, Browse, Video Detail

**First Input Delay (FID)**:
- Target: < 100ms
- Good: < 50ms
- Applies to: All interactive elements

**Cumulative Layout Shift (CLS)**:
- Target: < 0.1
- Good: < 0.05
- Critical: Minimize layout jumps during load

**Interaction to Next Paint (INP)**:
- Target: < 200ms
- Good: < 100ms
- Applies to: Button clicks, form inputs

### Page Load Metrics

**Time to First Byte (TTFB)**:
- Target: < 600ms
- Good: < 400ms
- Depends on: Server location, edge caching

**First Contentful Paint (FCP)**:
- Target: < 1.8 seconds
- Good: < 1.2 seconds
- Critical: Show something quickly

**Time to Interactive (TTI)**:
- Target: < 3.5 seconds
- Good: < 2.5 seconds
- Page fully interactive

**Total Page Weight**:
- Target: < 1MB initial load
- Good: < 500KB
- Compressed sizes

**Lighthouse Score**:
- Target: 90+ (mobile and desktop)
- Good: 95+
- Measure: Performance, Accessibility, Best Practices, SEO

---

## Optimization Strategies

### Image Optimization

**Use Next.js Image Component**:
```typescript
import Image from 'next/image'

// Always use for images
<Image
  src={video.thumbnail_url}
  alt={video.title}
  width={640}
  height={360}
  loading="lazy"  // or "eager" for above-fold
  placeholder="blur"
  blurDataURL={blurDataUrl}
/>
```

**Benefits**:
- Automatic WebP/AVIF conversion
- Responsive image sizing
- Lazy loading by default
- Blur placeholder for smooth loading

**Image Best Practices**:
- Serve appropriately sized images
- Use blur placeholders for perceived performance
- Preload critical images (hero sections)
- Lazy load below-fold images
- Use YouTube thumbnail CDN (fast and free)

---

### Code Splitting & Lazy Loading

**Automatic Code Splitting**:
Next.js automatically splits code by route. Each page bundle is separate.

**Dynamic Imports**:
For heavy components:
```typescript
import dynamic from 'next/dynamic'

// Admin dashboard (large bundle)
const AdminDashboard = dynamic(() => import('@/components/admin/dashboard'), {
  loading: () => <LoadingSkeleton />,
  ssr: false
})

// Heavy chart library
const VideoChart = dynamic(() => import('./video-chart'), {
  loading: () => <div>Loading chart...</div>
})
```

**When to Use Dynamic Imports**:
- Admin components (only for admins)
- Heavy visualization libraries
- Modals/dialogs (load on demand)
- Below-fold content
- Features used by < 50% of users

---

### React Server Components

**Default to Server Components**:
Most components should be Server Components.

**Benefits**:
- Zero JavaScript sent to client
- Can query database directly
- No hydration cost
- Faster initial load

**Use Client Components Only When**:
- Need event handlers (onClick, onChange)
- Need React hooks (useState, useEffect)
- Need browser APIs
- Need real-time interactivity

**Pattern**:
```typescript
// Server Component (default)
export default async function VideoPage({ params }) {
  const video = await getVideo(params.id)  // Server-side
  
  return (
    <div>
      <VideoInfo video={video} />  {/* Server Component */}
      <VideoRating videoId={video.id} />  {/* Client Component */}
    </div>
  )
}
```

---

### Static Generation & ISR

**Static Generation** (Fastest):
Generate pages at build time.

**Good for**:
- Homepage (with ISR)
- About page
- Any page with infrequent changes

```typescript
// app/page.tsx
export const revalidate = 300  // Revalidate every 5 minutes

export default async function HomePage() {
  const featuredVideos = await getFeaturedVideos()
  return <FeaturedSection videos={featuredVideos} />
}
```

**ISR (Incremental Static Regeneration)**:
Static with periodic rebuilds.

**Good for**:
- Video detail pages (revalidate every 5-10 minutes)
- Creator profiles
- Browse page

**Pattern**:
```typescript
// Revalidate every 10 minutes
export const revalidate = 600

// Or revalidate on-demand after updates
import { revalidatePath } from 'next/cache'
revalidatePath('/video/[id]')
```

---

### Database Query Optimization

**Use Indexes**:
Create indexes on frequently queried fields:
- video.status
- video.creator_id
- video.created_at
- video.avg_rating
- creator.slug
- ratings.video_id, ratings.user_id

**Limit Data Fetching**:
```typescript
// ❌ Bad: Fetch all fields
const videos = await supabase.from('videos').select('*')

// ✅ Good: Fetch only needed fields
const videos = await supabase
  .from('videos')
  .select('id, title, thumbnail_url, avg_rating, creator:creators(name, slug)')
  .limit(20)
```

**Use Pagination**:
```typescript
// Paginate results
const videos = await supabase
  .from('videos')
  .select('*', { count: 'exact' })
  .range(0, 19)  // First 20 results
```

**Avoid N+1 Queries**:
```typescript
// ❌ Bad: Query for each video's creator
for (const video of videos) {
  const creator = await getCreator(video.creator_id)
}

// ✅ Good: Join in single query
const videos = await supabase
  .from('videos')
  .select('*, creator:creators(*)')
```

**Use Database Views** (Optional):
Create views for complex queries:
```sql
CREATE VIEW video_list_view AS
SELECT 
  v.id, v.title, v.thumbnail_url, v.avg_rating,
  c.name as creator_name, c.slug as creator_slug
FROM videos v
JOIN creators c ON v.creator_id = c.id
WHERE v.status = 'approved';
```

---

### Caching Strategy

**Edge Caching** (Vercel):
Automatic for static content and ISR pages.

**API Route Caching**:
```typescript
// Cache API response
export async function GET(request: Request) {
  const data = await fetchData()
  
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  })
}
```

**Client-Side Caching**:
Use SWR or React Query for client-side caching (if needed).

**Supabase Caching**:
Supabase has connection pooling and query caching built-in.

---

### Bundle Size Optimization

**Analyze Bundle**:
```bash
# Build with bundle analysis
npm run build
# Check .next/analyze/ for report
```

**Reduce Dependencies**:
- Avoid large libraries when possible
- Use tree-shaking (automatic with ES modules)
- Import only what you need:
  ```typescript
  // ❌ Bad: Imports entire library
  import _ from 'lodash'
  
  // ✅ Good: Import specific function
  import { debounce } from 'lodash-es'
  ```

**Code Splitting**:
- Automatic by Next.js routes
- Use dynamic imports for heavy components
- Lazy load below-fold content

---

### Font Optimization

**Use next/font**:
```typescript
import { Outfit } from 'next/font/google'

const outfit = Outfit({ 
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  preload: true
})

export default function RootLayout({ children }) {
  return (
    <html className={outfit.className}>
      <body>{children}</body>
    </html>
  )
}
```

**Benefits**:
- Self-hosted fonts (no external request)
- Automatic font optimization
- Zero layout shift
- Font subsetting

---

### JavaScript Optimization

**Minimize JavaScript**:
- Use Server Components where possible
- Defer non-critical scripts
- Remove unused code

**Optimize Event Handlers**:
```typescript
// Debounce search input
import { debounce } from 'lodash-es'

const debouncedSearch = debounce((query) => {
  performSearch(query)
}, 300)

<Input onChange={(e) => debouncedSearch(e.target.value)} />
```

**Virtualize Long Lists** (If Needed):
For very long lists (100+ items), use virtualization:
```typescript
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={600}
  itemCount={videos.length}
  itemSize={200}
>
  {({ index, style }) => (
    <div style={style}>
      <VideoCard video={videos[index]} />
    </div>
  )}
</FixedSizeList>
```

---

### Network Optimization

**Prefetching**:
Next.js automatically prefetches links in viewport:
```typescript
import Link from 'next/link'

// Automatically prefetched on hover
<Link href="/video/123" prefetch={true}>
  Watch Video
</Link>
```

**Parallel Data Fetching**:
```typescript
// Fetch multiple resources in parallel
const [videos, creators, stats] = await Promise.all([
  getVideos(),
  getCreators(),
  getStats()
])
```

**HTTP/2 & HTTP/3**:
Vercel supports these automatically. Multiple requests in parallel without blocking.

---

### Third-Party Script Optimization

**YouTube Embeds**:
Use facade pattern (load on interaction):
```typescript
// Show thumbnail initially
// Load iframe on click
const [loadPlayer, setLoadPlayer] = useState(false)

{!loadPlayer ? (
  <div onClick={() => setLoadPlayer(true)}>
    <Image src={thumbnail} alt="Video" />
    <PlayButton />
  </div>
) : (
  <YouTubeEmbed videoId={videoId} />
)}
```

**Analytics Scripts**:
Load after page interactive:
```typescript
import Script from 'next/script'

<Script
  src="https://analytics.example.com/script.js"
  strategy="lazyOnload"
/>
```

---

## Performance Monitoring

### Tools

**Lighthouse** (Primary):
- Run on every deploy (CI/CD)
- Test mobile and desktop
- Track scores over time

**Web Vitals** (Production):
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

**Vercel Analytics**:
- Real user monitoring
- Track Core Web Vitals
- See performance by page/device
- Free tier included

**Chrome DevTools**:
- Network tab: Check request sizes
- Performance tab: Identify bottlenecks
- Lighthouse: On-demand audits

### Monitoring Checklist

Weekly:
- [ ] Check Vercel Analytics dashboard
- [ ] Review slowest pages
- [ ] Monitor bundle sizes
- [ ] Check error rates

Monthly:
- [ ] Run full Lighthouse audits
- [ ] Analyze performance trends
- [ ] Review and optimize slowest queries
- [ ] Check for regressions

---

## Performance Budget

Set limits and alert if exceeded:

**JavaScript Bundle**:
- Main bundle: < 200KB (compressed)
- Per-route chunks: < 100KB each
- Total JavaScript: < 500KB

**Images**:
- Thumbnail: < 50KB (compressed)
- Hero images: < 200KB
- Total images per page: < 2MB

**Fonts**:
- Total font files: < 100KB
- Use variable fonts if possible

**Third-Party Scripts**:
- Limit to essential only
- Total third-party: < 100KB

**API Response Times**:
- Simple queries: < 100ms
- Complex queries: < 500ms
- Submission/rating: < 1s

---

## Device-Specific Optimization

### Mobile

**Priority**:
- Smaller images (responsive)
- Less JavaScript
- Touch-friendly targets (min 44x44px)
- Reduced animations

**Specific Optimizations**:
- Serve mobile-optimized images
- Reduce animation complexity
- Simplify layouts
- Lazy load aggressively

### Desktop

**Priority**:
- Take advantage of larger screen
- Enable hover effects
- Preload more content
- Richer interactions

---

## Loading States

**Skeleton Screens**:
Better than spinners—show content structure:
```typescript
<div className="animate-pulse">
  <div className="h-48 bg-slate-700 rounded-lg" />
  <div className="h-4 bg-slate-700 rounded mt-4 w-3/4" />
  <div className="h-4 bg-slate-700 rounded mt-2 w-1/2" />
</div>
```

**Progressive Enhancement**:
- Show layout immediately
- Load content progressively
- Critical content first
- Non-critical content lazy loaded

---

## Performance Testing

### Before Each Release

1. **Run Lighthouse**:
   ```bash
   lighthouse https://supaviewer.com --view
   ```
   
2. **Test on Real Devices**:
   - iPhone (Safari)
   - Android (Chrome)
   - Desktop (Chrome, Firefox, Safari)

3. **Network Throttling**:
   - Test on 3G (mobile)
   - Test on slow connections
   - Ensure graceful degradation

4. **Load Testing** (If Needed):
   - Use tools like k6 or Artillery
   - Test API endpoints under load
   - Ensure database can handle concurrent users

---

## Performance Checklist

Before launch:
- [ ] Lighthouse score 90+ on all critical pages
- [ ] LCP < 2.5s on homepage, browse, video pages
- [ ] All images use Next.js Image component
- [ ] Images have appropriate sizes
- [ ] Fonts optimized with next/font
- [ ] Code splitting implemented
- [ ] Server Components used by default
- [ ] API responses cached appropriately
- [ ] Database queries optimized with indexes
- [ ] No unnecessary JavaScript
- [ ] Third-party scripts minimized
- [ ] Loading states everywhere
- [ ] Mobile tested and optimized
- [ ] Performance monitoring enabled

---

## Common Performance Issues

### Slow Initial Load
**Causes**: Large bundles, unoptimized images, blocking scripts
**Solutions**: Code splitting, image optimization, async scripts

### Layout Shift
**Causes**: Images without dimensions, dynamic content insertion
**Solutions**: Set image dimensions, reserve space for dynamic content

### Slow Interactions
**Causes**: Large React trees, expensive re-renders
**Solutions**: Memoization, virtualization, optimize state

### Slow API Responses
**Causes**: Missing indexes, N+1 queries, no caching
**Solutions**: Add indexes, optimize queries, implement caching

---

## Long-Term Performance

### Ongoing Maintenance

**Monitor Continuously**:
- Set up alerts for performance regressions
- Track bundle size over time
- Review slowest queries monthly
- Optimize as platform grows

**Scale Considerations**:
- Database: Add read replicas if needed
- CDN: Images served from global CDN
- Caching: Add Redis if query caching needed
- Database: Partition large tables if > 1M rows

**Performance Culture**:
- Performance as a feature
- Check performance before merging PRs
- Set performance budgets
- Celebrate performance wins

Speed is a feature—make it a priority from day one.
# Technical Stack

## Architecture Overview

SupaViewer is built as a modern, performant web application using a JAMstack approach with server-side capabilities. The architecture prioritizes speed, modularity, and developer experience while keeping costs low during MVP phase.

## Frontend Framework

### Next.js 15 (App Router)
**Why**: Industry-standard React framework with exceptional performance features, perfect Vercel integration, and extensive community support.

**Key Features We Use**:
- App Router for modern routing patterns
- React Server Components for zero-JS pages where possible
- Streaming UI for progressive loading
- Image optimization out of the box
- API routes for backend logic
- ISR (Incremental Static Regeneration) for video pages

**Why Not Alternatives**: Astro would be faster but less flexible for future features. SvelteKit is great but smaller ecosystem. Next.js gives us the best balance.

## UI Layer

### React 18
Standard component library. We use Server Components by default, Client Components only when interactivity is needed.

### TypeScript
Type safety throughout the application. Reduces bugs, improves DX, makes the codebase more maintainable.

### Tailwind CSS
Utility-first CSS for rapid, consistent styling. Perfect for our Cinema Bold design system.

### shadcn/ui
High-quality, accessible component primitives built on Radix UI. We copy components into our codebase and customize them. Not a dependency—we own the code.

**Components We Use**:
- Button, Card, Badge
- Dialog, Dropdown Menu, Tabs
- Form, Input, Textarea, Select
- Avatar, Separator
- Toast (notifications)

### Lucide React
Icon library. Clean, consistent icons with small bundle size.

## Backend & Database

### Supabase
**What We Use**:
- **PostgreSQL Database**: Main data store (videos, creators, ratings, users)
- **Supabase Auth**: Authentication system (email, OAuth)
- **Row Level Security (RLS)**: Database-level permissions
- **Realtime** (future): For live updates if needed
- **Storage** (future): For creator avatars/assets

**Why Supabase**: 
- Generous free tier for MVP
- PostgreSQL is robust and scalable
- Built-in auth saves development time
- RLS means security is at database level
- Easy integration with Next.js

### Database Client
Use `@supabase/ssr` for Next.js App Router compatibility. Handles authentication cookies correctly in server components.

## State Management

### Zustand (Lightweight)
**When to Use**: Complex global state that needs to be shared across many components (e.g., admin dashboard filters, user preferences).

**When NOT to Use**: Simple component state (use React useState), server data (use React Server Components), forms (use react-hook-form).

Keep state minimal. Most data should come from the server.

## Form Handling

### React Hook Form
Industry standard for forms. Excellent performance, minimal re-renders.

### Zod
Schema validation. Define schemas once, use for both client and server validation. TypeScript integration is excellent.

**Pattern**: Define Zod schema → generate TypeScript types → validate on client → validate again on server.

## Hosting & Deployment

### Vercel
**Why**: Built by the Next.js team, zero-config deployment, excellent performance, generous free tier.

**Features We Use**:
- Automatic deployments from Git
- Preview deployments for every PR
- Edge functions for API routes
- Environment variables management
- Analytics (if needed)

### Supabase Cloud
Hosted PostgreSQL, Auth, and Storage. Free tier is sufficient for MVP.

## Development Tools

### Package Manager: pnpm
Faster than npm, more efficient disk usage, strict dependency resolution.

### Code Quality
- ESLint (Next.js config)
- Prettier (code formatting)
- TypeScript strict mode

### Git Workflow
- Main branch = production
- Feature branches for new work
- Vercel auto-deploys main branch

## Key Dependencies

```
Core:
- next@15.x
- react@18.x
- typescript@5.x

Supabase:
- @supabase/ssr
- @supabase/supabase-js

Styling:
- tailwindcss
- tailwind-merge
- clsx

Forms & Validation:
- react-hook-form
- zod
- @hookform/resolvers

UI:
- @radix-ui/* (via shadcn)
- lucide-react

State (if needed):
- zustand

Utilities:
- date-fns (date formatting)
```

## Performance Strategy

### Static Where Possible
- Homepage, browse page, creator profiles: Generate statically, revalidate every few minutes
- Video detail pages: ISR with revalidation

### Server Components Default
Most components are React Server Components. Only use Client Components when you need:
- Event handlers (onClick, onChange)
- Browser APIs (localStorage, window)
- React hooks (useState, useEffect)
- Real-time interactivity

### Image Optimization
Use Next.js Image component for all images. Automatic WebP conversion, lazy loading, responsive sizes.

### Code Splitting
Automatic with Next.js. Heavy components (admin dashboard) are automatically split into separate bundles.

## API Architecture

### Next.js Route Handlers
API routes in `app/api/*` for:
- Video submission
- Rating videos
- Admin actions
- Any backend logic

### Server Actions
For form submissions and mutations. More ergonomic than API routes for simple operations.

### Supabase Direct
For reads, often query Supabase directly from Server Components. No API route needed.

## Security Approach

### Row Level Security (RLS)
All security rules enforced at database level. Even if someone bypasses the app, they can't access unauthorized data.

### Environment Variables
Sensitive keys in Vercel environment variables. Never commit to Git.

### Authentication
Supabase Auth handles everything. Support email/password and OAuth (Google, GitHub).

## Why This Stack

**Speed**: Next.js + Vercel + Supabase is one of the fastest stacks available. Sub-second page loads are standard.

**Cost**: Free tiers cover MVP completely. Only pay when we scale.

**DX**: Excellent developer experience. Fast local development, good documentation, active communities.

**Scalability**: Can handle millions of users without architectural changes.

**Modularity**: Each layer is independent. Can swap Supabase for another DB, change frontend framework, etc.

**Future-Proof**: All technologies are actively developed and have strong futures.
# Deployment Guide

## Overview

SupaViewer is deployed using Vercel (frontend and API) and Supabase (database and authentication). This guide covers initial setup, environment configuration, and deployment workflows.

---

## Prerequisites

### Required Accounts
1. **Vercel Account** - Sign up at vercel.com (free tier sufficient for MVP)
2. **Supabase Account** - Sign up at supabase.com (free tier sufficient for MVP)
3. **GitHub Account** - For Git repository
4. **Google Cloud Console** - If using Google OAuth
5. **GitHub OAuth App** - If using GitHub OAuth

### Required Tools
- Node.js 18+ installed locally
- pnpm installed (`npm install -g pnpm`)
- Git installed

---

## Initial Setup

### Step 1: Create Supabase Project

1. Go to supabase.com and create new project
2. Choose a project name: "supaviewer" or similar
3. Set a strong database password (save this securely)
4. Choose region closest to your target audience
5. Wait for project to finish setting up (2-3 minutes)

### Step 2: Configure Supabase Database

After project creation:

1. Go to SQL Editor in Supabase dashboard
2. Run database schema creation scripts (from DATABASE_SCHEMA.md)
3. Create tables in this order:
   - creators
   - videos
   - ratings
   - submissions

4. Set up Row Level Security (RLS) policies:
   - Enable RLS on all tables
   - Create policies as specified in DATABASE_SCHEMA.md

5. Create database indexes for performance

### Step 3: Configure Supabase Authentication

1. Go to Authentication → Settings
2. Enable Email authentication
3. Configure email templates (optional for MVP):
   - Customize confirmation email
   - Customize password reset email
4. Enable OAuth providers:
   - Google OAuth (requires Google Cloud Console setup)
   - GitHub OAuth (requires GitHub OAuth app setup)
5. Set Site URL to your domain (initially: localhost:3000 for development)
6. Add redirect URLs:
   - http://localhost:3000/auth/callback (development)
   - https://supaviewer.com/auth/callback (production)

### Step 4: Get Supabase Credentials

From Supabase Dashboard → Settings → API:

Copy these values (you'll need them for environment variables):
- **Project URL** (e.g., https://abcdefg.supabase.co)
- **anon/public key** (safe to expose in browser)
- **service_role key** (SECRET, never expose in browser)

---

## Environment Variables

### Development (.env.local)

Create `.env.local` file in project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin Email (for initial admin user)
ADMIN_EMAIL=your-email@example.com

# YouTube Data API (for fetching video metadata)
YOUTUBE_API_KEY=your-youtube-api-key

# Email Service (optional for MVP, for notifications)
# RESEND_API_KEY=your-resend-key
# EMAIL_FROM=noreply@supaviewer.com
```

### Production (Vercel)

Add the same variables in Vercel Dashboard → Project Settings → Environment Variables

**Important**:
- Use production Supabase URL and keys
- Set NEXT_PUBLIC_APP_URL to https://supaviewer.com
- Never commit .env.local to Git (add to .gitignore)

---

## OAuth Setup

### Google OAuth

1. Go to Google Cloud Console
2. Create new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Configure consent screen:
   - App name: SupaViewer
   - User support email: your email
   - Developer contact: your email
6. Create OAuth client:
   - Application type: Web application
   - Name: SupaViewer
   - Authorized redirect URIs:
     - https://your-project.supabase.co/auth/v1/callback
7. Copy Client ID and Client Secret
8. In Supabase Dashboard → Authentication → Providers → Google:
   - Enable Google provider
   - Paste Client ID and Secret
   - Save

### GitHub OAuth

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Create new OAuth App:
   - Application name: SupaViewer
   - Homepage URL: https://supaviewer.com
   - Authorization callback URL: https://your-project.supabase.co/auth/v1/callback
3. Copy Client ID and generate Client Secret
4. In Supabase Dashboard → Authentication → Providers → GitHub:
   - Enable GitHub provider
   - Paste Client ID and Secret
   - Save

---

## Local Development

### First Time Setup

```bash
# Clone repository
git clone https://github.com/your-username/supaviewer.git
cd supaviewer

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
pnpm dev
```

Visit http://localhost:3000

### Development Workflow

```bash
# Start development server
pnpm dev

# Run type checking
pnpm type-check

# Run linting
pnpm lint

# Build for production (test locally)
pnpm build
pnpm start
```

---

## Vercel Deployment

### Initial Setup

1. **Connect GitHub Repository**:
   - Go to vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

2. **Configure Build Settings**:
   - Framework Preset: Next.js
   - Build Command: `pnpm build` (or `npm run build`)
   - Output Directory: `.next`
   - Install Command: `pnpm install`
   - Node.js Version: 18.x

3. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all variables from your .env.local
   - Mark sensitive keys (like SUPABASE_SERVICE_ROLE_KEY) as secret

4. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for first deployment
   - Vercel will provide a URL: https://supaviewer.vercel.app

### Custom Domain Setup

1. **Buy Domain** (if you haven't):
   - supaviewer.com is already owned by you

2. **Add Domain in Vercel**:
   - Go to Project Settings → Domains
   - Add "supaviewer.com"
   - Add "www.supaviewer.com" (optional)

3. **Configure DNS**:
   - Go to your domain registrar (where you bought domain)
   - Add these DNS records:
   
   **For apex domain (supaviewer.com)**:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```
   
   **For www subdomain**:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. **Wait for DNS Propagation**:
   - Can take 24-48 hours
   - Vercel will auto-provision SSL certificate

5. **Update Supabase Site URL**:
   - Go to Supabase Dashboard → Authentication → Settings
   - Update Site URL to: https://supaviewer.com
   - Add redirect URL: https://supaviewer.com/auth/callback

---

## Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

**Production Deployments**:
- Push to `main` branch → Deploys to supaviewer.com
- Every commit triggers build and deploy
- Failed builds don't affect production

**Preview Deployments**:
- Open a PR → Vercel creates preview deployment
- Each PR commit updates preview
- Preview URL: https://supaviewer-git-branch-name.vercel.app

### Deployment Workflow

```bash
# Develop locally on feature branch
git checkout -b feature/new-feature
# Make changes, test locally
pnpm dev

# Commit and push
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Create PR on GitHub
# Vercel creates preview deployment
# Review preview, get feedback

# Merge to main
# Vercel automatically deploys to production
```

---

## Database Migrations

### Making Schema Changes

1. **Create Migration File**:
   - In Supabase Dashboard → SQL Editor
   - Write SQL migration
   - Test on development project first

2. **Run Migration**:
   - Execute SQL in Supabase Dashboard
   - Or use Supabase CLI (recommended for version control)

3. **Document Migration**:
   - Update DATABASE_SCHEMA.md
   - Note changes in CHANGELOG.md

### Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Create migration
supabase migration new add_new_field

# Edit migration file, then apply
supabase db push
```

---

## Monitoring & Logging

### Vercel Analytics

1. Enable in Vercel Dashboard → Analytics
2. Monitor:
   - Page views
   - User sessions
   - Web Vitals (performance)
   - Top pages

### Supabase Monitoring

1. Go to Supabase Dashboard → Reports
2. Monitor:
   - Database size
   - API requests
   - Active connections
   - Query performance

### Error Tracking (Optional)

Consider adding:
- **Sentry** for error tracking
- **LogRocket** for session replay
- Integration is simple, add SDK and API key

---

## Performance Optimization

### Vercel Optimizations

Automatic:
- Edge Functions for API routes
- Image optimization via next/image
- Automatic code splitting
- CDN caching

Manual:
- Set cache headers on API routes
- Use ISR for static pages
- Prefetch critical resources

### Supabase Optimizations

1. **Database Indexes**:
   - Create indexes on frequently queried fields
   - Monitor slow queries in Dashboard

2. **Connection Pooling**:
   - Supabase provides automatically
   - Use transaction mode for API routes

3. **RLS Performance**:
   - Keep RLS policies simple
   - Use indexes on RLS policy fields

---

## Backup & Recovery

### Database Backups

**Automatic**:
- Supabase automatically backs up daily
- Retained for 7 days (free tier)
- Upgrade to Pro for more retention

**Manual**:
- Download backup from Dashboard → Database → Backups
- Export as SQL file
- Store securely (encrypted storage)

### Disaster Recovery

If database is lost:
1. Create new Supabase project
2. Restore from backup SQL file
3. Update environment variables
4. Redeploy Vercel project

**Prevention**:
- Keep DATABASE_SCHEMA.md updated
- Version control migrations
- Test backups regularly

---

## Security Checklist

Before production launch:

- [ ] Environment variables set correctly in Vercel
- [ ] Service role key is secret (not in browser)
- [ ] RLS policies enabled on all tables
- [ ] OAuth redirect URLs configured
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Sensitive data not logged
- [ ] Admin routes check authentication
- [ ] Input validation on all forms
- [ ] Rate limiting considered (if needed)
- [ ] CORS configured correctly
- [ ] Database password is strong
- [ ] No hardcoded secrets in code

---

## Rollback Procedure

If deployment has issues:

### Instant Rollback in Vercel

1. Go to Deployments in Vercel Dashboard
2. Find previous working deployment
3. Click "..." → Promote to Production
4. Previous version is live immediately

### Database Rollback

1. Go to Supabase Dashboard → Database → Backups
2. Select backup before issue occurred
3. Restore backup
4. May require application code changes if schema changed

---

## Scaling Considerations

### When to Upgrade

**Vercel**:
- Pro plan when:
  - Need more team members
  - Want advanced analytics
  - Exceed free tier limits

**Supabase**:
- Pro plan when:
  - Database > 500MB
  - Need more simultaneous connections
  - Need point-in-time recovery
  - Need custom domains for APIs

### Performance Thresholds

Monitor these metrics:
- Page load time < 2 seconds
- API response time < 500ms
- Database query time < 100ms
- 99.9% uptime

If metrics degrade, investigate:
- Database indexes
- N+1 query problems
- Unnecessary data fetching
- Large bundle sizes

---

## Maintenance Tasks

### Weekly
- Check error logs in Vercel
- Monitor database size in Supabase
- Review new submissions (admin task)

### Monthly
- Review analytics and user growth
- Check for dependency updates
- Test backup restore procedure
- Review and rotate secrets if needed

### Quarterly
- Database performance audit
- Security audit
- User feedback review
- Feature prioritization

---

## Troubleshooting

### Common Issues

**Build Fails on Vercel**:
- Check build logs for errors
- Ensure dependencies are in package.json
- Verify TypeScript types are correct
- Check environment variables are set

**Database Connection Fails**:
- Verify Supabase URL and keys
- Check RLS policies aren't blocking queries
- Ensure service role key used for admin operations

**OAuth Not Working**:
- Verify redirect URLs match exactly
- Check OAuth credentials in Supabase
- Ensure provider (Google/GitHub) app is configured
- Check browser console for errors

**Slow Page Loads**:
- Check Vercel Analytics for slow pages
- Review database queries (use EXPLAIN)
- Optimize images (use next/image)
- Check for large JavaScript bundles

### Getting Help

- Vercel Docs: vercel.com/docs
- Supabase Docs: supabase.com/docs
- Next.js Docs: nextjs.org/docs
- GitHub Issues: For project-specific issues
- Discord Communities: Vercel and Supabase have active Discords

---

## Costs Estimate

### Free Tier (MVP)

**Vercel**:
- Bandwidth: 100GB
- Builds: 6,000 minutes/month
- Sufficient for: 10,000-50,000 monthly visitors

**Supabase**:
- Database: 500MB
- Storage: 1GB
- Sufficient for: 1,000+ videos, 10,000+ users

**Total Cost**: $0/month for MVP

### Projected Costs at Scale

**5,000 Monthly Active Users**:
- Vercel: $0-20/month
- Supabase: $0-25/month
- Total: $0-45/month

**50,000 Monthly Active Users**:
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Total: $45/month

Costs are very affordable until significant scale.
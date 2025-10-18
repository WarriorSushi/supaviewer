# Admin Access Setup

## Overview

Admin access in SupaViewer is controlled through email-based authentication. The admin system is configured in two places that must stay in sync:

1. **Database RLS Policies** (`supabase/migrations/001_initial_schema.sql`)
2. **Application Code** (`lib/admin-auth.ts`)

## Current Admin Users

Admin users are configured via the `ADMIN_EMAILS` environment variable (comma-separated list).

## How Admin Access Works

### 1. Database Level (RLS Policies)

The database has Row Level Security (RLS) policies that check if the authenticated user's email matches the admin email. These policies control:

- **Creators**: Insert, update, delete operations
- **Videos**: Insert, update, delete operations
- **Submissions**: View all, update, delete operations
- **Ratings**: Delete any rating

Example from RLS policy:
```sql
CREATE POLICY "Admins can insert videos"
  ON public.videos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@example.com'
    )
  );
```

### 2. Application Level (UI/API)

The application uses the `isAdmin()` helper function from `lib/admin-auth.ts` to:

- Control access to the `/admin` routes
- Show/hide admin UI elements
- Validate admin API endpoints

```typescript
export function isAdmin(user: User | null): boolean {
  if (!user || !user.email) return false

  // Admin emails from environment variable (comma-separated)
  const adminEmailsString = process.env.ADMIN_EMAILS || ''
  const adminEmails = adminEmailsString.split(',').map(email => email.trim()).filter(Boolean)

  return adminEmails.includes(user.email)
}
```

## Adding New Admin Users

To add a new admin user, you must update **both** locations:

### Step 1: Update Database RLS Policies

Edit `supabase/migrations/001_initial_schema.sql` (or create a new migration) and update all admin checks:

```sql
-- Find all instances of:
AND auth.users.email = 'admin@example.com'

-- Change to:
AND auth.users.email IN ('admin@example.com', 'newadmin@example.com')
```

Then run the migration:
```bash
supabase db reset  # For local development
# OR
supabase db push   # For production
```

### Step 2: Update Application Code

Edit `lib/admin-auth.ts`:

Update the `ADMIN_EMAILS` environment variable:

```env
# In .env.local
ADMIN_EMAILS=admin@example.com,newadmin@example.com
```

## Authentication Flow

1. User signs in with Google OAuth (or other provider)
2. Supabase creates/updates user record with email from OAuth provider
3. User navigates to `/admin`
4. Application checks `isAdmin(user)` - if false, redirects to `/?error=unauthorized`
5. Admin panel loads and shows admin-only content
6. When admin performs actions (create video, approve submission, etc.):
   - API routes check `isAdmin(user)`
   - Database RLS policies verify email matches admin list
   - Both must pass for the action to succeed

## Security Notes

- **No development bypasses**: Admin access is strictly controlled by email
- **OAuth email verification**: Email must be verified by OAuth provider
- **Database-level enforcement**: Even if application checks are bypassed, RLS policies protect data
- **Sync required**: Application and database admin lists must match

## Admin Panel Features

Admins have access to:

- **Dashboard**: Overview of submissions, videos, and stats
- **Submissions**: Review, approve, or reject video submissions
- **Videos**: Manage all videos (edit, feature, delete)
- **Creators**: Manage creator profiles
- **Analytics**: View platform statistics (future feature)

## Troubleshooting

### "Unauthorized" error when accessing `/admin`

**Cause**: Your email is not in the admin list

**Solution**:
1. Check what email you're signed in with
2. Verify that email is in `lib/admin-auth.ts` admin emails array
3. Verify that email is in database RLS policies

### Can access `/admin` but get 403 errors on API calls

**Cause**: Application code allows your email but database RLS policies don't

**Solution**: Update database RLS policies to include your email

### Can see data but can't modify it

**Cause**: Database RLS policies don't include your email for UPDATE/DELETE operations

**Solution**: Check all RLS policies (not just SELECT) include your email

## Environment Variables

Admin authentication requires the `ADMIN_EMAILS` environment variable:

```env
# Comma-separated list of admin email addresses
ADMIN_EMAILS=your-email@example.com,another-admin@example.com
```

**Important**:
- This controls application-level admin checks
- Database RLS policies must also be updated to match
- Never commit your actual admin emails to the repository

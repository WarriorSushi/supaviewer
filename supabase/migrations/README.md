# Supabase Migrations

This directory contains SQL migration files for the SupaViewer database.

## How to Run Migrations

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of the migration file you want to run
4. Paste into the SQL editor
5. **Important**: Update any configuration values (like admin emails) before running
6. Click "Run" to execute the migration

## Migration Files

### `001_initial_schema.sql`
- Creates the initial database schema
- Sets up tables: creators, videos, ratings
- Defines relationships and constraints
- **Status**: ✅ Should already be applied if database exists

### `002_rls_policies.sql` ⚠️ **ACTION REQUIRED**
- Sets up Row Level Security (RLS) policies
- Allows authenticated users to submit videos
- Admin-only access for approving/managing content
- **Before running**: Find and replace ALL instances of `'YOUR_ADMIN_EMAIL@EXAMPLE.COM'` with your actual admin email
  - Use Find & Replace (Ctrl+H) to replace all 6 instances at once
  - Example: Replace with `'john@gmail.com'` (keep the single quotes!)
- This email must match the `ADMIN_EMAILS` environment variable in Vercel
- **Status**: ⚠️ Required for video submission to work

### `003_convert_to_5_star_rating.sql`
- Converts rating system to 5-star ratings
- Updates existing ratings data
- **Status**: ✅ Should already be applied

### `004_add_email_to_creators.sql`
- Adds email field to creators table
- **Status**: ✅ Should already be applied

### `005_add_submitted_by_user_id.sql`
- Adds `submitted_by_user_id` column to videos table
- Tracks which user submitted each video
- **Status**: ✅ Should already be applied

### `006_update_admin_email.sql` ⚠️ **ACTION REQUIRED**
- Updates all admin RLS policies with correct admin email
- Uses drsyedirfan93@gmail.com as admin
- **Status**: ⚠️ Run this to fix admin dashboard access
- **No changes needed** - just copy and run in SQL Editor

### `thumbnail_fix.sql`
- Fixes thumbnail URL handling
- **Status**: ✅ Should already be applied

## Important Notes

- **Run migrations in order** (001, 002, etc.)
- **Always backup your database** before running migrations in production
- **Test migrations locally** if possible before running in production
- Some migrations may need customization (like admin emails)

## Environment Variables to Set

After running migrations, make sure these environment variables are set in Vercel:

- `ADMIN_EMAILS` - Comma-separated list of admin emails (must match database config)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for server-side)
- `NEXT_PUBLIC_APP_URL` - Your production URL (e.g., https://supaviewer.com)

## Troubleshooting

### "Permission denied" errors
- Make sure RLS policies are properly configured
- Check that the admin email in the database matches Vercel environment variable

### "Policy already exists" errors
- The migration files include `DROP POLICY IF EXISTS` statements
- You can safely re-run migrations if needed

### Video submission fails with 500 error
- Run `002_rls_policies.sql` to set up proper permissions
- Verify admin email is configured correctly
- Check Vercel logs for specific error messages

# Database Migration Instructions

## Execute the Schema Migration

### Using Supabase Dashboard (Easiest Method)

1. **Login to Supabase Dashboard**
   - Go to: https://app.supabase.com/project/ecjktitotwxpnowglegq
   - Login with your credentials

2. **Open SQL Editor**
   - Click on the **SQL Editor** icon in the left sidebar
   - Or go directly to: https://app.supabase.com/project/ecjktitotwxpnowglegq/sql/new

3. **Run the Migration**
   - Click **New Query**
   - Open the file `supabase/migrations/001_initial_schema.sql`
   - Copy ALL the contents (Ctrl+A, Ctrl+C)
   - Paste into the SQL Editor
   - Click **Run** button (or press Ctrl+Enter)

4. **Verify Success**
   - You should see a success message
   - Check the **Table Editor** to confirm tables were created:
     - creators
     - videos
     - ratings
     - submissions

### What This Migration Creates

**Tables:**
- ✅ `creators` - Stores creator profiles
- ✅ `videos` - Stores all AI-generated videos
- ✅ `ratings` - Stores user ratings (1-10)
- ✅ `submissions` - Stores pending video submissions

**Indexes:**
- Performance indexes on all frequently-queried columns
- Composite indexes for complex queries (e.g., homepage, browse page)

**Row Level Security (RLS):**
- All tables have RLS enabled
- Policies control who can read/write data
- Admin access controlled via environment variables and database policies

**Triggers:**
- Auto-update `updated_at` timestamps
- Auto-calculate `avg_rating` and `total_ratings` when ratings change

**Helper Functions:**
- `increment_video_view_count()` - Increment view counts

## Verify the Migration

After running the migration, verify in the Supabase Dashboard:

1. **Table Editor** (left sidebar)
   - Confirm all 4 tables exist
   - Check that columns match the schema

2. **SQL Editor** - Run this query:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```
   Should return: creators, ratings, submissions, videos

3. **Check RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public';
   ```
   All should show `rowsecurity = true`

## Troubleshooting

**If migration fails:**
- Check that you're using the Service Role Key (not the anon key)
- Make sure no tables already exist with these names
- Check the error message for specific issues

**To reset and try again:**
```sql
-- WARNING: This deletes all data!
DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.ratings CASCADE;
DROP TABLE IF EXISTS public.videos CASCADE;
DROP TABLE IF EXISTS public.creators CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS public.update_video_rating_stats CASCADE;
DROP FUNCTION IF EXISTS public.increment_video_view_count CASCADE;
```

Then run the migration again.

## Next Steps

After successful migration:
1. ✅ Test the database connection in your Next.js app
2. ✅ Create some test data
3. ✅ Set up Google OAuth authentication
4. ✅ Build the UI components

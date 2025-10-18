/**
 * Run database migration
 * This script executes the SQL migration file against your Supabase database
 *
 * Usage: node scripts/run-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing Supabase credentials in .env.local');
    process.exit(1);
  }

  console.log('Connecting to Supabase...');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Read the migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql');
  console.log(`Reading migration file: ${migrationPath}`);

  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('Executing migration...');
  console.log('This may take a few moments...\n');

  try {
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!');
    console.log('\nCreated tables:');
    console.log('  - public.creators');
    console.log('  - public.videos');
    console.log('  - public.ratings');
    console.log('  - public.submissions');
    console.log('\n✅ All indexes, triggers, and RLS policies have been applied.');

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

runMigration();

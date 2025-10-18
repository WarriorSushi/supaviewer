import { User } from '@supabase/supabase-js'

/**
 * Check if a user has admin privileges
 * Admin access is granted to specific email addresses from environment variables
 * This matches the RLS policies in the database
 */
export function isAdmin(user: User | null): boolean {
  if (!user || !user.email) return false

  // Admin emails from environment variable (comma-separated)
  // Must match RLS policies in database
  const adminEmailsString = process.env.ADMIN_EMAILS || ''
  const adminEmails = adminEmailsString.split(',').map(email => email.trim()).filter(Boolean)

  return adminEmails.includes(user.email)
}

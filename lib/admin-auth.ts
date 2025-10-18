import { User } from '@supabase/supabase-js'

/**
 * Check if a user has admin privileges
 * Admin access is granted to specific email addresses
 * This matches the RLS policies in the database
 */
export function isAdmin(user: User | null): boolean {
  if (!user || !user.email) return false

  // Admin emails (must match RLS policies in database)
  const adminEmails = ['drsyedirfan93@gmail.com']

  return adminEmails.includes(user.email)
}

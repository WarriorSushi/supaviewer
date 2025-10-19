'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User, Upload } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface UserMenuProps {
  user: SupabaseUser
}

export function UserMenu({ user }: UserMenuProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast.success('Logged out successfully')
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred' || 'Failed to log out')
    } finally {
      setIsLoading(false)
    }
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Avatar className="w-8 h-8 ring-2 ring-border">
            <AvatarImage src={user.user_metadata?.avatar_url} alt={userName} />
            <AvatarFallback className="bg-gradient-to-br from-crimson to-amber text-white text-sm font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline text-sm font-medium text-foreground">
            {userName}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/submit" className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            Submit Video
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            My Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout} disabled={isLoading} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          {isLoading ? 'Logging out...' : 'Log out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

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
import { LogOut, User as UserIcon, Shield } from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'

interface AdminHeaderProps {
  user: User
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast.success('Logged out successfully')
      window.location.href = '/'
    } catch (error: any) {
      toast.error(error.message || 'Failed to log out')
    } finally {
      setIsLoading(false)
    }
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin'
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Left: Page Title - Will be replaced by page content */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium">Admin Panel</span>
        </div>
      </div>

      {/* Right: User Menu */}
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Avatar className="w-10 h-10 ring-2 ring-border">
                <AvatarImage src={user.user_metadata?.avatar_url} alt={userName} />
                <AvatarFallback className="bg-gradient-to-br from-crimson to-amber text-white font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Shield className="w-3 h-3 text-crimson" />
                  <span className="text-xs text-crimson font-semibold">Administrator</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <a href="/" className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                View Public Site
              </a>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout} disabled={isLoading} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              {isLoading ? 'Logging out...' : 'Log out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Plus, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Creator {
  id: string
  name: string
  slug: string
  email: string
  avatar_url?: string
}

interface CreatorSearchProps {
  onSelect: (creator: Creator | null) => void
  onCreateNew: () => void
  selectedCreator: Creator | null
  disabled?: boolean
}

export function CreatorSearch({
  onSelect,
  onCreateNew,
  selectedCreator,
  disabled = false,
}: CreatorSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Creator[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Search creators with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `/api/admin/creators/search?q=${encodeURIComponent(query)}`
        )
        const data = await response.json()

        if (response.ok) {
          setResults(data.creators || [])
          setShowResults(true)
        }
      } catch (error) {
        console.error('Error searching creators:', error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (creator: Creator) => {
    onSelect(creator)
    setQuery('')
    setShowResults(false)
  }

  const handleClear = () => {
    onSelect(null)
    setQuery('')
    setResults([])
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-3" ref={containerRef}>
      {selectedCreator ? (
        // Show selected creator
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedCreator.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-crimson to-amber text-white text-sm">
                  {getInitials(selectedCreator.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{selectedCreator.name}</p>
                <p className="text-xs text-muted-foreground">{selectedCreator.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              {!disabled && (
                <Button size="sm" variant="ghost" onClick={handleClear}>
                  Change
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Show search interface
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search existing creators by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (results.length > 0) setShowResults(true)
              }}
              className="pl-9"
              disabled={disabled}
            />
          </div>

          {/* Search Results Dropdown */}
          {showResults && (query.trim() || results.length > 0) && (
            <div className="absolute z-50 w-full max-w-lg bg-card border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Searching...
                </div>
              ) : results.length > 0 ? (
                <div className="py-2">
                  {results.map((creator) => (
                    <button
                      key={creator.id}
                      onClick={() => handleSelect(creator)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={creator.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-crimson to-amber text-white text-xs">
                          {getInitials(creator.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {creator.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {creator.email}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No creators found
                </div>
              )}
            </div>
          )}

          {/* Create New Creator Button */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onCreateNew}
            disabled={disabled}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Creator
          </Button>
        </div>
      )}
    </div>
  )
}

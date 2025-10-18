'use client'

import { X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AI_TOOLS, GENRES, SORT_OPTIONS, type SortOption } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface VideoFiltersProps {
  selectedTools: string[]
  selectedGenres: string[]
  sortBy: SortOption
  onToolsChange: (tools: string[]) => void
  onGenresChange: (genres: string[]) => void
  onSortChange: (sort: SortOption) => void
  onClearAll: () => void
}

export function VideoFilters({
  selectedTools,
  selectedGenres,
  sortBy,
  onToolsChange,
  onGenresChange,
  onSortChange,
  onClearAll,
}: VideoFiltersProps) {
  const handleToolToggle = (tool: string) => {
    if (selectedTools.includes(tool)) {
      onToolsChange(selectedTools.filter((t) => t !== tool))
    } else {
      onToolsChange([...selectedTools, tool])
    }
  }

  const handleGenreToggle = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      onGenresChange(selectedGenres.filter((g) => g !== genre))
    } else {
      onGenresChange([...selectedGenres, genre])
    }
  }

  const hasActiveFilters = selectedTools.length > 0 || selectedGenres.length > 0

  return (
    <aside className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-crimson" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear All
          </Button>
        )}
      </div>

      <Separator className="bg-border" />

      {/* AI Tools */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          AI Tools
          {selectedTools.length > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {selectedTools.length}
            </Badge>
          )}
        </h3>
        <div className="space-y-2">
          {AI_TOOLS.map((tool) => {
            const isSelected = selectedTools.includes(tool)
            return (
              <label
                key={tool}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
                    isSelected
                      ? 'bg-crimson border-crimson'
                      : 'border-border group-hover:border-muted-foreground'
                  )}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M10 3L4.5 8.5L2 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToolToggle(tool)}
                  className="sr-only"
                />
                <span
                  className={cn(
                    'text-sm transition-colors',
                    isSelected
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground group-hover:text-foreground'
                  )}
                >
                  {tool}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Genres */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          Genres
          {selectedGenres.length > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {selectedGenres.length}
            </Badge>
          )}
        </h3>
        <div className="space-y-2">
          {GENRES.map((genre) => {
            const isSelected = selectedGenres.includes(genre)
            return (
              <label
                key={genre}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
                    isSelected
                      ? 'bg-crimson border-crimson'
                      : 'border-border group-hover:border-muted-foreground'
                  )}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M10 3L4.5 8.5L2 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleGenreToggle(genre)}
                  className="sr-only"
                />
                <span
                  className={cn(
                    'text-sm transition-colors',
                    isSelected
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground group-hover:text-foreground'
                  )}
                >
                  {genre}
                </span>
              </label>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

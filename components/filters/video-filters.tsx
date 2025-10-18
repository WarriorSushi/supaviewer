'use client'

import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const AI_TOOLS = ['Sora', 'Runway Gen-3', 'Runway Gen-2', 'Kling', 'Luma', 'Pika', 'Midjourney', 'Stable Video Diffusion', 'AnimateDiff', 'Multiple Tools', 'Other']
const GENRES = ['Sci-Fi', 'Drama', 'Comedy', 'Horror', 'Documentary', 'Abstract', 'Music Video', 'Experimental', 'Nature', 'Narrative', 'Tutorial', 'Other']
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Most Viewed', value: 'views' },
]

interface FilterState {
  selectedTools: string[]
  selectedGenres: string[]
  sortBy: string
}

interface VideoFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export function VideoFilters({ filters, onFiltersChange }: VideoFiltersProps) {
  const toggleTool = (tool: string) => {
    const newTools = filters.selectedTools.includes(tool)
      ? filters.selectedTools.filter((t) => t !== tool)
      : [...filters.selectedTools, tool]
    onFiltersChange({ ...filters, selectedTools: newTools })
  }

  const toggleGenre = (genre: string) => {
    const newGenres = filters.selectedGenres.includes(genre)
      ? filters.selectedGenres.filter((g) => g !== genre)
      : [...filters.selectedGenres, genre]
    onFiltersChange({ ...filters, selectedGenres: newGenres })
  }

  const clearAll = () => {
    onFiltersChange({
      selectedTools: [],
      selectedGenres: [],
      sortBy: 'newest',
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Filters</h3>
        {(filters.selectedTools.length > 0 || filters.selectedGenres.length > 0) && (
          <button
            onClick={clearAll}
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <Separator className="bg-border" />

      {/* Sort By - moved first */}
      <div className="space-y-2 pr-2">
        <h4 className="text-xs font-semibold text-foreground">Sort By</h4>
        <Select
          value={filters.sortBy}
          onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator className="bg-border" />

      {/* Genres - moved second */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-foreground">Genre</h4>
        <div className="space-y-1.5">
          {GENRES.map((genre) => (
            <div key={genre} className="flex items-center gap-2">
              <Checkbox
                id={`genre-${genre}`}
                checked={filters.selectedGenres.includes(genre)}
                onCheckedChange={() => toggleGenre(genre)}
                className="h-3.5 w-3.5"
              />
              <Label
                htmlFor={`genre-${genre}`}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {genre}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-border" />

      {/* AI Tools - moved third */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-foreground">AI Tool</h4>
        <div className="space-y-1.5">
          {AI_TOOLS.map((tool) => (
            <div key={tool} className="flex items-center gap-2">
              <Checkbox
                id={`tool-${tool}`}
                checked={filters.selectedTools.includes(tool)}
                onCheckedChange={() => toggleTool(tool)}
                className="h-3.5 w-3.5"
              />
              <Label
                htmlFor={`tool-${tool}`}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {tool}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

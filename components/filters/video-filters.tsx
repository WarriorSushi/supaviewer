'use client'

import { useState } from 'react'
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

const AI_TOOLS = ['Sora', 'Runway', 'Kling', 'Luma', 'Pika', 'Midjourney', 'Stable Diffusion', 'Other']
const GENRES = ['Sci-Fi', 'Drama', 'Comedy', 'Horror', 'Documentary', 'Abstract', 'Music Video', 'Tutorial', 'Other']
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Most Viewed', value: 'views' },
]

export function VideoFilters() {
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('newest')

  const toggleTool = (tool: string) => {
    setSelectedTools(prev =>
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    )
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    )
  }

  const clearAll = () => {
    setSelectedTools([])
    setSelectedGenres([])
    setSortBy('newest')
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Filters</h3>
        {(selectedTools.length > 0 || selectedGenres.length > 0) && (
          <button
            onClick={clearAll}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <Separator className="bg-border" />

      {/* Sort By - moved first */}
      <div className="space-y-3 pr-2">
        <h4 className="text-sm font-semibold text-foreground">Sort By</h4>
        <Select value={sortBy} onValueChange={setSortBy}>
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
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Genre</h4>
        <div className="space-y-2">
          {GENRES.map((genre) => (
            <div key={genre} className="flex items-center gap-3">
              <Checkbox
                id={`genre-${genre}`}
                checked={selectedGenres.includes(genre)}
                onCheckedChange={() => toggleGenre(genre)}
              />
              <Label
                htmlFor={`genre-${genre}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {genre}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-border" />

      {/* AI Tools - moved third */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">AI Tool</h4>
        <div className="space-y-2">
          {AI_TOOLS.map((tool) => (
            <div key={tool} className="flex items-center gap-3">
              <Checkbox
                id={`tool-${tool}`}
                checked={selectedTools.includes(tool)}
                onCheckedChange={() => toggleTool(tool)}
              />
              <Label
                htmlFor={`tool-${tool}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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

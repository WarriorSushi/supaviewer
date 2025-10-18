'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const categories = [
  { id: 'all', label: 'All Videos' },
  { id: 'featured', label: 'Featured' },
  { id: 'latest', label: 'Latest' },
  { id: 'sci-fi', label: 'Sci-Fi' },
  { id: 'abstract', label: 'Abstract' },
  { id: 'narrative', label: 'Narrative' },
  { id: 'nature', label: 'Nature' },
]

export function CategoryTabs() {
  const [activeCategory, setActiveCategory] = useState('all')

  return (
    <div className="border-b border-border">
      <div className="container-custom">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                'px-5 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200',
                activeCategory === category.id
                  ? 'bg-crimson text-white'
                  : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

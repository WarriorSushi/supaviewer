'use client'

import { useState } from 'react'
import { Star, TrendingUp, Clock } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Tab = 'featured' | 'trending' | 'latest'

interface VideoTabsProps {
  onTabChange?: (tab: Tab) => void
}

export function VideoTabs({ onTabChange }: VideoTabsProps) {
  const [value, setValue] = useState<Tab>('featured')

  const handleChange = (newValue: string) => {
    setValue(newValue as Tab)
    onTabChange?.(newValue as Tab)
  }

  return (
    <div className="sticky top-12 md:top-16 z-30 glass mb-6">
      <Tabs
        value={value}
        onValueChange={handleChange}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-3 h-9 md:h-10 rounded-none bg-transparent p-0">
          <TabsTrigger
            value="featured"
            className="gap-1.5 md:gap-2 text-xs md:text-sm rounded-none border-b-[2px] md:border-b-[2px] !border-b-transparent data-[state=active]:!border-b-[#DC2626] data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground hover:text-foreground"
          >
            <Star className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Featured
          </TabsTrigger>
          <TabsTrigger
            value="trending"
            className="gap-1.5 md:gap-2 text-xs md:text-sm rounded-none border-b-[2px] md:border-b-[2px] !border-b-transparent data-[state=active]:!border-b-[#DC2626] data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground hover:text-foreground"
          >
            <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger
            value="latest"
            className="gap-1.5 md:gap-2 text-xs md:text-sm rounded-none border-b-[2px] md:border-b-[2px] !border-b-transparent data-[state=active]:!border-b-[#DC2626] data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground hover:text-foreground"
          >
            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Latest
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}

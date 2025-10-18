import { createClient } from '@/lib/supabase/server'
import { VideoFilters } from '@/components/filters/video-filters'
import { VideoGridWithTabs } from '@/components/home/video-grid-with-tabs'
import type { VideoWithCreator } from '@/types'

export default async function Home() {
  const supabase = await createClient()

  // Fetch all approved videos
  const { data: videos } = await supabase
    .from('videos')
    .select(`
      *,
      creator:creators(
        id,
        name,
        slug,
        avatar_url
      )
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(24)

  return (
    <div className="min-h-screen">
      {/* Main content with sidebar - YouTube-style spacing */}
      <div className="flex gap-6 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6">

        {/* Left Sidebar - Filters (Desktop only, mobile has it in navbar menu) */}
        {/* YouTube sidebar: 240px width */}
        <aside className="hidden lg:block w-60 flex-shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">
          <VideoFilters />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <VideoGridWithTabs videos={videos as VideoWithCreator[] || []} />
        </main>

      </div>
    </div>
  )
}

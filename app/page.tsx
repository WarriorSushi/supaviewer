import { createClient } from '@/lib/supabase/server'
import { HomeClient } from '@/components/home/home-client'
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

  return <HomeClient initialVideos={videos as VideoWithCreator[] || []} />
}

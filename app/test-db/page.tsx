import { createClient } from '@/lib/supabase/server'

export default async function TestDbPage() {
  const supabase = await createClient()

  // Test 1: Simple count
  const { count: videoCount, error: countError } = await supabase
    .from('videos')
    .select('*', { count: 'exact', head: true })

  // Test 2: Get approved videos
  const { data: approvedVideos, error: approvedError } = await supabase
    .from('videos')
    .select('*')
    .eq('status', 'approved')

  // Test 3: Get featured videos
  const { data: featuredVideos, error: featuredError } = await supabase
    .from('videos')
    .select('*')
    .eq('status', 'approved')
    .eq('featured', true)

  // Test 4: Get with creator join
  const { data: videosWithCreator, error: joinError } = await supabase
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
    .limit(5)

  return (
    <div className="container-custom py-20 space-y-8">
      <h1 className="text-h1 mb-4">Database Test Page</h1>

      <div className="space-y-4">
        <div className="bg-dark-surface p-4 rounded-lg">
          <h2 className="text-h3 mb-2">Test 1: Total Video Count</h2>
          {countError ? (
            <p className="text-red-500">Error: {countError.message}</p>
          ) : (
            <p className="text-green-500">Total videos: {videoCount}</p>
          )}
        </div>

        <div className="bg-dark-surface p-4 rounded-lg">
          <h2 className="text-h3 mb-2">Test 2: Approved Videos</h2>
          {approvedError ? (
            <p className="text-red-500">Error: {approvedError.message}</p>
          ) : (
            <div>
              <p className="text-green-500">Found {approvedVideos?.length} approved videos</p>
              <pre className="text-xs mt-2 overflow-auto max-h-40">
                {JSON.stringify(approvedVideos?.slice(0, 2), null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-dark-surface p-4 rounded-lg">
          <h2 className="text-h3 mb-2">Test 3: Featured Videos</h2>
          {featuredError ? (
            <p className="text-red-500">Error: {featuredError.message}</p>
          ) : (
            <div>
              <p className="text-green-500">Found {featuredVideos?.length} featured videos</p>
              <pre className="text-xs mt-2 overflow-auto max-h-40">
                {JSON.stringify(featuredVideos, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-dark-surface p-4 rounded-lg">
          <h2 className="text-h3 mb-2">Test 4: Videos with Creator Join</h2>
          {joinError ? (
            <p className="text-red-500">Error: {joinError.message}</p>
          ) : (
            <div>
              <p className="text-green-500">Found {videosWithCreator?.length} videos with creators</p>
              <pre className="text-xs mt-2 overflow-auto max-h-60">
                {JSON.stringify(videosWithCreator, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

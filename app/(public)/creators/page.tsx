import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, Film, Star } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Creators - SupaViewer',
  description: 'Browse all creators on SupaViewer',
}

export default async function CreatorsPage() {
  const supabase = await createClient()

  // Fetch all creators with their video counts
  const { data: creators } = await supabase
    .from('creators')
    .select(`
      *,
      videos:videos(count)
    `)
    .order('name', { ascending: true })

  const allCreators = creators || []

  return (
    <div className="min-h-screen">
      <div className="container-custom py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gradient-cinema mb-4">All Creators</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover the talented creators behind AI-generated videos
          </p>
        </div>

        {/* Creators Grid */}
        {allCreators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allCreators.map((creator) => {
              const videoCount = Array.isArray(creator.videos) ? creator.videos[0]?.count || 0 : 0

              return (
                <Link
                  key={creator.id}
                  href={`/creator/${creator.slug}`}
                  className="block group"
                >
                  <div className="bg-card border border-border rounded-xl p-6 hover:border-primary transition-all hover:shadow-lg">
                    {/* Avatar */}
                    <div className="flex flex-col items-center text-center mb-4">
                      <Avatar className="w-20 h-20 mb-3 ring-2 ring-border group-hover:ring-primary transition-all">
                        <AvatarImage src={creator.avatar_url || undefined} alt={creator.name} />
                        <AvatarFallback className="bg-gradient-to-br from-crimson to-amber text-white text-2xl font-bold">
                          {creator.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {creator.name}
                      </h3>

                      {creator.bio && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {creator.bio}
                        </p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-1.5">
                        <Film className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{videoCount}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg">No creators found</p>
          </div>
        )}
      </div>
    </div>
  )
}

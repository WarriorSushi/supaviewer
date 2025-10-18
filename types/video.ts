// Video types
export interface Video {
  id: string
  created_at: string
  updated_at: string
  title: string
  description: string | null
  youtube_url: string
  youtube_id: string
  thumbnail_url: string
  creator_id: string
  ai_tool: string
  genre: string | null
  duration_seconds: number
  status: 'pending' | 'approved' | 'rejected'
  featured: boolean
  avg_rating: number | null
  total_ratings: number
  view_count: number
}

export interface VideoWithCreator extends Video {
  creator: {
    id: string
    name: string
    slug: string
    avatar_url: string | null
    bio: string | null
  }
}

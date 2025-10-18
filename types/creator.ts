// Creator types
export interface Creator {
  id: string
  created_at: string
  updated_at: string
  name: string
  slug: string
  bio: string | null
  website: string | null
  twitter_handle: string | null
  avatar_url: string | null
  user_id: string | null
}

export interface CreatorWithStats extends Creator {
  video_count: number
  avg_rating: number | null
}

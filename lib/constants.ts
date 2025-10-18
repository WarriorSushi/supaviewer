// AI Tools available in the platform
export const AI_TOOLS = [
  'Sora',
  'Runway Gen-3',
  'Runway Gen-2',
  'Pika',
  'Stable Video Diffusion',
  'AnimateDiff',
  'Multiple Tools',
  'Other',
] as const

// Genres available in the platform
export const GENRES = [
  'Sci-Fi',
  'Abstract',
  'Narrative',
  'Documentary',
  'Music Video',
  'Experimental',
  'Comedy',
  'Horror',
  'Nature',
  'Other',
] as const

// Sort options for videos
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'highest_rated', label: 'Highest Rated' },
  { value: 'most_viewed', label: 'Most Viewed' },
  { value: 'most_rated', label: 'Most Rated' },
] as const

export type SortOption = typeof SORT_OPTIONS[number]['value']

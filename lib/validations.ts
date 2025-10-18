import { z } from 'zod'

// Extract YouTube video ID from various URL formats
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

// Video submission schema
export const videoSubmissionSchema = z.object({
  // Video details
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .or(z.literal('')),

  youtube_url: z
    .string()
    .url('Please enter a valid URL')
    .refine(
      (url) => extractYouTubeId(url) !== null,
      'Please enter a valid YouTube URL'
    ),

  ai_tool: z
    .string()
    .min(2, 'AI tool must be at least 2 characters')
    .max(100, 'AI tool must be less than 100 characters'),

  genre: z
    .string()
    .max(50, 'Genre must be less than 50 characters')
    .optional()
    .or(z.literal('')),

  // Creator details
  creator_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),

  creator_email: z
    .string()
    .email('Please enter a valid email address'),

  creator_website: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),

  creator_twitter: z
    .string()
    .max(50, 'Twitter handle must be less than 50 characters')
    .optional()
    .or(z.literal('')),
})

export type VideoSubmission = z.infer<typeof videoSubmissionSchema>

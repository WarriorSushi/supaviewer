'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save, Star } from 'lucide-react'
import { toast } from 'sonner'

interface Creator {
  id: string
  name: string
  slug: string
  email: string
  avatar_url?: string
}

interface Video {
  id: string
  title: string
  description: string
  youtube_id: string
  youtube_url: string
  duration: number
  ai_tool: string
  genre: string
  status: 'pending' | 'approved' | 'rejected'
  featured: boolean
  created_at: string
  updated_at: string
  avg_rating: number | null
  total_ratings: number
  creator: Creator
}

interface EditVideoModalProps {
  video: Video | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditVideoModal({
  video,
  open,
  onOpenChange,
  onSuccess,
}: EditVideoModalProps) {
  const [loading, setLoading] = useState(false)

  // Editable fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [aiTool, setAiTool] = useState('')
  const [genre, setGenre] = useState('')
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [featured, setFeatured] = useState(false)

  // Reset form when video changes
  useEffect(() => {
    if (video) {
      setTitle(video.title)
      setDescription(video.description)
      setAiTool(video.ai_tool)
      setGenre(video.genre)
      setStatus(video.status)
      setFeatured(video.featured)
    }
  }, [video])

  if (!video) return null

  const handleSave = async () => {
    setLoading(true)
    try {
      // Validate required fields
      if (!title.trim() || !description.trim() || !aiTool.trim() || !genre.trim()) {
        toast.error('Please fill in all required fields')
        return
      }

      const response = await fetch(`/api/admin/videos/${video.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          ai_tool: aiTool.trim(),
          genre: genre.trim(),
          status,
          featured,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update video')
      }

      toast.success('Video updated successfully!')
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Video</DialogTitle>
          <DialogDescription>Update video details and settings</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* YouTube Preview */}
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${video.youtube_id}`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          {/* Editable Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ai_tool">AI Tool *</Label>
                <Input
                  id="ai_tool"
                  value={aiTool}
                  onChange={(e) => setAiTool(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="genre">Genre *</Label>
                <Input
                  id="genre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Status Select */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: 'pending' | 'approved' | 'rejected') => setStatus(value)} disabled={loading}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Featured Toggle */}
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-amber" />
                <div>
                  <p className="font-medium text-foreground">Feature this video</p>
                  <p className="text-xs text-muted-foreground">
                    Featured videos appear prominently on the homepage
                  </p>
                </div>
              </div>
              <Switch checked={featured} onCheckedChange={setFeatured} disabled={loading} />
            </div>

            {/* Creator Info (Read-only) */}
            <div>
              <Label>Creator</Label>
              <div className="bg-muted/50 rounded-lg p-4 mt-2">
                <p className="font-medium text-foreground">{video.creator.name}</p>
                <p className="text-sm text-muted-foreground">{video.creator.email}</p>
              </div>
            </div>

            {/* Video Stats (Read-only) */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Duration</p>
                <p className="font-semibold text-foreground">
                  {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Avg Rating</p>
                <p className="font-semibold text-foreground">
                  {video.avg_rating ? video.avg_rating.toFixed(1) : 'N/A'} ⭐
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Total Ratings</p>
                <p className="font-semibold text-foreground">{video.total_ratings}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

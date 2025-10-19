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
import { Save, Plus, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface Creator {
  id: string
  name: string
  slug: string
  email: string
  bio?: string | null
  website?: string | null
  twitter?: string | null
  avatar_url?: string | null
  video_count?: number
}

interface CreatorEditorModalProps {
  creator: Creator | null // null means create new
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreatorEditorModal({
  creator,
  open,
  onOpenChange,
  onSuccess,
}: CreatorEditorModalProps) {
  const [loading, setLoading] = useState(false)
  const isEditing = !!creator

  // Form fields
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')
  const [twitter, setTwitter] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  // Slug state
  const [originalSlug, setOriginalSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [showSlugWarning, setShowSlugWarning] = useState(false)

  // Reset form when creator or modal state changes
  useEffect(() => {
    if (open) {
      if (creator) {
        // Editing existing creator
        setName(creator.name)
        setSlug(creator.slug)
        setOriginalSlug(creator.slug)
        setEmail(creator.email)
        setBio(creator.bio || '')
        setWebsite(creator.website || '')
        setTwitter(creator.twitter || '')
        setAvatarUrl(creator.avatar_url || '')
        setSlugManuallyEdited(false)
        setShowSlugWarning(false)
      } else {
        // Creating new creator
        setName('')
        setSlug('')
        setOriginalSlug('')
        setEmail('')
        setBio('')
        setWebsite('')
        setTwitter('')
        setAvatarUrl('')
        setSlugManuallyEdited(false)
        setShowSlugWarning(false)
      }
    }
  }, [creator, open])

  // Auto-generate slug from name (only if not manually edited)
  useEffect(() => {
    if (!slugManuallyEdited && name) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, '') // Remove leading/trailing hyphens

      setSlug(generatedSlug)
    }
  }, [name, slugManuallyEdited])

  // Check if slug changed for existing creator
  useEffect(() => {
    if (isEditing && slug !== originalSlug && creator?.video_count && creator.video_count > 0) {
      setShowSlugWarning(true)
    } else {
      setShowSlugWarning(false)
    }
  }, [slug, originalSlug, isEditing, creator])

  const handleSlugChange = (value: string) => {
    setSlug(value)
    setSlugManuallyEdited(true)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Validate required fields
      if (!name.trim() || !slug.trim() || !email.trim()) {
        toast.error('Please fill in all required fields')
        return
      }

      // Validate slug format
      if (!/^[a-z0-9-]+$/.test(slug)) {
        toast.error('Slug can only contain lowercase letters, numbers, and hyphens')
        return
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error('Please enter a valid email address')
        return
      }

      // Validate URLs if provided
      if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
        toast.error('Website must be a valid URL starting with http:// or https://')
        return
      }

      if (avatarUrl && !avatarUrl.startsWith('http://') && !avatarUrl.startsWith('https://')) {
        toast.error('Avatar URL must be a valid URL starting with http:// or https://')
        return
      }

      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        email: email.trim(),
        bio: bio.trim() || null,
        website: website.trim() || null,
        twitter: twitter.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      }

      if (isEditing) {
        // Update existing creator
        const response = await fetch(`/api/admin/creators/${creator.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to update creator')
        }

        toast.success('Creator updated successfully!')
      } else {
        // Create new creator
        const response = await fetch('/api/admin/creators', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create creator')
        }

        toast.success('Creator created successfully!')
      }

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {isEditing ? (
              <>
                <Save className="w-6 h-6" />
                Edit Creator
              </>
            ) : (
              <>
                <Plus className="w-6 h-6" />
                Add New Creator
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update creator information'
              : 'Add a new creator to the platform'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              disabled={loading}
            />
          </div>

          {/* Slug */}
          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="john-doe"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              URL-friendly identifier (lowercase, numbers, hyphens only)
              {!slugManuallyEdited && !isEditing && ' - Auto-generated from name'}
            </p>
            {showSlugWarning && (
              <div className="flex items-start gap-2 mt-2 p-3 bg-amber/10 border border-amber/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber">
                  <p className="font-semibold">Warning: Changing slug</p>
                  <p>
                    This creator has {creator?.video_count} video(s). Changing the slug will break
                    existing profile URLs. Consider the impact before proceeding.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              disabled={loading}
            />
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief description of the creator..."
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Website */}
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              disabled={loading}
            />
          </div>

          {/* Twitter */}
          <div>
            <Label htmlFor="twitter">Twitter Handle</Label>
            <Input
              id="twitter"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="@username or username"
              disabled={loading}
            />
          </div>

          {/* Avatar URL */}
          <div>
            <Label htmlFor="avatar_url">Avatar URL</Label>
            <Input
              id="avatar_url"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Direct link to creator&apos;s avatar image
            </p>
          </div>

          {/* Avatar Preview */}
          {avatarUrl && (
            <div>
              <Label>Avatar Preview</Label>
              <div className="mt-2 flex items-center gap-3">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  <img
                    src={avatarUrl}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Preview of avatar (if URL is valid)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-border mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {isEditing ? 'Save Changes' : 'Create Creator'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

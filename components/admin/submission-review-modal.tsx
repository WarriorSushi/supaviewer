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
  CheckCircle2,
  XCircle,
  Edit3,
  Save,
  Star,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { CreatorSearch } from './creator-search'

interface Creator {
  id: string
  name: string
  slug: string
  email: string
  avatar_url?: string
  website?: string
  twitter?: string
  bio?: string
}

interface VideoSubmission {
  id: string
  title: string
  description: string
  youtube_id: string
  youtube_url: string
  duration: number
  ai_tool: string
  genre: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  avg_rating: number | null
  total_ratings: number
  creator: Creator
}

interface SubmissionReviewModalProps {
  submission: VideoSubmission | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

type WorkflowMode = 'view' | 'approve' | 'reject'

export function SubmissionReviewModal({
  submission,
  open,
  onOpenChange,
  onSuccess,
}: SubmissionReviewModalProps) {
  const [mode, setMode] = useState<WorkflowMode>('view')
  const [loading, setLoading] = useState(false)

  // Editable fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [aiTool, setAiTool] = useState('')
  const [genre, setGenre] = useState('')
  const [featured, setFeatured] = useState(false)

  // Creator selection
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null)
  const [showNewCreatorForm, setShowNewCreatorForm] = useState(false)

  // New creator fields
  const [newCreatorName, setNewCreatorName] = useState('')
  const [newCreatorEmail, setNewCreatorEmail] = useState('')
  const [newCreatorBio, setNewCreatorBio] = useState('')
  const [newCreatorWebsite, setNewCreatorWebsite] = useState('')
  const [newCreatorTwitter, setNewCreatorTwitter] = useState('')

  // Rejection fields
  const [rejectionNotes, setRejectionNotes] = useState('')
  const [notifySubmitter, setNotifySubmitter] = useState(false)

  // Reset form when submission changes
  useEffect(() => {
    if (submission) {
      setTitle(submission.title)
      setDescription(submission.description)
      setAiTool(submission.ai_tool)
      setGenre(submission.genre)
      setFeatured(false)
      setSelectedCreator(submission.creator)
      setShowNewCreatorForm(false)
      setMode('view')

      // Pre-fill new creator form with existing data
      setNewCreatorName(submission.creator.name)
      setNewCreatorEmail(submission.creator.email)
      setNewCreatorBio(submission.creator.bio || '')
      setNewCreatorWebsite(submission.creator.website || '')
      setNewCreatorTwitter(submission.creator.twitter || '')

      setRejectionNotes('')
      setNotifySubmitter(false)
    }
  }, [submission])

  if (!submission) return null

  const handleApprove = async () => {
    setLoading(true)
    try {
      // Validate required fields
      if (!title.trim() || !description.trim() || !aiTool.trim() || !genre.trim()) {
        toast.error('Please fill in all required fields')
        return
      }

      // Prepare payload
      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        ai_tool: aiTool.trim(),
        genre: genre.trim(),
        featured,
      }

      if (selectedCreator && !showNewCreatorForm) {
        // Use existing creator
        payload.creator_id = selectedCreator.id
      } else if (showNewCreatorForm) {
        // Create new creator
        if (!newCreatorName.trim() || !newCreatorEmail.trim()) {
          toast.error('Creator name and email are required')
          return
        }

        payload.new_creator = {
          name: newCreatorName.trim(),
          email: newCreatorEmail.trim(),
          bio: newCreatorBio.trim() || undefined,
          website: newCreatorWebsite.trim() || undefined,
          twitter: newCreatorTwitter.trim() || undefined,
        }
      } else {
        toast.error('Please select or create a creator')
        return
      }

      // Call approval API
      const response = await fetch(`/api/admin/submissions/${submission.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve submission')
      }

      toast.success('Video approved and published!')
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve video')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/submissions/${submission.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: rejectionNotes.trim() || undefined,
          notify_submitter: notifySubmitter,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject submission')
      }

      toast.success('Video rejected')
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject video')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {mode === 'approve' && <CheckCircle2 className="w-6 h-6 text-green-500" />}
            {mode === 'reject' && <XCircle className="w-6 h-6 text-red-500" />}
            {mode === 'view' && <Edit3 className="w-6 h-6 text-primary" />}
            {mode === 'approve'
              ? 'Approve Video'
              : mode === 'reject'
              ? 'Reject Video'
              : 'Review Submission'}
          </DialogTitle>
          <DialogDescription>
            Submitted {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* YouTube Video Embed - Always visible */}
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${submission.youtube_id}`}
              title={submission.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          {/* View Mode */}
          {mode === 'view' && (
            <div className="space-y-4">
              {/* Video Details */}
              <div>
                <h3 className="text-xl font-bold text-foreground">{submission.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Duration: {Math.floor(submission.duration / 60)}:
                  {String(submission.duration % 60).padStart(2, '0')}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {submission.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">AI Tool</h4>
                  <p className="text-sm text-muted-foreground">{submission.ai_tool}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">Genre</h4>
                  <p className="text-sm text-muted-foreground">{submission.genre}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Creator</h4>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="font-medium text-foreground">{submission.creator.name}</p>
                  <p className="text-sm text-muted-foreground">{submission.creator.email}</p>
                  {submission.creator.bio && (
                    <p className="text-sm text-muted-foreground mt-2">{submission.creator.bio}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {submission.status === 'pending' && (
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <Button
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => setMode('approve')}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve & Publish
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => setMode('reject')}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Submission
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Approve Mode */}
          {mode === 'approve' && (
            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Review and edit details before publishing
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Make any necessary changes and ensure the creator is correctly assigned
                    </p>
                  </div>
                </div>
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

                {/* Creator Selection */}
                <div>
                  <Label className="mb-2 block">Creator Assignment *</Label>
                  {!showNewCreatorForm ? (
                    <CreatorSearch
                      selectedCreator={selectedCreator}
                      onSelect={setSelectedCreator}
                      onCreateNew={() => setShowNewCreatorForm(true)}
                      disabled={loading}
                    />
                  ) : (
                    <div className="space-y-4 border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-foreground">New Creator</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowNewCreatorForm(false)}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="creator_name">Name *</Label>
                          <Input
                            id="creator_name"
                            value={newCreatorName}
                            onChange={(e) => setNewCreatorName(e.target.value)}
                            disabled={loading}
                          />
                        </div>
                        <div>
                          <Label htmlFor="creator_email">Email *</Label>
                          <Input
                            id="creator_email"
                            type="email"
                            value={newCreatorEmail}
                            onChange={(e) => setNewCreatorEmail(e.target.value)}
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="creator_bio">Bio</Label>
                        <Textarea
                          id="creator_bio"
                          value={newCreatorBio}
                          onChange={(e) => setNewCreatorBio(e.target.value)}
                          rows={2}
                          disabled={loading}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="creator_website">Website</Label>
                          <Input
                            id="creator_website"
                            type="url"
                            placeholder="https://"
                            value={newCreatorWebsite}
                            onChange={(e) => setNewCreatorWebsite(e.target.value)}
                            disabled={loading}
                          />
                        </div>
                        <div>
                          <Label htmlFor="creator_twitter">Twitter Handle</Label>
                          <Input
                            id="creator_twitter"
                            placeholder="@username"
                            value={newCreatorTwitter}
                            onChange={(e) => setNewCreatorTwitter(e.target.value)}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>
                  )}
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
              </div>

              {/* Approve Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setMode('view')} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  onClick={handleApprove}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Approve & Publish
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Reject Mode */}
          {mode === 'reject' && (
            <div className="space-y-6">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      This video will be rejected
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add optional notes explaining why this submission was rejected
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="rejection_notes">Rejection Notes (Optional)</Label>
                  <Textarea
                    id="rejection_notes"
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                    rows={4}
                    placeholder="Explain why this video is being rejected (visible to admins only)..."
                    disabled={loading}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Notify submitter</p>
                    <p className="text-xs text-muted-foreground">
                      Send an email notification to {submission.creator.email}
                    </p>
                  </div>
                  <Switch
                    checked={notifySubmitter}
                    onCheckedChange={setNotifySubmitter}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Reject Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setMode('view')} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  variant="destructive"
                  onClick={handleReject}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Confirm Rejection
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

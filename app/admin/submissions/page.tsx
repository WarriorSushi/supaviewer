'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Eye, CheckCircle2, XCircle, Clock, Video as VideoIcon } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import { SubmissionReviewModal } from '@/components/admin/submission-review-modal'

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

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

type TabValue = 'pending' | 'approved' | 'rejected'

export default function SubmissionsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('pending')
  const [submissions, setSubmissions] = useState<VideoSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  })
  const [selectedSubmission, setSelectedSubmission] = useState<VideoSubmission | null>(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Fetch submissions
  const fetchSubmissions = async (status: TabValue, searchQuery = '', page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        status,
        page: page.toString(),
        limit: '50',
      })

      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/admin/submissions?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch submissions')
      }

      setSubmissions(data.videos)
      setPagination(data.pagination)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Fetch when tab changes or search changes
  useEffect(() => {
    fetchSubmissions(activeTab, search, 1)
  }, [activeTab])

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== undefined) {
        fetchSubmissions(activeTab, search, 1)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // Open review modal
  const openReviewModal = async (submission: VideoSubmission) => {
    setSelectedSubmission(submission)
    setReviewModalOpen(true)
  }

  // Quick approve
  const quickApprove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to approve')
      }

      toast.success('Video approved!')
      fetchSubmissions(activeTab, search, pagination.page)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setActionLoading(false)
    }
  }

  // Quick reject
  const quickReject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reject')
      }

      toast.success('Video rejected')
      fetchSubmissions(activeTab, search, pagination.page)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setActionLoading(false)
    }
  }


  // Get tab counts (approximate from current data)
  const getTabCount = (status: TabValue) => {
    if (activeTab === status) {
      return pagination.total
    }
    return null // Don't show count for inactive tabs
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient-cinema">Submissions</h1>
        <p className="text-muted-foreground mt-1">
          Review and manage video submissions
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or creator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending
            {getTabCount('pending') !== null && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-amber text-amber-foreground text-xs font-semibold">
                {getTabCount('pending')}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Rejected
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        {(['pending', 'approved', 'rejected'] as TabValue[]).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground mt-4">Loading submissions...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-xl">
                <VideoIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold text-foreground">No {tab} submissions</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {search ? 'Try adjusting your search' : `No videos with ${tab} status`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Data Table */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">Video</th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">Creator</th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">AI Tool</th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">Genre</th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">Date</th>
                          <th className="text-right p-4 text-sm font-semibold text-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map((submission) => (
                          <tr
                            key={submission.id}
                            onClick={() => openReviewModal(submission)}
                            className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                          >
                            {/* Video Info */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                  <Image
                                    src={`https://img.youtube.com/vi/${submission.youtube_id}/mqdefault.jpg`}
                                    alt={submission.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-foreground truncate">
                                    {submission.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {Math.floor(submission.duration / 60)}:{String(submission.duration % 60).padStart(2, '0')}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Creator */}
                            <td className="p-4">
                              <p className="text-sm font-medium text-foreground">
                                {submission.creator.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {submission.creator.email}
                              </p>
                            </td>

                            {/* AI Tool */}
                            <td className="p-4">
                              <span className="text-sm text-foreground">
                                {submission.ai_tool}
                              </span>
                            </td>

                            {/* Genre */}
                            <td className="p-4">
                              <span className="text-sm text-muted-foreground">
                                {submission.genre}
                              </span>
                            </td>

                            {/* Date */}
                            <td className="p-4">
                              <p className="text-sm text-foreground">
                                {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
                              </p>
                            </td>

                            {/* Actions */}
                            <td className="p-4">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openReviewModal(submission)
                                  }}
                                  disabled={actionLoading}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Review
                                </Button>

                                {tab === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="bg-green-500 hover:bg-green-600 text-white"
                                      onClick={(e) => quickApprove(submission.id, e)}
                                      disabled={actionLoading}
                                    >
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={(e) => quickReject(submission.id, e)}
                                      disabled={actionLoading}
                                    >
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {submissions.length} of {pagination.total} results
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pagination.page === 1 || loading}
                        onClick={() => fetchSubmissions(activeTab, search, pagination.page - 1)}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-foreground px-3">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pagination.page === pagination.totalPages || loading}
                        onClick={() => fetchSubmissions(activeTab, search, pagination.page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Enhanced Review Modal */}
      <SubmissionReviewModal
        submission={selectedSubmission}
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        onSuccess={() => fetchSubmissions(activeTab, search, pagination.page)}
      />
    </div>
  )
}

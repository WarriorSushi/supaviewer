'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Star,
  StarOff,
  Video as VideoIcon,
  Filter,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import { EditVideoModal } from '@/components/admin/edit-video-modal'

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

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [featuredFilter, setFeaturedFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

  // Pagination
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  })

  // Modals
  const [editVideo, setEditVideo] = useState<Video | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteVideo, setDeleteVideo] = useState<Video | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Show active filters indicator
  const hasActiveFilters =
    statusFilter !== 'all' || featuredFilter !== 'all' || search.trim() !== ''

  // Fetch videos
  const fetchVideos = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        sort_by: sortBy,
        sort_order: sortOrder,
      })

      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      if (featuredFilter !== 'all') {
        params.append('featured', featuredFilter)
      }

      if (search.trim()) {
        params.append('search', search.trim())
      }

      const response = await fetch(`/api/admin/videos?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch videos')
      }

      setVideos(data.videos)
      setPagination(data.pagination)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchVideos(1)
  }, [statusFilter, featuredFilter, sortBy, sortOrder])

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== undefined) {
        fetchVideos(1)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // Clear all filters
  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setFeaturedFilter('all')
  }

  // Toggle featured
  const toggleFeatured = async (video: Video) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/videos/${video.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !video.featured }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update video')
      }

      toast.success(video.featured ? 'Video unfeatured' : 'Video featured!')
      fetchVideos(pagination.page)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setActionLoading(false)
    }
  }

  // Open edit modal
  const openEditModal = (video: Video) => {
    setEditVideo(video)
    setEditModalOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (video: Video) => {
    setDeleteVideo(video)
    setDeleteDialogOpen(true)
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!deleteVideo) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/videos/${deleteVideo.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete video')
      }

      toast.success('Video deleted successfully')
      setDeleteDialogOpen(false)
      setDeleteVideo(null)
      fetchVideos(pagination.page)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient-cinema">Video Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage all videos across all statuses
        </p>
      </div>

      {/* Filters Bar */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or creator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          {/* Featured Filter */}
          <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Videos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Videos</SelectItem>
              <SelectItem value="true">Featured Only</SelectItem>
              <SelectItem value="false">Not Featured</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Date Created</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="avg_rating">Rating</SelectItem>
              <SelectItem value="total_ratings">Total Ratings</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Order */}
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Active Filters Indicator */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-sm">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Active filters: {pagination.total} results
            </span>
          </div>
        )}
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground mt-4">Loading videos...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <VideoIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-semibold text-foreground">No videos found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {hasActiveFilters ? 'Try adjusting your filters' : 'No videos in the database yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Video</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Creator</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Rating</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Featured</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Date</th>
                    <th className="text-right p-4 text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video) => (
                    <tr
                      key={video.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      {/* Video Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <Image
                              src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                              alt={video.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate max-w-xs">
                              {video.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {Math.floor(video.duration / 60)}:
                                {String(video.duration % 60).padStart(2, '0')}
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">{video.ai_tool}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Creator */}
                      <td className="p-4">
                        <p className="text-sm font-medium text-foreground">{video.creator.name}</p>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                            video.status === 'pending'
                              ? 'bg-amber/10 text-amber'
                              : video.status === 'approved'
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-red-500/10 text-red-500'
                          }`}
                        >
                          {video.status}
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-semibold text-foreground">
                            {video.avg_rating ? video.avg_rating.toFixed(1) : 'N/A'}
                          </span>
                          <span className="text-amber">⭐</span>
                          <span className="text-xs text-muted-foreground">
                            ({video.total_ratings})
                          </span>
                        </div>
                      </td>

                      {/* Featured */}
                      <td className="p-4">
                        {video.featured && <Star className="w-5 h-5 text-amber fill-amber" />}
                      </td>

                      {/* Date */}
                      <td className="p-4">
                        <p className="text-sm text-foreground">
                          {formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={actionLoading}>
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditModal(video)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Video
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleFeatured(video)}>
                                {video.featured ? (
                                  <>
                                    <StarOff className="w-4 h-4 mr-2" />
                                    Unfeature
                                  </>
                                ) : (
                                  <>
                                    <Star className="w-4 h-4 mr-2" />
                                    Feature
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(video)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Video
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                Showing {videos.length} of {pagination.total} videos
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page === 1 || loading}
                  onClick={() => fetchVideos(pagination.page - 1)}
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
                  onClick={() => fetchVideos(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <EditVideoModal
        video={editVideo}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSuccess={() => fetchVideos(pagination.page)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteVideo?.title}&rdquo;? This action cannot be
              undone. All associated ratings will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={actionLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {actionLoading ? 'Deleting...' : 'Delete Video'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

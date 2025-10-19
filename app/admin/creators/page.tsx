'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { Search, Plus, MoreVertical, Edit, Trash2, ExternalLink, Users } from 'lucide-react'
import { toast } from 'sonner'
import { CreatorEditorModal } from '@/components/admin/creator-editor-modal'

interface Creator {
  id: string
  name: string
  slug: string
  email: string
  bio?: string | null
  website?: string | null
  twitter?: string | null
  avatar_url?: string | null
  created_at: string
  video_count: number
  avg_rating: number | null
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Search
  const [search, setSearch] = useState('')

  // Pagination
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  })

  // Modals
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingCreator, setEditingCreator] = useState<Creator | null>(null)
  const [deleteCreator, setDeleteCreator] = useState<Creator | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Fetch creators
  const fetchCreators = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      })

      if (search.trim()) {
        params.append('search', search.trim())
      }

      const response = await fetch(`/api/admin/creators?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch creators')
      }

      setCreators(data.creators)
      setPagination(data.pagination)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Fetch on mount
  useEffect(() => {
    fetchCreators(1)
  }, [])

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== undefined) {
        fetchCreators(1)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // Open add creator modal
  const openAddModal = () => {
    setEditingCreator(null)
    setEditorOpen(true)
  }

  // Open edit creator modal
  const openEditModal = (creator: Creator) => {
    setEditingCreator(creator)
    setEditorOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (creator: Creator) => {
    setDeleteCreator(creator)
    setDeleteDialogOpen(true)
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!deleteCreator) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/creators/${deleteCreator.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete creator')
      }

      toast.success('Creator deleted successfully')
      setDeleteDialogOpen(false)
      setDeleteCreator(null)
      fetchCreators(pagination.page)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setActionLoading(false)
    }
  }

  // View creator profile
  const viewProfile = (slug: string) => {
    window.open(`/creator/${slug}`, '_blank')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-cinema">Creator Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage creators and their profiles
          </p>
        </div>
        <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Creator
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search creators by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {pagination.total} creator{pagination.total !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground mt-4">Loading creators...</p>
        </div>
      ) : creators.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-semibold text-foreground">No creators found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? 'Try adjusting your search' : 'Get started by adding your first creator'}
          </p>
          {!search && (
            <Button onClick={openAddModal} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Add First Creator
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Creator</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Slug</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Videos</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Avg Rating</th>
                    <th className="text-right p-4 text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {creators.map((creator) => (
                    <tr
                      key={creator.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      {/* Creator Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={creator.avatar_url || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-crimson to-amber text-white">
                              {getInitials(creator.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{creator.name}</p>
                            <p className="text-xs text-muted-foreground">{creator.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="p-4">
                        <code className="text-sm bg-muted px-2 py-1 rounded text-foreground">
                          {creator.slug}
                        </code>
                      </td>

                      {/* Video Count */}
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-semibold text-foreground">
                            {creator.video_count}
                          </span>
                          <span className="text-xs text-muted-foreground">video{creator.video_count !== 1 ? 's' : ''}</span>
                        </div>
                      </td>

                      {/* Avg Rating */}
                      <td className="p-4">
                        {creator.avg_rating !== null ? (
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-semibold text-foreground">
                              {creator.avg_rating.toFixed(1)}
                            </span>
                            <span className="text-amber">⭐</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
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
                              <DropdownMenuItem onClick={() => openEditModal(creator)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Creator
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => viewProfile(creator.slug)}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(creator)}
                                disabled={creator.video_count > 0}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                                {creator.video_count > 0 && ' (has videos)'}
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
                Showing {creators.length} of {pagination.total} creators
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page === 1 || loading}
                  onClick={() => fetchCreators(pagination.page - 1)}
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
                  onClick={() => fetchCreators(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Creator Editor Modal */}
      <CreatorEditorModal
        creator={editingCreator}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSuccess={() => fetchCreators(pagination.page)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Creator?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteCreator?.name}&rdquo;? This action cannot be
              undone.
              {deleteCreator?.video_count && deleteCreator.video_count > 0 ? (
                <span className="block mt-2 text-destructive font-semibold">
                  Warning: This creator has {deleteCreator.video_count} video(s). You cannot delete
                  a creator with existing videos.
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={
                actionLoading ||
                (deleteCreator?.video_count !== undefined && deleteCreator.video_count > 0)
              }
              className="bg-destructive hover:bg-destructive/90"
            >
              {actionLoading ? 'Deleting...' : 'Delete Creator'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

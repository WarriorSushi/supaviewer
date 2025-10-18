import { Skeleton } from '@/components/ui/skeleton'

export function VideoGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          {/* Thumbnail */}
          <Skeleton className="aspect-video w-full rounded-xl" />

          {/* Title */}
          <Skeleton className="h-5 w-3/4" />

          {/* Creator */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Rating */}
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
}

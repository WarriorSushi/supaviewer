import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Film, Home, Search } from 'lucide-react'

export default function VideoNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-card border-2 border-border flex items-center justify-center">
            <Film className="w-12 h-12 text-muted-foreground" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-foreground">Video Not Found</h1>
          <p className="text-lg text-muted-foreground">
            This video doesn't exist or is no longer available.
          </p>
          <p className="text-sm text-muted-foreground">
            It may have been removed, is still pending approval, or the link is incorrect.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <Search className="w-4 h-4 mr-2" />
              Browse Videos
            </Link>
          </Button>
        </div>

      </div>
    </div>
  )
}

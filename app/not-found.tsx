import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 404 Visual */}
        <div className="relative">
          <h1 className="text-[150px] md:text-[200px] font-bold text-gradient-cinema leading-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-crimson/20 to-amber/20 blur-3xl"></div>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Page Not Found
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved to a new location.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/#videos">
              <Search className="w-4 h-4 mr-2" />
              Browse Videos
            </Link>
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">You might be looking for:</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Homepage
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/submit" className="text-sm text-primary hover:underline">
              Submit Video
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/#featured" className="text-sm text-primary hover:underline">
              Featured Videos
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

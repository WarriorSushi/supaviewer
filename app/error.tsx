'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Error Icon */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-16 h-16 text-destructive" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full bg-destructive/20 blur-3xl"></div>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Something went wrong
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            We encountered an unexpected error. Don't worry, our team has been notified.
          </p>

          {/* Error Details (Development only) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left bg-muted/50 rounded-lg p-4 max-w-xl mx-auto">
              <summary className="cursor-pointer text-sm font-semibold text-foreground mb-2">
                Error Details (Development)
              </summary>
              <pre className="text-xs text-muted-foreground overflow-auto">
                {error.message}
                {error.digest && `\nDigest: ${error.digest}`}
              </pre>
            </details>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={reset} size="lg" className="w-full sm:w-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <a href="/">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </a>
          </Button>
        </div>

        {/* Support Message */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            If this problem persists, please{' '}
            <a href="mailto:support@supaviewer.com" className="text-primary hover:underline">
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

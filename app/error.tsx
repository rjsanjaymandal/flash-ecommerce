'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RotateCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Application Error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      
      <h2 className="text-3xl font-black uppercase tracking-tighter mb-3">
        Something went wrong!
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        We encountered an unexpected error. Our team has been notified.
      </p>

      <div className="flex gap-4">
        <Button 
            onClick={() => reset()} 
            size="lg" 
            className="gap-2 rounded-full font-bold uppercase tracking-widest"
        >
            <RotateCcw className="h-4 w-4" />
            Try Again
        </Button>
        <Button 
            variant="outline" 
            size="lg" 
            className="rounded-full font-bold uppercase tracking-widest"
            onClick={() => window.location.href = '/'}
        >
            Go Home
        </Button>
      </div>
    </div>
  )
}

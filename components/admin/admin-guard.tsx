'use client'

import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading, isAdmin, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
        router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
    )
  }

  // Strict Admin Check
  if (!isAdmin) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-4">
            <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
            <p className="text-muted-foreground max-w-md">
                You do not have permission to view this page. This area is restricted to administrators only.
            </p>
            <div className="p-4 bg-muted rounded-lg text-sm text-left font-mono break-all max-w-lg">
                <p><strong>Debug Info:</strong></p>
                <p>User ID: {user?.id}</p>
                <p>Email: {user?.email}</p>
                <p>Role: {profile?.role || 'null'}</p>
            </div>
            <div className="flex gap-4">
                <Button onClick={() => router.push('/')} variant="outline">
                    Return to Store
                </Button>
                <Button onClick={() => { signOut(); router.push('/login'); }}>
                    Logout & Switch Account
                </Button>
            </div>
        </div>
    )
  }

  return <>{children}</>
}

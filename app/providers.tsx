'use client'

import { AuthProvider } from '@/context/auth-context'
import { CartDrawer } from '@/components/storefront/cart-drawer'
import { StoreSync } from '@/components/store-sync'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

export function Providers({ 
  children,
  initialUser,
  initialSession,
  initialProfile
}: { 
  children: React.ReactNode
  initialUser?: any
  initialSession?: any
  initialProfile?: any
}) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialUser={initialUser} initialSession={initialSession} initialProfile={initialProfile}>
        <TooltipProvider>
            <StoreSync />
            {children}
            <Toaster position="top-center" richColors />
            <CartDrawer />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

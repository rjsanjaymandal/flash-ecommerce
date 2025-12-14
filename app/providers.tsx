'use client'

import { AuthProvider } from '../context/auth-context'
import { CartProvider } from '@/context/cart-context'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { CartDrawer } from '@/components/storefront/cart-drawer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'sonner'

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
        <CartProvider>
          <div className="flex flex-col min-h-screen">
             <Navbar />
             <main className="flex-1 pt-16">
                {children}
             </main>
             <Footer />
          </div>
          <Toaster position="top-center" richColors />
          <CartDrawer />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

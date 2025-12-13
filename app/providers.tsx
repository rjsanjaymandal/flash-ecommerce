import { AuthProvider } from '@/context/auth-context'
import { CartProvider } from '@/context/cart-context'
import { Navbar } from '@/components/storefront/navbar'
import { CartDrawer } from '@/components/storefront/cart-drawer'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />
        {children}
        <CartDrawer />
      </CartProvider>
    </AuthProvider>
  )
}

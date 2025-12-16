'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Grid, Heart, User, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore, selectCartCount } from '@/store/use-cart-store'
import { useWishlistStore } from '@/store/use-wishlist-store'

export function MobileNav() {
  const pathname = usePathname()
  const cartCount = useCartStore(selectCartCount)
  const wishlistCount = useWishlistStore((state) => state.items.length)
  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen)

  const links = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/shop', label: 'Shop', icon: Grid },
    { href: '/wishlist', label: 'Wishlist', icon: Heart, count: wishlistCount },
    { href: '/account', label: 'You', icon: User },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border lg:hidden pb-safe">
      <div className="flex items-center justify-around h-16">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          
          return (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full text-[10px] font-medium transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-6 w-6", isActive && "fill-current")} />
                {link.count !== undefined && link.count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-background">
                    {link.count}
                  </span>
                )}
              </div>
              <span>{link.label}</span>
            </Link>
          )
        })}

        {/* Cart Button */}
        <button
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center justify-center gap-1 w-full h-full text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors relative"
        >
             <div className="relative">
                <ShoppingBag className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white ring-2 ring-background">
                    {cartCount}
                  </span>
                )}
             </div>
             <span>Cart</span>
        </button>
      </div>
    </div>
  )
}

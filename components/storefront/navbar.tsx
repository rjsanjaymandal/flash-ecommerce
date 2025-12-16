'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Menu, X, Heart, ChevronDown, Search } from 'lucide-react'
import { useState } from 'react'
import { useWishlistStore } from '@/store/use-wishlist-store'
import { useCartStore, selectCartCount } from '@/store/use-cart-store'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const cartCount = useCartStore(selectCartCount)
  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen)
  const wishlistCount = useWishlistStore((state) => state.items.length)
  const { user, profile, isAdmin, signOut } = useAuth()
// ...
  const pathname = usePathname()
  const supabase = createClient()

  if (pathname.startsWith('/admin')) return null // Don't show public nav on admin
  
  // Debug Admin Access
  console.log('Navbar Auth State:', { email: user?.email, role: profile?.role, isAdmin })

  // Fetch Categories
  // Fetch Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['nav-categories-v2'], // Bump version to clear cache
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*, children:categories(id, name, slug)')
        .eq('is_active', true)
        .is('parent_id', null)
        .order('name')

      if (error) {
        console.error('Navbar category fetch error:', error)
      } else {
        console.log('Navbar fetched categories (v2):', data?.length, data)
      }
      return data || []
    }
  })

  // Dynamic Nav Links
  const navLinks = categories.map((cat: any) => ({
    href: `/shop?category=${cat.id}`,
    label: cat.name,
    children: cat.children
  }))

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            <button 
                className="lg:hidden p-2 -ml-2 text-foreground"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X /> : <Menu />}
            </button>

            {/* Logo */}
            <Link 
                href="/" 
                className="flex items-center gap-2" 
                title="Home"
            >
                <div className="relative h-10 w-auto overflow-hidden rounded-lg hover:scale-105 transition-transform">
                    <img src="/flash-logo.jpg" alt="Flash Logo" className="h-full w-auto object-contain" />
                </div>
                <span className="hidden lg:block text-xl font-black tracking-tighter">FLASH</span>
            </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link: any) => (
                <div key={link.href} className="group relative">
                    <Link 
                        href={link.href}
                        className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                    >
                        {link.label}
                        {link.children && link.children.length > 0 && (
                            <ChevronDown className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                        )}
                    </Link>
                    
                    {/* Simplified Mega Menu / Dropdown */}
                    {link.children && link.children.length > 0 && (
                        <div className="absolute top-full left-0 w-48 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 ease-out">
                            <div className="bg-background border border-border shadow-xl rounded-md overflow-hidden p-2 flex flex-col gap-1">
                                {link.children.map((child: any) => (
                                    <Link 
                                        key={child.id}
                                        href={`/shop?category=${child.id}`}
                                        className="text-sm px-3 py-2 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {child.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
            <Link 
                href="/contact"
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
            >
                Contact
            </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/shop" className="p-2 text-muted-foreground hover:text-primary transition-colors">
                <Search className="h-5 w-5" />
            </Link>
            <Link href="/wishlist" className="relative text-muted-foreground hover:text-primary transition-colors p-2">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-background">
                        {wishlistCount}
                    </span>
                )}
            </Link>
            
            <button 
                onClick={() => setIsCartOpen(true)}
                className="relative text-muted-foreground hover:text-primary transition-colors p-2"
            >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 ring-background">
                        {cartCount}
                    </span>
                )}
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                {isAdmin && (
                    <Link href="/admin">
                        <Button variant="default" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20">
                            Admin Panel
                        </Button>
                    </Link>
                )}
                <Link href="/account">
                    <Button variant="ghost" size="icon" className="rounded-full">
                         <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {user.email?.[0].toUpperCase()}
                         </div>
                    </Button>
                </Link>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium hidden md:inline-block">
                        {profile?.name || user.email}
                    </span>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                            signOut()
                            window.location.href = '/' // Refresh logic
                        }}
                    >
                        Logout
                    </Button>
                </div>
              </div>
            ) : (
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background px-4 py-4 space-y-4 shadow-xl max-h-[80vh] overflow-y-auto">
              {navLinks.map((link: any) => (
                <div key={link.href} className="space-y-2">
                    <Link 
                        href={link.href}
                        className="block text-base font-bold text-foreground"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {link.label}
                    </Link>
                    {/* Mobile Subcategories */}
                    {link.children && link.children.length > 0 && (
                        <div className="pl-4 border-l border-border space-y-2 mt-1">
                            {link.children.map((child: any) => (
                                <Link 
                                    key={child.id}
                                    href={`/shop?category=${child.id}`}
                                    className="block text-sm text-muted-foreground hover:text-foreground"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {child.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ))}
            <Link 
                href="/contact"
                className="block text-base font-bold text-foreground pt-2 border-t border-border"
                onClick={() => setIsMobileMenuOpen(false)}
            >
                Contact
            </Link>
          </div>
      )}
    </header>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Menu, X, Heart, ChevronDown, Search, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useWishlistStore } from '@/store/use-wishlist-store'
import { useCartStore, selectCartCount } from '@/store/use-cart-store'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useSearchStore } from '@/store/use-search-store'
import { MegaMenu } from './mega-menu'
import { motion, AnimatePresence } from 'framer-motion'
import { useScrollDirection } from '@/hooks/use-scroll-direction'

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const cartCount = useCartStore(selectCartCount)
  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen)
  const wishlistCount = useWishlistStore((state) => state.items.length)
  const { user, profile, isAdmin, signOut } = useAuth()
// ...
  const pathname = usePathname()
  const supabase = createClient()


  
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
    children: cat.children,
    category: cat
  }))

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            <button 
                className="lg:hidden p-2 -ml-2 text-foreground hover:bg-white/10 rounded-full transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Logo */}
            <Link 
                href="/" 
                className="flex items-center gap-2 group" 
                title="Home"
            >
                <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/20 group-hover:scale-105 transition-all duration-300 shadow-lg">
                    <img src="/flash-logo.jpg" alt="Flash Logo" className="h-full w-full object-cover" />
                </div>
                <span className="hidden lg:block text-xl font-black tracking-tighter text-gradient">FLASH</span>
            </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((link: any) => (
                <div key={link.href} className="group relative">
                    <Link 
                        href={link.href}
                        className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-all px-4 py-2 hover:bg-primary/5 rounded-full"
                    >
                        {link.label}
                        {link.children && link.children.length > 0 && (
                            <ChevronDown className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                        )}
                    </Link>
                    
                    {/* Rich Mega Menu */}
                    {link.children && link.children.length > 0 && (
                        <MegaMenu category={link.category} />
                    )}
                </div>
            ))}
            <Link 
                href="/contact"
                className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-all px-4 py-2 hover:bg-primary/5 rounded-full"
            >
                Contact
            </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => useSearchStore.getState().setOpen(true)}
                className="rounded-full hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors h-10 w-10"
            >
                <Search className="h-5 w-5" />
            </Button>
            
            <Link href="/wishlist">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative rounded-full hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors h-10 w-10"
                >
                    <Heart className="h-5 w-5" />
                    {wishlistCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full gradient-primary text-[9px] font-black text-white ring-2 ring-background">
                            {wishlistCount}
                        </span>
                    )}
                </Button>
            </Link>
            
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsCartOpen(true)}
                className="relative rounded-full hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors h-10 w-10"
            >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full gradient-primary text-[9px] font-black text-white ring-2 ring-background">
                        {cartCount}
                    </span>
                )}
            </Button>

            <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/account" className="hidden sm:block">
                    <Button variant="ghost" size="sm" className="rounded-full gap-2 px-3 font-bold border border-border/50 hover:border-primary/50 transition-all">
                         <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center text-[10px] text-white">
                            {user.email?.[0].toUpperCase()}
                         </div>
                         <span className="max-w-[100px] truncate text-xs uppercase tracking-tight">
                            {profile?.name || user.email?.split('@')[0]}
                         </span>
                    </Button>
                </Link>
                
                {isAdmin && (
                    <Link href="/admin" className="hidden md:block">
                        <Button size="sm" className="rounded-full gradient-primary shadow-lg shadow-indigo-500/20 text-[10px] font-black uppercase tracking-widest h-8">
                             Admin
                        </Button>
                    </Link>
                )}

                <Button 
                    variant="ghost" 
                    size="icon" 
                    title="Sign Out"
                    className="rounded-full h-9 w-9 hover:bg-red-500/10 hover:text-red-500 transition-colors sm:hidden"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        signOut();
                    }}
                >
                    <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm" className="rounded-full px-8 font-black uppercase tracking-[0.15em] text-[10px] gradient-primary shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300">
                    Join
                </Button>
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

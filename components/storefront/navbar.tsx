'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Menu, X, Heart } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/context/cart-context'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { cartCount, setIsCartOpen } = useCart()
  const { user, profile, isAdmin, signOut } = useAuth()
  const pathname = usePathname()

  if (pathname.startsWith('/admin')) return null // Don't show public nav on admin
  
  // Debug Admin Access
  console.log('Navbar Auth State:', { email: user?.email, role: profile?.role, isAdmin })

  const navLinks = [
    { href: '/shop/new-arrivals', label: 'New Arrivals' },
    { href: '/shop/clothing', label: 'Clothing' },
    { href: '/shop/accessories', label: 'Accessories' },
    { href: '/about', label: 'About FLASH' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Menu Button */}
        <button 
            className="lg:hidden p-2 -ml-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
            {isMobileMenuOpen ? <X /> : <Menu />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter bg-linear-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-200">
                FLASH
            </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
                <Link 
                    key={link.href} 
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                    {link.label}
                </Link>
            ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/wishlist" className="hidden sm:flex text-muted-foreground hover:text-primary transition-colors">
                <Heart className="h-5 w-5" />
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
          <div className="lg:hidden border-t border-border bg-background px-4 py-4 space-y-4 shadow-xl">
              {navLinks.map(link => (
                <Link 
                    key={link.href} 
                    href={link.href}
                    className="block text-base font-medium text-foreground py-2 border-b border-border last:border-0"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    {link.label}
                </Link>
            ))}
          </div>
      )}
    </header>
  )
}

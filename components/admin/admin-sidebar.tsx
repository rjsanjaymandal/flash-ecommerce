'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, ShoppingBag, Layers, ShoppingCart, MessageSquare, LogOut, ExternalLink, Settings, User } from 'lucide-react'
import { useAuth } from '@/context/auth-context'

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/products', label: 'Products', icon: ShoppingBag },
  { href: '/admin/categories', label: 'Categories', icon: Layers },
  { href: '/admin/customers', label: 'Customers', icon: User }, // Added placeholder for future
]

const secondaryItems = [
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { signOut, user } = useAuth()

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-card/50 backdrop-blur-xl sm:flex transition-all duration-300">
      <div className="flex h-full flex-col p-4">
        {/* Brand */}
        <div className="mb-8 flex h-14 items-center px-4">
          <Link href="/admin" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-xl group-hover:scale-110 transition-transform">
                F
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Flash<span className="font-normal text-muted-foreground">Admin</span>
            </span>
          </Link>
        </div>

        {/* Main Nav */}
        <div className="space-y-1">
            <h3 className="px-4 text-xs font-medium text-muted-foreground mb-2 uppercase tracking-widest">Menu</h3>
            <nav className="space-y-1 font-medium">
            {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 group relative overflow-hidden",
                    isActive 
                        ? "text-primary bg-primary/10 font-semibold" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                >
                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary" />}
                    <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                    {item.label}
                </Link>
                )
            })}
            </nav>
        </div>

        {/* Secondary Nav */}
        <div className="mt-8 space-y-1">
             <h3 className="px-4 text-xs font-medium text-muted-foreground mb-2 uppercase tracking-widest">Support</h3>
             <nav className="space-y-1 font-medium">
                {secondaryItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 group relative",
                        isActive 
                            ? "text-primary bg-primary/10 font-semibold" 
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                        {item.label}
                    </Link>
                    )
                })}
            </nav>
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pt-4 border-t border-border">
             <div className="mb-4 px-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
                    {user?.email?.[0].toUpperCase() || 'A'}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{user?.email || 'Admin User'}</p>
                    <p className="text-xs text-muted-foreground">Store Manager</p>
                </div>
             </div>

            <Link
                href="/"
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted transition-colors w-full mb-1"
                target="_blank"
              >
                <ExternalLink className="h-4 w-4" />
                View Storefront
            </Link>
            <button
                onClick={() => signOut()}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
             >
                <LogOut className="h-4 w-4" />
                Sign Out
            </button>
        </div>
      </div>
    </aside>
  )
}

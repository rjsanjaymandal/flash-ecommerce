'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, ShoppingBag, Layers, ShoppingCart, MessageSquare, LogOut, ExternalLink } from 'lucide-react'
import { useAuth } from '@/context/auth-context'

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/products', label: 'Products', icon: ShoppingBag },
  { href: '/admin/categories', label: 'Categories', icon: Layers },
  { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
      <div className="flex h-full flex-col px-3 py-4">
        <div className="mb-8 flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              FLASH Admin
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-2 font-medium">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground hover:text-foreground transition-all duration-200",
                  isActive && "bg-primary text-primary-foreground hover:text-primary-foreground shadow-md shadow-primary/20"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto space-y-2 px-2">
            <Link
                href="/"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground hover:bg-muted transition-colors"
                target="_blank"
              >
                <ExternalLink className="h-4 w-4" />
                Storefront
            </Link>
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  )
}

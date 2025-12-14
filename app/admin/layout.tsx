'use client'

import AdminGuard from '@/components/admin/admin-guard'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen w-full bg-muted/40">
        <AdminSidebar />
        <div className="flex flex-col sm:gap-4 sm:pl-64 w-full">
            <main className="flex-1 p-4 sm:px-6 sm:py-md md:gap-8 lg:py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {children}
            </main>
        </div>
      </div>
    </AdminGuard>
  )
}

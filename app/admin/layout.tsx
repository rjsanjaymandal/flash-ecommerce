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
      <div className="min-h-screen bg-background text-foreground">
        <AdminSidebar />
        <div className="ml-64 p-8">
            <main className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             {children}
            </main>
        </div>
      </div>
    </AdminGuard>
  )
}

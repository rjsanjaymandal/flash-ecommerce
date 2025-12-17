import AdminGuard from '@/components/admin/admin-guard'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminBodyClass } from '@/components/admin/admin-body-class'
import './admin-theme.css'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminGuard>
      <AdminBodyClass />
      <div className="flex min-h-screen w-full admin-theme bg-background text-foreground">
        <AdminSidebar />
        <div className="flex flex-col sm:gap-4 sm:pl-72 w-full transition-all duration-300">
             {/* Header could go here */}
            <main className="flex-1 p-4 sm:px-8 sm:py-8 md:gap-8 lg:py-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
             {children}
            </main>
        </div>
      </div>
    </AdminGuard>
  )
}

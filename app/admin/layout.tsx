import { MobileAdminSidebar } from "@/components/admin/mobile-admin-sidebar";
import AdminGuard from "@/components/admin/admin-guard";
import { AdminBodyClass } from "@/components/admin/admin-body-class";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <AdminBodyClass />
      <div className="flex min-h-screen w-full admin-theme bg-background text-foreground">
        <AdminSidebar />
        <div className="flex flex-col sm:gap-4 sm:pl-72 w-full transition-all duration-300">
          {/* Mobile Header */}
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:hidden">
            <MobileAdminSidebar />
            <span className="font-bold text-lg">Dashboard</span>
          </header>

          <main className="flex-1 p-4 sm:px-8 sm:py-8 md:gap-8 lg:py-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}

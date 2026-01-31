"use client";
import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart3,
  ShoppingBag,
  Layers,
  ShoppingCart,
  MessageSquare,
  LogOut,
  ExternalLink,
  Settings,
  User,
  Ticket,
  Clock,
  FlaskConical,
  Bell,
  Terminal,
  Activity,
  FileText,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

export const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/concepts", label: "Future Lab", icon: FlaskConical },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/customers", label: "Customers", icon: User },
  { href: "/admin/waitlist", label: "Waitlist", icon: Clock },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
];

export const secondaryItems = [
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/health", label: "Health", icon: Activity },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/admin/system-logs", label: "System Logs", icon: Terminal },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 flex-col bg-[#0f172a] text-slate-300 transition-all duration-300 sm:flex shadow-xl print:hidden">
      <div className="flex h-full flex-col">
        {/* Brand */}
        <div className="flex h-20 items-center px-8 border-b border-slate-800/50">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-900/20 group-hover:scale-105 transition-transform">
              F
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white tracking-tight">
                Flash<span className="font-light text-indigo-400">Panel</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                Enterprise
              </span>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
          {/* Main Nav */}
          <div className="space-y-2">
            <h3 className="px-4 text-xs font-bold text-indigo-400/80 mb-2 uppercase tracking-widest">
              Overview
            </h3>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 group relative",
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20"
                        : "hover:bg-slate-800/50 hover:text-white",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 transition-transform group-hover:scale-110",
                        isActive
                          ? "text-indigo-200"
                          : "text-slate-500 group-hover:text-slate-300",
                      )}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Secondary Nav */}
          <div className="space-y-2">
            <h3 className="px-4 text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest">
              Support
            </h3>
            <nav className="space-y-1">
              {secondaryItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 group",
                      isActive
                        ? "bg-indigo-600/10 text-indigo-400"
                        : "hover:bg-slate-800/50 hover:text-white",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5",
                        isActive
                          ? "text-indigo-400"
                          : "text-slate-500 group-hover:text-slate-300",
                      )}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800/50 bg-[#0b1120]">
          {mounted && (
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="h-10 w-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-inner border-2 border-[#0f172a]">
                {user?.email?.[0].toUpperCase() || "A"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.email?.split("@")[0] || "Admin"}
                </p>
                <p className="text-xs text-slate-500">Super Admin</p>
              </div>
            </div>
          )}

          <button
            onClick={() => signOut()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
          <div className="mt-3 text-center">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline flex items-center justify-center gap-1"
            >
              View Live Store <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

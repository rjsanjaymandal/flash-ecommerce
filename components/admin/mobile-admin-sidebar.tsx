"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { navItems, secondaryItems } from "./admin-sidebar";
import { useState, useEffect } from "react";

export function MobileAdminSidebar() {
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden text-foreground hover:bg-slate-100"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Admin Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="p-0 bg-zinc-950 text-zinc-400 w-72 border-r border-zinc-800"
      >
        <SheetHeader className="h-20 flex items-center justify-center border-b border-zinc-800/50 px-6">
          <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 w-full group"
          >
            <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center text-black font-black text-xl shadow-xl shadow-white/5 border border-zinc-800">
              F
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-bold text-white tracking-tighter">
                FLASH<span className="font-light text-zinc-500">.OPS</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.3em] font-black text-zinc-600">
                Industrial Unit
              </span>
            </div>
          </Link>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide h-[calc(100vh-160px)]">
          {/* Main Nav */}
          <div className="space-y-2">
            <h3 className="px-4 text-[9px] font-black text-zinc-600 mb-2 uppercase tracking-[0.3em]">
              Logistics
            </h3>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href as any}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-none px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-200 group relative",
                      isActive
                        ? "bg-zinc-800 text-white border-l-2 border-brand-rust"
                        : "hover:bg-zinc-900 hover:text-white",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 transition-transform group-hover:scale-110",
                        isActive
                          ? "text-brand-rust"
                          : "text-zinc-600 group-hover:text-zinc-400",
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
                    href={item.href as any}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-none px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-200 group",
                      isActive
                        ? "bg-zinc-800/50 text-white"
                        : "hover:bg-zinc-900/50 hover:text-white",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4",
                        isActive
                          ? "text-brand-rust"
                          : "text-zinc-600 group-hover:text-zinc-400",
                      )}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800/50 bg-zinc-950 absolute bottom-0 w-full">
          <button
            onClick={() => {
              signOut();
              setOpen(false);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-none border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-[10px] uppercase font-black tracking-widest text-zinc-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all"
          >
            <LogOut className="h-4 w-4" />
            De-Authorize
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

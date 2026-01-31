"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Menu,
  Heart,
  ChevronDown,
  Search,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import FlashImage from "@/components/ui/flash-image";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { useCartStore, selectCartCount } from "@/store/use-cart-store";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useSearchStore } from "@/store/use-search-store";
import { MegaMenu } from "./mega-menu";
import { HamburgerMenu } from "./hamburger-menu";
import { SearchOverlay } from "@/components/storefront/search-overlay";
import { NotificationBell } from "./notification-bell";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { Skeleton } from "@/components/ui/skeleton";
import { ModeToggle } from "@/components/ui/mode-toggle";

interface NavCategory {
  id: string;
  name: string;
  slug: string;
  children?: NavCategory[];
}

interface NavLink {
  href: string;
  label: string;
  children?: NavCategory[];
  category: NavCategory;
}

export function StorefrontNavbar() {
  const cartCount = useCartStore(selectCartCount);
  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen);
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const { user, profile, isAdmin, signOut } = useAuth();

  const [mounted, setMounted] = useState(false);
  // Local Search State for Overlay
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pathname = usePathname();
  const supabase = createClient();

  // ... (keep defined vars)

  // Debug Admin Access
  console.log("Navbar Auth State:", {
    email: user?.email,
    role: profile?.role,
    isAdmin,
  });

  // Fetch Categories logic ... (omitted for brevity in replacement if unchanged, but I need to include it or rely on existing)
  // Re-including fetch to be safe as I am replacing the whole function body essentially or need to be careful with chunks.
  // Actually, I'll just target the `return` block mostly, but need to insert the state hook.

  // Fetch Categories (Re-declaring to ensure context is safe)
  const { data: categories = [] } = useQuery({
    queryKey: ["nav-categories-v2"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*, children:categories(id, name, slug)")
        .eq("is_active", true)
        .is("parent_id", null)
        .order("name");
      return data || [];
    },
  });

  // Dynamic Nav Links
  const navLinks: NavLink[] = categories.map((cat: NavCategory) => ({
    href: `/shop?category=${cat.id}`,
    label: cat.name,
    children: cat.children,
    category: cat,
  }));

  return (
    <>
      <header className="relative w-full border-b border-border/40 bg-background/60 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Main Content - Fades out when search is open  */}
          <div
            className={cn(
              "w-full flex items-center justify-between transition-opacity duration-200",
              isSearchOpen ? "opacity-0 pointer-events-none" : "opacity-100",
            )}
          >
            {/* Mobile Menu & Logo */}
            <div className="flex items-center gap-2">
              <HamburgerMenu categories={categories} />

              <Link
                href="/"
                className="flex items-center gap-2 group"
                title="Home"
              >
                <div className="relative h-9 w-9 overflow-hidden rounded-full border border-border group-hover:scale-105 transition-all duration-300 shadow-lg">
                  <FlashImage
                    src="/flash-logo.jpg"
                    alt="Flash Logo"
                    width={60}
                    height={60}
                    unoptimized
                    className="bg-background"
                  />
                </div>
                <span className="hidden lg:flex text-xl font-black tracking-tighter text-gradient items-center gap-1">
                  FLASH
                </span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-2">
              {navLinks.map((link: NavLink) => (
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
                href="/lab"
                className={cn(
                  "text-[13px] font-bold uppercase tracking-wider transition-all px-4 py-2 rounded-full",
                  pathname === "/lab"
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5",
                )}
              >
                Lab
              </Link>
              <Link
                href="/blog"
                className={cn(
                  "text-[13px] font-bold uppercase tracking-wider transition-all px-4 py-2 rounded-full",
                  pathname?.startsWith("/blog")
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5",
                )}
              >
                Blog
              </Link>
              <Link
                href="/contact"
                className={cn(
                  "text-[13px] font-bold uppercase tracking-wider transition-all px-4 py-2 rounded-full",
                  pathname === "/contact"
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5",
                )}
              >
                Contact
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search Trigger */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
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
                  {mounted && wishlistCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full gradient-primary text-[9px] font-black text-white ring-2 ring-background">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>

              {mounted && user ? (
                <NotificationBell />
              ) : (
                <Skeleton className="h-10 w-10 rounded-full bg-muted/50 hidden sm:block" />
              )}

              <div className="hidden sm:block">
                <ModeToggle />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCartOpen(true)}
                className="relative rounded-full hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors h-10 w-10"
              >
                <ShoppingBag className="h-5 w-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full gradient-primary text-[9px] font-black text-white ring-2 ring-background">
                    {cartCount}
                  </span>
                )}
              </Button>

              <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

              {mounted && (
                <>
                  {user ? (
                    <div className="flex items-center gap-2">
                      <Link href="/account" className="hidden sm:block">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full gap-2 px-3 font-bold border border-border/50 hover:border-primary/50 transition-all"
                        >
                          <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center text-[10px] text-white">
                            {user.email?.[0]?.toUpperCase()}
                          </div>
                          <span className="max-w-[100px] truncate text-xs uppercase tracking-tight">
                            {profile?.name || user.email?.split("@")[0]}
                          </span>
                        </Button>
                      </Link>

                      {isAdmin && (
                        <Link href="/admin" className="hidden md:block">
                          <Button
                            size="sm"
                            className="rounded-full gradient-primary shadow-lg shadow-primary/20 text-[10px] font-black uppercase tracking-widest h-8"
                          >
                            Admin
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <Link href="/login">
                      <Button
                        size="sm"
                        className="rounded-full px-6 font-black uppercase tracking-[0.15em] text-[10px] gradient-primary shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300"
                      >
                        Join Now
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isSearchOpen && (
          <SearchOverlay
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

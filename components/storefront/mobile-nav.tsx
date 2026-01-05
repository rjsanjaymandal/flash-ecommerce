"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Grid,
  User,
  ShoppingBag,
  FlaskConical,
  LucideIcon,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore, selectCartCount } from "@/store/use-cart-store";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { motion } from "framer-motion";
import { useScrollDirection } from "@/hooks/use-scroll-direction";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  count?: number;
}

export function MobileNav() {
  const pathname = usePathname();
  const cartCount = useCartStore(selectCartCount);
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen);

  const links: NavLink[] = [
    { href: "/", label: "Home", icon: Home },
    { href: "/shop", label: "Shop", icon: Grid },
    { href: "/wishlist", label: "Wishlist", icon: Heart, count: wishlistCount },
    { href: "/lab", label: "Lab", icon: FlaskConical },
    { href: "/account", label: "You", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/40 lg:hidden pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around h-16 px-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-300 relative",
                isActive
                  ? "text-primary scale-110"
                  : "text-muted-foreground/60 hover:text-primary"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "h-5 w-5 transition-all",
                    isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"
                  )}
                />
                {link.count !== undefined && link.count > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full gradient-primary text-[9px] font-black text-white ring-2 ring-background">
                    {link.count}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] uppercase tracking-tighter font-black",
                  isActive
                    ? "opacity-100"
                    : "opacity-0 h-0 overflow-hidden group-hover:opacity-100 group-hover:h-auto transition-all"
                )}
              >
                {link.label}
              </span>
            </Link>
          );
        })}

        {/* Cart Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-300 text-muted-foreground/60 hover:text-primary relative"
        >
          <div className="relative">
            <ShoppingBag className="h-5 w-5 stroke-[1.5px]" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full gradient-primary text-[9px] font-black text-white ring-2 ring-background">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] uppercase tracking-tighter font-black opacity-0 h-0">
            Cart
          </span>
        </button>
      </div>
    </div>
  );
}

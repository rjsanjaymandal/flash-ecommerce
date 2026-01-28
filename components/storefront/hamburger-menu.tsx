"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Menu,
  ChevronRight,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  User,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import FlashImage from "@/components/ui/flash-image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { ModeToggle } from "@/components/ui/mode-toggle";

interface NavCategory {
  id: string;
  name: string;
  slug: string;
  children?: NavCategory[];
}

interface HamburgerMenuProps {
  categories: NavCategory[];
}

export function HamburgerMenu({ categories }: HamburgerMenuProps) {
  const [open, setOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden -ml-2 text-foreground hover:bg-accent rounded-full h-10 w-10"
          suppressHydrationWarning
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[300px] sm:w-[350px] p-0 border-r border-border bg-background"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>
            Main navigation menu for accessing shop categories, user account,
            and login options.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col h-full bg-background">
          {/* Header */}
          <div className="p-6 border-b border-border bg-muted/20">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 w-fit"
            >
              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-border shadow-lg">
                <FlashImage
                  src="/flash-logo.jpg"
                  alt="Flash Logo"
                  width={60}
                  height={60}
                  unoptimized
                />
              </div>
              <span className="text-2xl font-black tracking-tighter text-foreground italic">
                FLASH
              </span>
            </Link>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
            {/* Main Links */}
            <div className="space-y-1">
              <Link
                href="/shop"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-all group"
              >
                <span className="text-lg font-black uppercase tracking-tight">
                  Shop All
                </span>
                <ChevronRight className="h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform" />
              </Link>
              {categories.map((cat) => (
                <div key={cat.id}>
                  <Link
                    href={`/shop?category=${cat.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-all group"
                  >
                    <span className="text-lg font-bold uppercase tracking-tight">
                      {cat.name}
                    </span>
                    <ChevronRight className="h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  {/* Subcategories (if any) */}
                  {cat.children && cat.children.length > 0 && (
                    <div className="pl-6 mt-1 space-y-1 border-l border-border/50 ml-3">
                      {cat.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/shop?category=${child.id}`}
                          onClick={() => setOpen(false)}
                          className="block py-2 px-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer / Socials */}
          <div className="p-6 border-t border-border bg-muted/20 pb-safe space-y-6">
            <div className="flex flex-col items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
                Appearance
              </span>
              <ModeToggle />
            </div>

            <div className="h-px bg-border/40" />

            {/* Account Section */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 px-2 block text-center">
                Using Flash As
              </span>
              {user ? (
                <Link href="/account" onClick={() => setOpen(false)}>
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-background border border-border hover:border-primary/50 transition-colors">
                    <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-xs font-black text-white shrink-0">
                      {user.email?.[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground uppercase tracking-tight truncate">
                        {profile?.name || "Member"}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button className="w-full rounded-xl bg-background hover:bg-muted text-foreground border border-border font-bold uppercase tracking-wider text-xs h-12">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setOpen(false)}>
                    <Button className="w-full rounded-xl gradient-primary text-white border-0 font-bold uppercase tracking-wider text-xs h-12 shadow-lg shadow-primary/20">
                      Join
                    </Button>
                  </Link>
                </div>
              )}
              {user && (
                <Button
                  variant="outline"
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                  className="w-full rounded-2xl border-red-500/20 bg-red-500/5 text-red-600 hover:bg-red-500/10 hover:border-red-500/30 font-black uppercase tracking-[0.2em] text-[10px] h-12 mt-2 transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Terminate Session
                </Button>
              )}
            </div>

            <div className="flex justify-center gap-6">
              {[
                {
                  Icon: Instagram,
                  href: "https://www.instagram.com/flashhfashion/",
                },
                { Icon: Twitter, href: "#" },
                { Icon: Youtube, href: "#" },
                {
                  Icon: Facebook,
                  href: "https://www.facebook.com/share/1Ec2dVLnh4/",
                },
              ].map(({ Icon, href }, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full h-8 w-8"
                  asChild
                >
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    <Icon className="h-4 w-4" />
                  </a>
                </Button>
              ))}
            </div>
            <p className="text-center text-[10px] text-zinc-700 font-medium mt-4 uppercase tracking-widest">
              © 2026 FLASH FASHION
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

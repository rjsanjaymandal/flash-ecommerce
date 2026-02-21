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
  LayoutGrid,
  Phone,
  BookOpen,
  Tag,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import FlashImage from "@/components/ui/flash-image";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

interface NavCategory {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
  children?: NavCategory[];
}

interface HamburgerMenuProps {
  categories: NavCategory[];
}

export function HamburgerMenu({ categories }: HamburgerMenuProps) {
  const [open, setOpen] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();

  const menuVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.5,
        ease: [0.21, 0.47, 0.32, 0.98],
      },
    }),
  };

  const mainLinks = [
    { href: "/shop", label: "Collections", icon: LayoutGrid },
    { href: "/blog", label: "Journal", icon: BookOpen },
    { href: "/contact", label: "Support", icon: Phone },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden -ml-2 text-foreground active:scale-90 transition-transform rounded-full h-10 w-10 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          suppressHydrationWarning
        >
          <Menu className="h-6 w-6 stroke-[1.5px]" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-full sm:w-[400px] p-0 border-r border-border/40 bg-background/95 backdrop-blur-3xl"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>
            Premium navigation experience for Flash Fashion.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-8 pt-12 pb-8 flex items-center justify-between">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 group"
            >
              <div className="h-8 w-8 relative overflow-hidden rounded-full grayscale group-hover:grayscale-0 transition-all duration-500 ring-1 ring-border/50">
                <FlashImage
                  src="/flash-logo.jpg"
                  alt="Flash Logo"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="text-2xl font-black tracking-[-0.05em] text-foreground italic font-mono uppercase">
                Flash
              </span>
            </Link>
            <ModeToggle />
          </div>

          {/* Nav Links */}
          <div className="flex-1 overflow-y-auto px-8 py-4 scrollbar-hide">
            <div className="space-y-1">
              {/* Categories */}
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  custom={i}
                  initial="hidden"
                  animate={open ? "visible" : "hidden"}
                  variants={menuVariants}
                >
                  <Link
                    href={`/shop?category=${cat.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-4 py-3 group hover:pl-2 transition-all duration-300"
                  >
                    <Tag className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-lg font-bold text-foreground/80 group-hover:text-foreground transition-colors">
                      {cat.name}
                    </span>
                  </Link>
                </motion.div>
              ))}

              <div className="my-4 border-t border-border/40" />

              {/* Main Links */}
              {mainLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  custom={i + categories.length}
                  initial="hidden"
                  animate={open ? "visible" : "hidden"}
                  variants={menuVariants}
                >
                  <Link
                    href={link.href as any}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-4 py-3 group hover:pl-2 transition-all duration-300"
                  >
                    <link.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-lg font-bold text-foreground/80 group-hover:text-foreground transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Featured Drops Carousel (New) */}
            <div className="mt-10 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                  Featured Drops
                </h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide snap-x snap-mandatory">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.id}`}
                    onClick={() => setOpen(false)}
                    className="relative flex-none w-[160px] aspect-4/5 rounded-2xl overflow-hidden group/item snap-start"
                  >
                    {cat.image_url ? (
                      <FlashImage
                        src={cat.image_url}
                        alt={cat.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover/item:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900" />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 p-4 flex flex-col justify-end">
                      <span className="text-[10px] font-black text-white leading-tight uppercase tracking-widest italic drop-shadow-md">
                        {cat.name}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* User & Footer (Fixed Bottom) */}
          <div className="p-8 space-y-8 border-t border-border/40 pb-safe bg-background/50 backdrop-blur-md">
            {/* Account Info */}
            <div>
              {user ? (
                <div className="space-y-4">
                  <Link href="/account" onClick={() => setOpen(false)}>
                    <div className="flex items-center gap-4 p-4 rounded-3xl bg-background border border-border/60 hover:border-primary/40 transition-all shadow-sm group">
                      <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-xs font-black text-white group-hover:scale-105 transition-transform">
                        {user.email?.[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground uppercase tracking-tight truncate">
                          {profile?.name || "Member"}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-medium truncate uppercase tracking-widest">
                          Secured Transmission
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                  <div className="grid grid-cols-2 gap-3">
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setOpen(false)}>
                        <Button
                          variant="outline"
                          className="w-full rounded-2xl border-zinc-200 dark:border-zinc-800 font-black uppercase tracking-widest text-[9px] h-11"
                        >
                          Admin
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => {
                        signOut();
                        setOpen(false);
                      }}
                      className="w-full rounded-2xl border-red-500/10 bg-red-500/5 text-red-500 hover:bg-red-500/10 hover:border-red-500/20 font-black uppercase tracking-widest text-[9px] h-11 transition-all"
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex-1"
                  >
                    <Button className="w-full rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-foreground border-0 font-black uppercase tracking-widest text-[10px] h-12">
                      Login
                    </Button>
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="flex-1"
                  >
                    <Button className="w-full rounded-2xl gradient-primary text-white border-0 font-black uppercase tracking-widest text-[10px] h-12 shadow-lg shadow-primary/20">
                      Join
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Socials */}
            <div className="flex items-center justify-center gap-8">
              {[
                {
                  Icon: Instagram,
                  href: "https://www.instagram.com/flashhfashion/",
                },
                { Icon: Twitter, href: "https://twitter.com/flashhfashion" },
                { Icon: Youtube, href: "#" }, // Keeping Youtube as # since we don't have a URL for it yet
                {
                  Icon: Facebook,
                  href: "https://www.facebook.com/share/1Ec2dVLnh4/",
                },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target={href !== "#" ? "_blank" : undefined}
                  rel={href !== "#" ? "noopener noreferrer" : undefined}
                  className="text-muted-foreground/40 hover:text-foreground transition-colors p-1"
                >
                  <Icon className="h-5 w-5 stroke-[1.5px]" />
                </a>
              ))}
            </div>

            <p className="text-center text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.4em]">
              Flash Fashion © 2026
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

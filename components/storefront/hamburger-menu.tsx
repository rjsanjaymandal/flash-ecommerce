'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, ChevronRight, Facebook, Instagram, Twitter, Youtube, User } from "lucide-react"
import Link from "next/link"
import NextImage from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"

interface HamburgerMenuProps {
    categories: any[]
}

export function HamburgerMenu({ categories }: HamburgerMenuProps) {
    const [open, setOpen] = useState(false)
    const { user, profile } = useAuth()

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden -ml-2 text-foreground hover:bg-white/10 rounded-full h-10 w-10" suppressHydrationWarning>
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 border-r border-white/10 bg-zinc-950">
                <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                    <SheetDescription>
                        Main navigation menu for accessing shop categories, user account, and login options.
                    </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col h-full bg-zinc-950 bg-gradient-to-b from-zinc-900/50 to-zinc-950">
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 bg-zinc-900/50">
                        <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 w-fit">
                            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/20 shadow-lg">
                                <NextImage 
                                    src="/flash-logo.jpg" 
                                    alt="Flash Logo" 
                                    fill 
                                    className="object-cover" 
                                />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-white italic">FLASH</span>
                        </Link>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
                        {/* Main Links */}
                        <div className="space-y-1">
                             <Link 
                                href="/shop" 
                                onClick={() => setOpen(false)}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all group"
                            >
                                <span className="text-lg font-black uppercase tracking-tight">Shop All</span>
                                <ChevronRight className="h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            {categories.map((cat) => (
                                <div key={cat.id}>
                                    <Link 
                                        href={`/shop?category=${cat.id}`}
                                        onClick={() => setOpen(false)}
                                        className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all group"
                                    >
                                        <span className="text-lg font-bold uppercase tracking-tight">{cat.name}</span>
                                        <ChevronRight className="h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    {/* Subcategories (if any) */}
                                    {cat.children && cat.children.length > 0 && (
                                        <div className="pl-6 mt-1 space-y-1 border-l border-white/5 ml-3">
                                            {cat.children.map((child: any) => (
                                                 <Link 
                                                    key={child.id}
                                                    href={`/shop?category=${child.id}`}
                                                    onClick={() => setOpen(false)}
                                                    className="block py-2 px-3 text-sm font-medium text-zinc-500 hover:text-white transition-colors uppercase tracking-wider"
                                                >
                                                    {child.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        {/* Account Section */}
                         <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 px-3">Using Flash As</span>
                            {user ? (
                                <Link href="/account" onClick={() => setOpen(false)}>
                                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/50 transition-colors">
                                        <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-xs font-black text-white">
                                            {user.email?.[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white uppercase tracking-tight">{profile?.name || 'Member'}</p>
                                            <p className="text-[10px] text-zinc-500 font-medium truncate max-w-[140px]">{user.email}</p>
                                        </div>
                                    </div>
                                </Link>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <Link href="/login" onClick={() => setOpen(false)}>
                                        <Button className="w-full rounded-xl bg-white/10 hover:bg-white/20 text-white border-0 font-bold uppercase tracking-wider text-xs h-12">
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
                        </div>
                    </div>

                    {/* Footer / Socials */}
                    <div className="p-6 border-t border-white/10 bg-zinc-900/50">
                        <div className="flex justify-center gap-6">
                            {[Instagram, Twitter, Youtube, Facebook].map((Icon, i) => (
                                <Button key={i} variant="ghost" size="icon" className="text-zinc-500 hover:text-white hover:bg-white/10 rounded-full h-8 w-8">
                                    <Icon className="h-4 w-4" />
                                </Button>
                            ))}
                        </div>
                        <p className="text-center text-[10px] text-zinc-700 font-medium mt-4 uppercase tracking-widest">
                            © 2024 FLASH Inc.
                        </p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

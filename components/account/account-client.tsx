'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileTab } from "@/components/account/profile-tab"
import { OrdersTab } from "@/components/account/orders-tab"
import { WishlistTab } from "@/components/account/wishlist-tab"
import { LoyaltyCard } from '@/components/account/loyalty-card'
import { ArrowRight, Zap, ShoppingBag, Heart, Award } from "lucide-react"
import { SignOutButton } from "@/components/account/sign-out-button"
import { FeaturedGrid } from "@/components/storefront/featured-grid"
import Link from "next/link"
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { BrandBadge } from "@/components/storefront/brand-badge"
import { BrandGlow } from "@/components/storefront/brand-glow"

interface AccountClientProps {
  user: any
  profile: any
  orders: any[]
  recommendations: any[]
}

export function AccountClient({ user, profile, orders, recommendations }: AccountClientProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
      return null
  }

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen max-w-6xl relative">
        <BrandGlow className="top-0 left-[-10%] opacity-50" size="lg" />
        
        {/* Premium Header */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-[2.5rem] overflow-hidden bg-zinc-950 p-6 md:p-14 mb-12 md:mb-16 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] group border border-white/5"
        >
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px] -mr-64 -mt-64 group-hover:bg-primary/30 transition-colors duration-1000" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px] -ml-32 -mb-32" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-10">
                <div className="space-y-4 md:space-y-6">
                    <BrandBadge variant="primary">Member Dashboard</BrandBadge>
                    <h1 className="text-5xl xs:text-6xl md:text-8xl font-black tracking-tighter text-white uppercase leading-[0.85] md:leading-[0.8] italic">
                        HELLO, <br />
                        <span className="text-gradient drop-shadow-2xl">{profile?.name?.split(' ')[0] || user.email?.split('@')[0]}</span>
                    </h1>
                </div>
                
                <div className="flex flex-wrap gap-3 md:gap-4">
                    <Button variant="outline" className="rounded-full bg-white/5 border-white/10 text-white hover:bg-white/10 h-12 md:h-14 px-6 md:px-10 uppercase tracking-widest text-[10px] md:text-xs font-black shadow-xl shrink-0" asChild>
                        <Link href="/shop">Continue Shopping</Link>
                    </Button>
                    <SignOutButton />
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 mt-12 md:mt-16 pt-12 md:pt-16 border-t border-white/10">
                {[
                    { label: "Flash Points", value: profile?.loyalty_points || 0, icon: Zap, color: "text-yellow-400" },
                    { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-blue-400" },
                    { label: "Saved Items", value: "8", icon: Heart, color: "text-rose-400" }, 
                    { label: "Member Tier", value: "Silver", icon: Award, color: "text-zinc-400" }
                ].map((stat, i) => (
                    <motion.div 
                        key={stat.label} 
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="space-y-1 md:space-y-2 p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 shadow-lg group/stat"
                    >
                        <div className="flex items-center gap-1.5 md:gap-2 text-zinc-500 mb-1 md:mb-2">
                            <stat.icon className={`h-3 w-3 md:h-4 md:w-4 ${stat.color} transition-transform group-hover/stat:scale-110`} />
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest leading-none">{stat.label}</span>
                        </div>
                        <p className="text-2xl md:text-4xl font-black text-white tracking-tight leading-none">{stat.value}</p>
                    </motion.div>
                ))}
            </div>
        </motion.div>

        {/* Tabs Content */}
        <Tabs defaultValue="overview" className="space-y-10 md:space-y-12 animate-in fade-in duration-700">
            <div className="flex justify-center overflow-x-auto pb-4 md:pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                <TabsList className="bg-zinc-100/80 backdrop-blur-md p-1.5 md:p-2 rounded-full inline-flex h-auto shadow-sm border border-zinc-200/50 min-w-max">
                    <TabsTrigger value="overview" className="rounded-full px-6 md:px-10 py-3 md:py-4 data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all text-[10px] md:text-[11px] font-black uppercase tracking-widest">
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="rounded-full px-6 md:px-10 py-3 md:py-4 data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all text-[10px] md:text-[11px] font-black uppercase tracking-widest">
                        Settings
                    </TabsTrigger>
                    <TabsTrigger value="wishlist" className="rounded-full px-6 md:px-10 py-3 md:py-4 data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all text-[10px] md:text-[11px] font-black uppercase tracking-widest">
                       Wishlist
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-8 md:space-y-16 animate-in fade-in duration-500 focus-visible:outline-none">
                <div className="grid gap-6 md:gap-8 lg:grid-cols-12 items-start">
                    {/* Main Loyalty & Actions */}
                    <div className="lg:col-span-4 space-y-4 md:space-y-6">
                        <LoyaltyCard points={profile?.loyalty_points || 0} />
                    </div>

                    {/* Orders History */}
                    <div className="lg:col-span-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-8">
                            <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">Recent Transmissions</h2>
                            <Badge variant="outline" className="rounded-full px-4 py-1 font-bold border-2 w-fit">{orders.length} Total</Badge>
                        </div>
                        <div className="bg-white rounded-4xl md:rounded-4xl border-2 shadow-sm border-zinc-100 overflow-hidden">
                            <OrdersTab orders={orders} />
                        </div>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="profile" className="focus-visible:outline-none">
                <div className="max-w-2xl mx-auto">
                     <div className="mb-12 text-center">
                         <h2 className="text-4xl font-black tracking-tighter uppercase italic">IDENTITY <span className="text-muted-foreground">VAULT</span></h2>
                         <p className="text-muted-foreground font-medium mt-2 text-sm uppercase tracking-widest">Update your personal data profiles.</p>
                     </div>
                     <Card className="border-2 p-8 rounded-3xl overflow-hidden relative">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                         <ProfileTab user={user} profile={profile} />
                     </Card>
                </div>
            </TabsContent>
            
            <TabsContent value="wishlist" className="focus-visible:outline-none">
                 <div className="space-y-12">
                     <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <span className="text-primary font-black tracking-[0.4em] uppercase text-[10px]">Curated Selection</span>
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.8] italic mt-4">
                                SAVED <span className="text-zinc-300">VAULT</span>
                            </h2>
                        </div>
                    </div>
                    <div className="bg-zinc-50/50 rounded-3xl border-2 p-8 min-h-[400px]">
                        <WishlistTab />
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    </div>
  )
}

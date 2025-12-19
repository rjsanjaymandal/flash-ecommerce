'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileTab } from "@/components/account/profile-tab"
import { OrdersTab } from "@/components/account/orders-tab"
// import { WishlistTab } from "@/components/account/wishlist-tab" // Removed
import { AddressTab } from "@/components/account/address-tab"
import { LoyaltyCard } from '@/components/account/loyalty-card'
import { ArrowRight, Zap, ShoppingBag, Heart, Award, MapPin, Clock } from "lucide-react"
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

import { Tables } from "@/types/supabase"
import { User } from "@supabase/supabase-js"

import { WaitlistTab } from "@/components/account/waitlist-tab"
import { Product } from "@/lib/services/product-service"

interface AccountClientProps {
  user: User
  profile: Tables<'profiles'>
  orders: Tables<'orders'>[]
  addresses: Tables<'addresses'>[]
  waitlist: Product[]
}

export function AccountClient({ user, profile, orders, addresses, waitlist }: AccountClientProps) {
  const [mounted, setMounted] = useState(false)
  const defaultAddress = addresses.find(a => a.is_default)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
      return null
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-24 min-h-screen max-w-6xl relative">
        <BrandGlow className="top-0 left-[-10%] opacity-50" size="lg" />
        
        {/* Premium Header - Always Dark for Flash Brand consistency, or Adaptive? Let's make it Adaptive Premium */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-zinc-950 p-6 md:p-14 mb-8 md:mb-16 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] group border border-white/5"
        >
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px] -mr-64 -mt-64 group-hover:bg-primary/30 transition-colors duration-1000" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px] -ml-32 -mb-32" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10">
                <div className="space-y-4 md:space-y-6">
                    <BrandBadge variant="primary" className="text-[10px] py-0.5 px-2">Member Dashboard</BrandBadge>
                    <h1 className="text-4xl xs:text-5xl md:text-8xl font-black tracking-tighter text-white uppercase leading-[0.85] md:leading-[0.8] italic break-words">
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
            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 mt-8 md:mt-16 pt-8 md:pt-16 border-t border-white/10">
                {[
                    { label: "Flash Points", value: profile?.loyalty_points || 0, icon: Zap, color: "text-yellow-400" },
                    { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-blue-400" },
                    { label: "My Waitlist", value: waitlist.length, icon: Clock, color: "text-amber-500" }, 
                    { label: "Tier Status", value: "Silver", icon: Award, color: "text-zinc-400" }
                ].map((stat, i) => (
                    <motion.div 
                        key={stat.label} 
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="space-y-1 md:space-y-2 p-3 md:p-6 rounded-xl md:rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 shadow-lg group/stat"
                    >
                        <div className="flex items-center gap-1.5 md:gap-2 text-zinc-400 mb-0.5 md:mb-2">
                            <stat.icon className={`h-3 w-3 md:h-4 md:w-4 ${stat.color} transition-transform group-hover/stat:scale-110`} />
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest leading-none">{stat.label}</span>
                        </div>
                        <p className="text-xl md:text-4xl font-black text-white tracking-tight leading-none">{stat.value}</p>
                    </motion.div>
                ))}
            </div>
        </motion.div>

        {/* Tabs Content */}
        <Tabs defaultValue="overview" className="space-y-10 md:space-y-12 animate-in fade-in duration-700">
            <div className="flex justify-start md:justify-center overflow-x-auto pb-4 md:pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                <TabsList className="bg-muted/80 backdrop-blur-md p-1.5 md:p-2 rounded-full inline-flex h-auto shadow-xl border border-border/50 min-w-max ring-1 ring-border/5">
                    <TabsTrigger value="overview" className="rounded-full px-6 md:px-10 py-3 md:py-4 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-all text-[10px] md:text-[11px] font-black uppercase tracking-widest">
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="addresses" className="rounded-full px-6 md:px-10 py-3 md:py-4 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-all text-[10px] md:text-[11px] font-black uppercase tracking-widest">
                        Addresses
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="rounded-full px-6 md:px-10 py-3 md:py-4 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-all text-[10px] md:text-[11px] font-black uppercase tracking-widest">
                        Settings
                    </TabsTrigger>
                    <TabsTrigger value="waitlist" className="rounded-full px-6 md:px-10 py-3 md:py-4 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-all text-[10px] md:text-[11px] font-black uppercase tracking-widest">
                       Waitlist
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-8 md:space-y-16 animate-in fade-in duration-500 focus-visible:outline-none">
                <div className="grid gap-6 md:gap-8 lg:grid-cols-12 items-start">
                    {/* Main Loyalty & Actions */}
                    <div className="lg:col-span-4 space-y-4 md:space-y-6">
                        <LoyaltyCard points={profile?.loyalty_points || 0} />
                        
                        {/* Mini Address Preview */}
                        <div className="bg-card rounded-[2rem] p-6 border-2 border-border/50 shadow-sm relative overflow-hidden group">
                           <div className="flex justify-between items-start mb-4">
                                <h3 className="font-black uppercase italic text-xl tracking-tighter text-foreground">Primary <br/> Location</h3>
                                <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                </div>
                           </div>
                           {defaultAddress ? (
                               <div className="text-sm font-medium text-muted-foreground space-y-1">
                                   <p className="font-bold text-foreground">{defaultAddress!.name}</p>
                                   <p>{defaultAddress!.city}, {defaultAddress!.state}</p>
                                   <p className="text-xs font-mono bg-muted px-2 py-1 rounded-md w-fit mt-2">{defaultAddress!.pincode}</p>
                               </div>
                           ) : (
                               <div className="text-center py-4">
                                   <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-4">No default address set</p>
                                   <Button size="sm" variant="outline" className="rounded-full text-[10px] font-black uppercase" onClick={() => (document.querySelector('[value="addresses"]') as HTMLElement)?.click()}>
                                       Manage Addresses
                                   </Button>
                               </div>
                           )}
                        </div>
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

            <TabsContent value="addresses" className="focus-visible:outline-none">
                <AddressTab addresses={addresses} />
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
            

            <TabsContent value="waitlist" className="focus-visible:outline-none">
                 <div className="space-y-12 waitlist-tab-content">
                     <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <span className="text-amber-500 font-black tracking-[0.4em] uppercase text-[10px]">Back In Stock Soon</span>
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.8] italic mt-4">
                                WAIT<span className="text-zinc-300">LIST</span>
                            </h2>
                        </div>
                    </div>
                    <div className="bg-zinc-50/50 rounded-3xl border-2 p-8 min-h-[400px]">
                        <WaitlistTab products={waitlist} />
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    </div>
  )
}

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
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AccountClientProps {
  user: any
  profile: any
  orders: any[]
  recommendations: any[]
}

export function AccountClient({ user, profile, orders, recommendations }: AccountClientProps) {
  return (
    <div className="container mx-auto px-4 py-24 min-h-screen max-w-6xl">
        {/* Premium Header */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl overflow-hidden bg-zinc-900 p-8 md:p-12 mb-12 shadow-2xl group"
        >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-64 group-hover:bg-primary/30 transition-colors duration-1000" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -ml-32 -mb-32" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                         <div className="h-2 w-12 bg-primary rounded-full" />
                         <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Member Dashboard</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-[0.8] italic">
                        HELLO, <br />
                        <span className="text-gradient drop-shadow-2xl">{profile?.name?.split(' ')[0] || user.email?.split('@')[0]}</span>
                    </h1>
                </div>
                
                <div className="flex flex-wrap gap-4">
                    <Button variant="outline" className="rounded-full bg-white/5 border-white/10 text-white hover:bg-white/10 h-12 px-8 uppercase tracking-widest text-[10px] font-black" asChild>
                        <Link href="/shop">Continue Shopping</Link>
                    </Button>
                    <SignOutButton />
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-white/10">
                {[
                    { label: "Flash Points", value: profile?.loyalty_points || 0, icon: Zap },
                    { label: "Total Orders", value: orders.length, icon: ShoppingBag },
                    { label: "Saved Items", value: "8", icon: Heart }, // Placeholder or logic
                    { label: "Member Tier", value: "Silver", icon: Award }
                ].map((stat, i) => (
                    <div key={stat.label} className="space-y-1">
                        <div className="flex items-center gap-2 text-zinc-500 mb-1">
                            <stat.icon className="h-3 w-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <p className="text-xl font-bold text-white tracking-tight">{stat.value}</p>
                    </div>
                ))}
            </div>
        </motion.div>

        {/* Tabs Content */}
        <Tabs defaultValue="overview" className="space-y-12 animate-in fade-in duration-700">
            <div className="flex justify-center">
                <TabsList className="bg-zinc-100 p-1.5 rounded-full inline-flex h-auto shadow-inner border">
                    <TabsTrigger value="overview" className="rounded-full px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all text-[11px] font-black uppercase tracking-widest">
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="rounded-full px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all text-[11px] font-black uppercase tracking-widest">
                        Settings
                    </TabsTrigger>
                    <TabsTrigger value="wishlist" className="rounded-full px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all text-[11px] font-black uppercase tracking-widest">
                       Wishlist
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-16 animate-in fade-in duration-500 focus-visible:outline-none">
                <div className="grid gap-8 lg:grid-cols-12 items-start">
                    {/* Main Loyalty & Actions */}
                    <div className="lg:col-span-4 space-y-6">
                        <LoyaltyCard points={profile?.loyalty_points || 0} />
                        
                        <Card className="border-2 p-6 bg-zinc-50/50">
                            <h3 className="font-black uppercase tracking-tighter italic text-lg mb-4">Account Quick Actions</h3>
                            <div className="space-y-2">
                                <Button variant="ghost" className="w-full justify-between font-bold text-xs uppercase group" asChild>
                                    <Link href="/track">Track Package <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" /></Link>
                                </Button>
                                <Button variant="ghost" className="w-full justify-between font-bold text-xs uppercase group" asChild>
                                    <Link href="/support">Talk to Style Assistant <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" /></Link>
                                </Button>
                                <Button variant="ghost" className="w-full justify-between font-bold text-xs uppercase group" asChild>
                                    <Link href="/shipping">Update Warehouse Address <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" /></Link>
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Orders History */}
                    <div className="lg:col-span-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Recent Transmissions</h2>
                            <Badge variant="outline" className="rounded-full px-4 font-bold border-2">{orders.length} Total</Badge>
                        </div>
                        <div className="bg-white rounded-3xl border-2 overflow-hidden">
                            <OrdersTab orders={orders} />
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                <div className="pt-16 border-t">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                        <div>
                            <span className="text-primary font-black tracking-[0.4em] uppercase text-[10px]">Just for You</span>
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.8] italic mt-4">
                                VIBE <span className="text-gradient">DROPS</span>
                            </h2>
                        </div>
                        <Button asChild variant="link" className="text-foreground font-black uppercase tracking-widest group h-auto p-0">
                            <Link href="/shop" className="flex items-center gap-2">
                                View Full Collection <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>
                    <FeaturedGrid products={recommendations} />
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

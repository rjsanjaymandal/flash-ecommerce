'use client'

import { formatCurrency } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, MapPin, Download } from "lucide-react"
import Link from "next/link"
import { BrandBadge } from "@/components/storefront/brand-badge"
import { motion } from "framer-motion"

import { Tables } from "@/types/supabase"

interface OrderDetailsProps {
    order: Tables<'orders'>
    items: Tables<'order_items'>[]
}

export function OrderDetails({ order, items }: OrderDetailsProps) {
    const steps = [
        { status: 'pending', label: 'Order Placed', icon: Package },
        { status: 'paid', label: 'Payment Confirmed', icon: CheckCircle2 },
        { status: 'shipped', label: 'Shipped', icon: Truck },
        { status: 'delivered', label: 'Delivered', icon: MapPin },
    ]

    const currentStepIndex = steps.findIndex(s => s.status === order.status)
    const isCancelled = order.status === 'cancelled'

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <Link href="/account" className="inline-flex items-center text-zinc-500 hover:text-black mb-4 transition-colors text-xs font-bold uppercase tracking-widest">
                        <ArrowLeft className="mr-2 h-3 w-3" /> Back to Dashboard
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
                        Order <span className="text-zinc-300">#{order.id.slice(0, 8)}</span>
                    </h1>
                     <p className="text-zinc-500 font-medium mt-2">Placed on {new Date(order.created_at!).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-3">
                     <Button variant="outline" className="rounded-full h-10 px-6 uppercase font-black tracking-widest text-[10px]">
                        <Download className="mr-2 h-3 w-3" /> Invoice
                     </Button>
                     <BrandBadge variant={order.status === 'delivered' ? 'primary' : 'accent'} className="px-4 py-2 text-xs">
                         {order.status}
                     </BrandBadge>
                </div>
            </div>

            {/* Timeline */}
            {!isCancelled && (
                <div className="mb-16 relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-100 -translate-y-1/2 rounded-full hidden md:block" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                        {steps.map((step, i) => {
                            const completed = i <= currentStepIndex || order.status === 'delivered'
                            const current = i === currentStepIndex
                            
                            return (
                                <div key={step.status} className="relative z-10 flex flex-col items-center text-center">
                                    <div className={`
                                        h-12 w-12 rounded-full border-4 flex items-center justify-center transition-all duration-500 mb-3 bg-white
                                        ${completed ? 'border-primary text-primary shadow-lg scale-110' : 'border-zinc-100 text-zinc-300'}
                                    `}>
                                        <step.icon className="h-5 w-5" />
                                    </div>
                                    <p className={`text-[10px] uppercase font-black tracking-widest ${completed ? 'text-black' : 'text-zinc-300'}`}>
                                        {step.label}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                {/* Items */}
                <div className="md:col-span-2 space-y-8">
                     <div className="bg-white rounded-3xl border-2 border-zinc-100 overflow-hidden shadow-sm">
                         <div className="px-8 py-6 bg-zinc-50/50 border-b-2 border-zinc-100">
                             <h3 className="font-black uppercase tracking-widest text-xs text-zinc-500">Items Ordered</h3>
                         </div>
                         <div className="divide-y divide-zinc-100">
                             {items.map((item) => (
                                 <div key={item.id} className="p-6 md:p-8 flex gap-6 group hover:bg-zinc-50/50 transition-colors">
                                     <div className="h-24 w-20 bg-zinc-100 rounded-xl overflow-hidden shrink-0">
                                         {/* Placeholder for item image - ideally we join this in SQL or fetch it */}
                                         <div className="w-full h-full bg-linear-to-tr from-zinc-200 to-zinc-100 flex items-center justify-center">
                                             <Package className="h-6 w-6 text-zinc-300" />
                                         </div>
                                     </div>
                                     <div className="flex-1">
                                         <div className="flex justify-between items-start">
                                             <div>
                                                 <h4 className="font-bold text-lg leading-tight">{item.name_snapshot || 'Product Item'}</h4>
                                                  <p className="text-zinc-500 text-sm mt-1 font-medium">Size: {item.size} • Color: {item.color}</p>
                                             </div>
                                             <p className="font-black text-lg font-mono">{formatCurrency(item.unit_price * item.quantity)}</p>
                                         </div>
                                         <div className="flex justify-between items-end mt-4">
                                              <Badge variant="secondary" className="rounded-md font-mono text-[10px]">Qty: {item.quantity}</Badge>
                                              <Button variant="link" className="text-primary p-0 h-auto text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                                  Write a Review
                                              </Button>
                                         </div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-zinc-950 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
                        <h3 className="font-black uppercase tracking-widest text-xs text-white/50 mb-6">Order Summary</h3>
                        
                        <div className="space-y-4 mb-6 text-sm font-medium text-white/80">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>{order.shipping_fee === 0 ? 'Free' : formatCurrency(order.shipping_fee ?? 0)}</span>
                            </div>
                             {(order.discount_amount ?? 0) > 0 && (
                                <div className="flex justify-between text-green-400">
                                    <span>Discount</span>
                                    <span>-{formatCurrency(order.discount_amount ?? 0)}</span>
                                </div>
                            )}
                        </div>
                        <Separator className="bg-white/10 mb-6" />
                        <div className="flex justify-between items-end">
                            <span className="font-black uppercase tracking-widest text-xs">Total</span>
                            <span className="font-black text-3xl leading-none">{formatCurrency(order.total)}</span>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-3xl p-8 border-2 border-zinc-100">
                        <div className="flex items-center gap-3 mb-4">
                             <div className="h-8 w-8 bg-zinc-100 rounded-full flex items-center justify-center">
                                 <MapPin className="h-4 w-4 text-zinc-500" />
                             </div>
                             <h3 className="font-black uppercase tracking-widest text-xs text-zinc-500">Shipping To</h3>
                        </div>
                        <p className="font-bold text-lg leading-none mb-2">{order.shipping_name || order.address_line1}</p>
                        <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                            {order.address_line1} <br/>
                            {order.address_line2 && <>{order.address_line2} <br/></>}
                            {order.city}, {order.state} - {order.pincode} <br/>
                            {order.country}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

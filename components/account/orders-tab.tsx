'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Package, ExternalLink, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/utils"
import { motion } from "framer-motion"
import { BrandBadge } from "@/components/storefront/brand-badge"
import Link from "next/link"

export function OrdersTab({ orders }: { orders: any[] }) {
    const [mounted, setMounted] = useState(false)
    
    useEffect(() => {
        setMounted(true)
    }, [])

    if (orders.length === 0) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center rounded-4xl border-2 border-dashed bg-zinc-50/50"
            >
                <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl border-2 border-zinc-100"
                >
                    <Package className="h-10 w-10 text-primary" />
                </motion.div>
                <h3 className="font-black text-2xl mb-2 uppercase italic tracking-tighter">Your Closet is Empty</h3>
                <p className="text-muted-foreground max-w-xs mb-8 text-sm font-medium">
                    No transmissions detected in your order history. Time to refresh your rotation?
                </p>
                <Button asChild className="rounded-full px-8 h-12 gradient-primary shadow-lg font-black uppercase tracking-widest text-[10px]">
                    <Link href="/shop" className="flex items-center gap-2">Explore Collections <ArrowRight className="h-4 w-4" /></Link>
                </Button>
            </motion.div>
        )
    }

    return (
        <div className="space-y-4">
             {/* Mobile Card View */}
             <div className="md:hidden space-y-4">
                 {orders.map((order) => (
                     <div key={order.id} className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm space-y-4">
                         <div className="flex items-center justify-between">
                             <div>
                                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Order ID</p>
                                <p className="font-mono text-sm font-bold text-zinc-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                             </div>
                             <BrandBadge 
                                variant={order.status === 'Delivered' ? 'primary' : order.status === 'Processing' ? 'accent' : 'glass'}
                                className="text-[9px]"
                            >
                                {order.status}
                            </BrandBadge>
                         </div>
                         
                         <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                             <div>
                                 <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Total</p>
                                 <p className="font-black text-lg text-zinc-900 tracking-tighter">{formatCurrency(order.total)}</p>
                             </div>
                             <div className="text-right">
                                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Date</p>
                                  <p className="text-xs font-bold text-zinc-600">
                                    {mounted ? new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "-"}
                                  </p>
                             </div>
                         </div>
                         
                         <Button asChild size="sm" variant="outline" className="w-full rounded-xl border-2 font-bold text-xs uppercase tracking-wider h-10 mt-2">
                            <Link href={`/account/orders/${order.id}`}>
                                View Details <ArrowRight className="h-3 w-3 ml-2" />
                            </Link>
                         </Button>
                     </div>
                 ))}
             </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-4xl bg-white border-2 border-zinc-100 overflow-hidden shadow-sm animate-in fade-in duration-700">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-zinc-50/80 backdrop-blur-sm border-b-2 border-zinc-100">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[120px] font-black uppercase tracking-widest text-[10px] text-zinc-500 py-6 pl-8">Order ID</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px] text-zinc-500 py-6">Timeline</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px] text-zinc-500 py-6">Status</TableHead>
                                <TableHead className="text-right font-black uppercase tracking-widest text-[10px] text-zinc-500 py-6 pr-8">Quantum Total</TableHead>
                                <TableHead className="w-[80px] pr-8"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order, idx) => (
                                <motion.tr 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={order.id} 
                                    className="group hover:bg-zinc-50 transition-colors border-b last:border-b-0 border-zinc-100"
                                >
                                    <TableCell className="font-mono text-[11px] font-black text-primary py-6 pl-8">
                                        <span className="opacity-40">#</span>{order.id.slice(0, 8).toUpperCase()}
                                    </TableCell>
                                    <TableCell className="text-[11px] font-bold text-zinc-500 py-6">
                                        {mounted ? new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "-"}
                                    </TableCell>
                                    <TableCell className="py-6">
                                        <BrandBadge 
                                            variant={order.status === 'Delivered' ? 'primary' : order.status === 'Processing' ? 'accent' : 'glass'}
                                            className="text-[9px]"
                                        >
                                            {order.status}
                                        </BrandBadge>
                                    </TableCell>
                                    <TableCell className="text-right font-black text-sm py-6 pr-8 tracking-tighter">
                                        {formatCurrency(order.total)}
                                    </TableCell>
                                    <TableCell className="py-6 pr-8 text-right">
                                        <Button asChild variant="outline" size="icon" className="h-10 w-10 rounded-xl border-2 hover:bg-zinc-100 transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
                                            <Link href={`/account/orders/${order.id}`}>
                                                <ExternalLink className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}

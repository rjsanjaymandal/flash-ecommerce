'use client'

import { ProductCard } from "@/components/storefront/product-card"
import { Clock, ShoppingBag } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Product } from "@/lib/services/product-service"

interface WaitlistTabProps {
    products: Product[]
}

export function WaitlistTab({ products }: WaitlistTabProps) {

    if (products.length === 0) {
        return (
             <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center rounded-4xl border-2 border-dashed bg-muted/20 border-border/50"
             >
                <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="h-20 w-20 bg-card rounded-full flex items-center justify-center mb-8 shadow-xl border-2 border-border/20"
                >
                    <Clock className="h-10 w-10 text-amber-500 fill-amber-500/20" />
                </motion.div>
                <h3 className="font-black text-3xl mb-2 uppercase italic tracking-tighter text-foreground">Waitlist Empty</h3>
                <p className="text-muted-foreground max-w-xs mb-8 text-sm font-medium uppercase tracking-widest leading-relaxed">
                    You're not waiting for any items. When you see something you love that's out of stock, join the queue here.
                </p>
                <Button size="lg" className="rounded-full px-10 font-black uppercase tracking-widest text-xs gradient-primary shadow-2xl hover:scale-105 transition-all" asChild>
                    <Link href="/shop" className="flex items-center gap-2">
                        Explore Collections 
                    </Link>
                </Button>
            </motion.div>
        )
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-2 duration-500">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    )
}

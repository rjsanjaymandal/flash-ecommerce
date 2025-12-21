'use client'

import { useEffect, useState, useRef } from 'react'
import { useRecentStore } from '@/lib/store/use-recent-store'
import { ProductCard } from '@/components/storefront/product-card'
import { Button } from '@/components/ui/button'
import { Trash2, History } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

export function RecentlyViewed({ currentProduct }: { currentProduct?: any }) {
    const { items, addItem, clear } = useRecentStore()
    const [mounted, setMounted] = useState(false)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    // Hydration fix
    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (currentProduct) {
            addItem({
                id: currentProduct.id,
                name: currentProduct.name,
                price: currentProduct.price,
                image: currentProduct.main_image_url,
                slug: currentProduct.slug || currentProduct.id,
                product_stock: currentProduct.product_stock,
                // Add minimal required fields for ProductCard if needed, though ProductCard takes a full Product object.
                // We might need to map or ensure the store has enough info, or fetch full details.
                // For now, let's assume ProductCard can handle a partial object or we map it correctly.
                // Actually, ProductCard expects a 'Product' type. storing full product in local storage might be heavy.
                // But passing basic props is usually fine if ProductCard handles it. 
                // Let's check ProductCard props. It takes `product`.
                // We'll store enough to render.
                ...currentProduct 
            })
        }
    }, [currentProduct, addItem])

    if (!mounted || items.length === 0) return null
    
    // Filter out current product from display list
    const displayItems = items.filter(i => i.id !== currentProduct?.id)

    if (displayItems.length === 0) return null

    return (
        <section className="py-16 md:py-24 border-t border-border/40 relative overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex items-center justify-between mb-10">
                    <div className="space-y-1">
                        <motion.h2 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-3xl font-black uppercase tracking-tighter italic flex items-center gap-3"
                        >
                            <History className="w-6 h-6 text-muted-foreground" />
                            Recently <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-600">Scouted</span>
                        </motion.h2>
                        <p className="text-sm text-muted-foreground font-medium pl-9">
                            Retrace your steps through the collection
                        </p>
                    </div>

                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clear}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors gap-2 text-xs uppercase font-bold tracking-wider"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear History
                    </Button>
                </div>

                <div className="relative">
                    <ScrollArea className="w-full whitespace-nowrap rounded-3xl pb-4">
                        <div className="flex gap-4 md:gap-6 pb-4" ref={scrollContainerRef}>
                            <AnimatePresence mode='popLayout'>
                                {displayItems.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                        transition={{ delay: index * 0.05 }}
                                        className="w-[280px] md:w-[320px] shrink-0"
                                    >
                                        <ProductCard product={{
                                            ...item,
                                            // Compatibility: Store has 'image', ProductCard expects 'main_image_url' or 'images'
                                            main_image_url: item.image || (item as any).main_image_url
                                        } as any} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        <ScrollBar orientation="horizontal" className="hidden" />
                    </ScrollArea>
                    
                    {/* Gradient Fade Edges */}
                    <div className="absolute top-0 left-0 bottom-0 w-8 md:w-20 bg-linear-to-r from-background to-transparent pointer-events-none z-10" />
                    <div className="absolute top-0 right-0 bottom-0 w-8 md:w-20 bg-linear-to-l from-background to-transparent pointer-events-none z-10" />
                </div>
            </div>
        </section>
    )
}

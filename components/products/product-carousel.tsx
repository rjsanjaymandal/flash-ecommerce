'use client'

import { ProductCard } from '@/components/storefront/product-card'
import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Sparkles } from 'lucide-react'

interface ProductCarouselProps {
  title?: string
  products: any[]
}

export function ProductCarousel({ title = "You Might Also Like", products }: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  if (!products || products.length === 0) return null

  return (
    <section className="py-12 relative overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                    <motion.h2 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic flex items-center gap-3"
                    >
                        <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
                        {/* Split title for styling if needed, or just render */}
                        <span>{title}</span>
                    </motion.h2>
                     <p className="text-sm text-muted-foreground font-medium pl-8 md:pl-9">
                        Curated picks just for you
                    </p>
                </div>
            </div>

            <div className="relative">
                <ScrollArea className="w-full whitespace-nowrap rounded-3xl pb-4">
                    <div className="flex gap-4 md:gap-6 pb-4" ref={scrollContainerRef}>
                         <AnimatePresence mode='popLayout'>
                            {products.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="w-[280px] md:w-[320px] shrink-0"
                                >
                                    <ProductCard product={product} />
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

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ProductCard } from './product-card'
import { BrandGlow } from './brand-glow'
import { BrandBadge } from './brand-badge'

export function FeaturedGrid({ products }: { products: any[] }) {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
        <BrandGlow className="top-0 left-[-10%]" size="lg" />
        
        <div className="flex flex-col items-center text-center gap-4 mb-20 max-w-4xl mx-auto relative">
            <BrandBadge variant="accent">What's Hot</BrandBadge>
            <motion.h2 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-6xl md:text-8xl font-black tracking-tighter text-foreground leading-[0.8] uppercase italic"
            >
                TRENDING <span className="text-gradient drop-shadow-[0_0_30px_rgba(var(--primary),0.3)]">NOW</span>
            </motion.h2>
            <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground text-sm md:text-base font-medium tracking-wide max-w-md mt-2"
            >
                The most coveted pieces from our latest collection.
            </motion.p>
        </div>

        {/* Mobile: Horizontal Scroll | Desktop: Grid */}
        <div className="flex overflow-x-auto snap-x snap-mandatory lg:grid lg:grid-cols-4 gap-8 pt-4 pb-12 lg:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            {products.map((product, index) => (
                <motion.div
                    key={product.id}
                    className="min-w-[280px] w-[80vw] sm:w-[320px] lg:w-auto shrink-0 snap-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                    <ProductCard product={product} priority={index < 2} />
                </motion.div>
            ))}
        </div>
    </section>
  )
}

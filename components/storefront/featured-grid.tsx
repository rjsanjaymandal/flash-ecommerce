'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ProductCard } from './product-card'

export function FeaturedGrid({ products }: { products: any[] }) {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16 px-1">
            <div className="space-y-3">
                <span className="text-primary font-black tracking-[0.4em] uppercase text-[10px]">What's Hot</span>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic uppercase">
                    TRE<span className="text-gradient">NDING</span> NOW
                </h2>
            </div>
            <Link 
                href="/shop" 
                className="group flex items-center gap-3 font-black text-xs tracking-widest uppercase hover:text-primary transition-all pr-1"
            >
                Explore Full Shop 
                <div className="h-8 w-8 rounded-full border border-border group-hover:border-primary group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all duration-300">
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
            </Link>
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

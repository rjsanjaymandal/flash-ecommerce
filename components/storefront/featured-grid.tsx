'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ProductCard } from './product-card'

export function FeaturedGrid({ products }: { products: any[] }) {
  return (
    <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 md:space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div className="space-y-2">
                <span className="text-primary font-bold tracking-widest uppercase text-sm">New Arrivals</span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight">TRENDING NOW</h2>
            </div>
            <Link 
                href="/shop" 
                className="group flex items-center gap-2 font-bold text-sm tracking-widest uppercase hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1"
            >
                View All 
                <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
        </div>

        {/* Mobile: Horizontal Scroll | Desktop: Grid */}
        <div className="flex overflow-x-auto snap-x snap-mandatory lg:grid lg:grid-cols-4 gap-6 pb-8 lg:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            {products.map((product, index) => (
                <motion.div
                    key={product.id}
                    className="min-w-[280px] w-[75vw] sm:w-[350px] lg:w-auto flex-shrink-0 snap-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                    <ProductCard product={product} />
                </motion.div>
            ))}
        </div>
    </section>
  )
}

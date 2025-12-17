'use client'

import { motion } from 'framer-motion'
import { ProductCard } from './product-card'
import { Sparkles } from 'lucide-react'

export function PersonalizedPicks({ products }: { products: any[] }) {
  if (!products?.length) return null

  return (
    <section className="py-24 bg-zinc-900 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full glass border-white/10 text-white animate-bounce-slow">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tailored for You</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-none uppercase italic">
                PICKED <span className="text-gradient">JUST</span> FOR YOU
            </h2>
            <p className="text-white/40 text-sm font-medium tracking-wide max-w-sm">
                Based on your recent activity and style preferences.
            </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.slice(0, 4).map((product, index) => (
                <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                >
                    <ProductCard product={product} />
                </motion.div>
            ))}
        </div>
      </div>
    </section>
  )
}

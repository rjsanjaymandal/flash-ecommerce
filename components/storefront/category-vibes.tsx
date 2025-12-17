'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  image_url: string | null
  slug: string
}

interface CategoryVibesProps {
  categories: Category[]
}

export function CategoryVibes({ categories }: CategoryVibesProps) {
  if (!categories?.length) return null

  return (
    <section className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Dynamic Blobs */}
      <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
           <div className="space-y-3">
              <span className="text-primary font-black tracking-[0.4em] uppercase text-[10px] pl-1">The Collections</span>
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">
                PICK YOUR <span className="text-gradient italic">VIBE</span>
              </h2>
              <p className="text-muted-foreground text-sm font-medium tracking-wide max-w-sm">
                  Curated drops designed to affirm your identity and express your authentic self.
              </p>
           </div>
        </div>

        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto snap-x snap-mandatory pt-4 pb-12 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {categories.map((cat, i) => {
            const gradients = [
                "from-indigo-600/40 to-violet-600/40",
                "from-emerald-500/40 to-teal-400/40",
                "from-amber-400/40 to-orange-600/40",
                "from-rose-500/40 to-pink-500/40"
            ]
            const borderGlow = [
                "group-hover:shadow-indigo-500/20",
                "group-hover:shadow-emerald-500/20",
                "group-hover:shadow-amber-500/20",
                "group-hover:shadow-rose-500/20"
            ]
            const gradient = gradients[i % gradients.length]
            const shadow = borderGlow[i % borderGlow.length]

            return (
              <Link 
                key={cat.id}
                href={`/shop?category=${cat.id}`}
                className={cn(
                  "group relative min-w-[280px] w-[80vw] md:min-w-0 md:w-auto h-[450px] md:h-[550px] overflow-hidden rounded-[2.5rem] bg-zinc-900 transition-all duration-700 snap-center",
                  "flex-shrink-0 border border-white/5",
                  shadow 
                )}
              >
                {/* Background Image / Gradient */}
                <div className={`absolute inset-0 bg-linear-to-br ${gradient} z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-700`} />
                {cat.image_url && (
                    <img 
                        src={cat.image_url} 
                        className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out" 
                        alt={cat.name} 
                    />
                )}
                
                {/* Content Overlay */}
                <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end z-20">
                    <div className="space-y-4 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                        <div className="h-0.5 w-12 bg-white/40 group-hover:w-20 transition-all duration-700" />
                        <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-none capitalize italic">
                            {cat.name}
                        </h3>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                           <span className="text-white text-[10px] uppercase font-black tracking-widest">Shop Collection</span>
                           <ArrowRight className="h-4 w-4 text-white" />
                        </div>
                    </div>
                </div>

                {/* Glassy badge */}
                <div className="absolute top-6 left-6 px-4 py-2 glass rounded-full z-20 border-white/20">
                    <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">{`Drop 0${i + 1}`}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

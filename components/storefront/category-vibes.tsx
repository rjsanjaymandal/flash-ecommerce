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
    <section className="py-8 md:py-12 bg-zinc-50 relative overflow-hidden text-zinc-900">
      {/* Blob Backgrounds */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-200/50 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-200/50 rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-6 md:mb-10">
           <div className="space-y-2">
              <span className="text-primary font-bold tracking-widest uppercase text-sm">Collections {new Date().getFullYear()}</span>
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic">
                Pick Your <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">Vibe</span>
              </h2>
           </div>
        </div>

        {/* 
          MOBILE: Horizontal Scroll / Carousel 
          - Snap to center
          - Peek next slide
          - Hide scrollbar
          - Bolder Cards
        */}
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-8 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {categories.map((cat, i) => {
            const gradients = [
                "from-blue-600 to-violet-600",
                "from-emerald-500 to-teal-600",
                "from-orange-500 to-red-600",
                "from-pink-500 to-rose-600"
            ]
            const gradient = gradients[i % gradients.length]

            return (
              <Link 
                key={cat.id}
                href={`/shop?category=${cat.id}`}
                className={cn(
                  "group relative min-w-[300px] w-[85vw] md:min-w-0 md:w-auto h-[400px] md:h-[500px] overflow-hidden rounded-[2rem] bg-zinc-900 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 snap-center",
                  "flex-shrink-0" 
                )}
              >
                {/* Image / Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80 transition-transform duration-700 group-hover:scale-110`} />
                {cat.image_url && (
                    <img 
                        src={cat.image_url} 
                        className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-all duration-700 mix-blend-overlay" 
                        alt={cat.name} 
                    />
                )}
                
                {/* Content Overlay */}
                <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end">
                    <div className="space-y-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white drop-shadow-lg leading-none">
                            {cat.name}
                        </h3>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                           <div className="h-[2px] w-8 bg-white" />
                           <span className="text-white font-bold tracking-widest text-xs uppercase">Explore</span>
                        </div>
                    </div>
                </div>

                {/* Top Right Icon */}
                <div className="absolute top-6 right-6 h-12 w-12 rounded-full border border-white/20 bg-black/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all duration-300">
                    <ArrowRight className="h-5 w-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

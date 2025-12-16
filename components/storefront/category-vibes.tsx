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
    <section className="py-24 bg-zinc-50 relative overflow-hidden text-zinc-900">
      {/* Blob Backgrounds */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-200/50 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-200/50 rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter">PICK YOUR VIBE</h2>
          <p className="text-xl text-zinc-500 font-medium">Explore collections designed for you.</p>
        </div>

        {/* 
          MOBILE: Horizontal Scroll / Carousel 
          - Snap to center
          - Peek next slide
          - Hide scrollbar
        */}
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-8 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {categories.map((cat, i) => {
            const gradients = [
                "from-red-500 to-pink-600",
                "from-orange-400 to-amber-500",
                "from-green-400 to-emerald-600",
                "from-blue-400 to-indigo-600"
            ]
            const gradient = gradients[i % gradients.length]

            return (
              <Link 
                key={cat.id}
                href={`/shop?category=${cat.id}`}
                className={cn(
                  "group relative min-w-[85vw] md:min-w-0 h-[450px] md:h-[500px] overflow-hidden rounded-[2.5rem] bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 snap-center",
                  "flex-shrink-0" // Ensure they don't shrink in flex container
                )}
              >
                {/* Image / Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 transition-transform duration-700 group-hover:scale-110`} />
                {cat.image_url && (
                    <img 
                        src={cat.image_url} 
                        className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay hover:mix-blend-normal transition-all duration-700" 
                        alt={cat.name} 
                    />
                )}
                
                {/* Content Overlay */}
                <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-between text-white z-10">
                    <div className="flex justify-between items-start">
                        <span className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:bg-white group-hover:text-black transition-colors duration-300">
                            <ArrowRight className="h-6 w-6 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                        </span>
                    </div>
                    
                    <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-3 drop-shadow-lg">
                            {cat.name}
                        </h3>
                        <div className="h-1 w-12 bg-white rounded-full mb-3 opacity-80 group-hover:w-20 transition-all duration-300" />
                        <p className="text-white/90 font-medium text-base tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                            Explore Collection &rarr;
                        </p>
                    </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

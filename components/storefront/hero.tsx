'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative w-full h-screen flex flex-col lg:flex-row bg-background overflow-hidden">
      
      {/* 
        LAYOUT STRATEGY:
        Mobile: Image is Absolute Background. Text overlays it.
        Desktop: Flex Row (Split Screen). Text First -> Image Second.
      */}

      {/* IMAGE SECTION (Background on Mobile, Right Side on Desktop) */}
      <div className="absolute inset-0 z-0 lg:static lg:w-3/5 lg:order-2 lg:h-full">
         <div className="relative w-full h-full">
             <div className="absolute inset-0 bg-black/30 lg:hidden z-10" /> {/* Mobile Overlay */}
             <div className="hidden lg:block absolute inset-0 bg-muted/20 animate-pulse" />
             <img 
                 src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2520&auto=format&fit=crop" 
                 alt="Flash Fashion Model" 
                 className="h-full w-full object-cover object-top"
             />
             {/* Desktop Gradient Overlay */}
             <div className="hidden lg:block absolute inset-0 bg-linear-to-l from-transparent to-background/90" />
         </div>
      </div>

      {/* TEXT SECTION (Overlay on Mobile, Left Side on Desktop) */}
      <div className="relative z-10 w-full h-full lg:w-2/5 flex flex-col justify-center px-6 py-12 lg:bg-background lg:order-1">
         <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-6 lg:space-y-8 max-w-lg mx-auto lg:ml-auto lg:mr-0 lg:pr-12 xl:pr-20"
        >
            <div className="overflow-hidden pt-4 lg:pt-0">
                <motion.h1 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} 
                    className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.9] text-white lg:text-foreground drop-shadow-lg lg:drop-shadow-none"
                >
                    WEAR<br />YOUR<br /><span className="text-transparent bg-clip-text bg-linear-to-r from-white via-stone-200 to-stone-400 lg:from-primary lg:to-purple-600">PRIDE</span>
                </motion.h1>
            </div>

            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="text-lg text-white/90 lg:text-muted-foreground font-medium max-w-sm drop-shadow-md lg:drop-shadow-none"
            >
                Bold, authentic, and unapologetic fashion designed for everyone. Join the movement.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex flex-col sm:flex-row items-center gap-4 pt-4 lg:pt-0"
            >
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 rounded-full text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform bg-white text-black hover:bg-white/90 lg:bg-primary lg:text-primary-foreground lg:hover:bg-primary/90" asChild>
                    <Link href="/shop">
                        Shop Collection
                    </Link>
                </Button>
                <Button size="lg" variant="ghost" className="w-full sm:w-auto h-14 px-8 rounded-full text-lg font-medium group justify-start sm:justify-center text-white hover:text-white hover:bg-white/20 lg:text-foreground lg:hover:text-foreground lg:hover:bg-accent" asChild>
                    <Link href="/about" className="flex items-center gap-2">
                        Our Story
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </Button>
            </motion.div>
        </motion.div>

        {/* Scroll Indicator - Desktop Only */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="hidden lg:flex absolute bottom-8 left-12 xl:left-20 flex-col items-center gap-2 text-muted-foreground"
        >
            <span className="text-xs tracking-[0.2em] font-medium uppercase writing-vertical">Scroll</span>
            <div className="w-px h-12 bg-border relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-foreground/50 animate-slide-down" />
            </div>
        </motion.div>
      </div>
    </section>
  )
}

'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative w-full flex flex-col lg:flex-row bg-background lg:h-screen lg:overflow-hidden">
      
      {/* 
        LAYOUT STRATEGY:
        Mobile: Flex Column (Natural Stacking). Image First -> Text Second. Scrollable.
        Desktop: Flex Row (Split Screen). Text First -> Image Second. Fixed Height (Viewport).
      */}

      {/* TEXT SECTION (Order 2 on Mobile, Order 1 on Desktop) */}
      <div className="w-full lg:w-2/5 flex flex-col justify-center px-6 py-12 order-2 lg:order-1 z-10 bg-background lg:h-full relative">
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
                    className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.9] text-foreground"
                >
                    WEAR<br />YOUR<br /><span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-600">PRIDE</span>
                </motion.h1>
            </div>

            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="text-lg text-muted-foreground font-medium max-w-sm"
            >
                Bold, authentic, and unapologetic fashion designed for everyone. Join the movement.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex flex-col sm:flex-row items-center gap-4 pt-4 lg:pt-0"
            >
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 rounded-full text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform" asChild>
                    <Link href="/shop">
                        Shop Collection
                    </Link>
                </Button>
                <Button size="lg" variant="ghost" className="w-full sm:w-auto h-14 px-8 rounded-full text-lg font-medium group justify-start sm:justify-center" asChild>
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

      {/* IMAGE SECTION (Order 1 on Mobile, Order 2 on Desktop) */}
      <div className="w-full lg:w-3/5 order-1 lg:order-2 relative lg:h-full">
        {/* Mobile: Aspect Ratio Wrapper. Desktop: Fill Height */}
        <div className="relative w-full aspect-4/5 lg:aspect-auto lg:h-full">
            <div className="absolute inset-0 bg-muted/20 animate-pulse" />
            <img 
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2520&auto=format&fit=crop" 
                alt="Flash Fashion Model" 
                className="h-full w-full object-cover object-top"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-black/5 lg:bg-linear-to-l lg:from-transparent lg:to-background/90" />
        </div>
      </div>

    </section>
  )
}

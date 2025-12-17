'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

export function Hero() {
  return (
    <section className="relative w-full h-screen lg:h-[90vh] flex flex-col lg:flex-row bg-background overflow-hidden">
      
      {/* TEXT SECTION */}
      <div className="relative z-20 w-full h-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24">
         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute top-1/2 left-0 w-full h-full -translate-y-1/2 bg-radial-gradient from-primary/5 to-transparent pointer-events-none"
        />
        
         <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8 lg:space-y-10 relative"
        >
            <div className="space-y-4">
                <motion.span 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-[0.3em]"
                >
                    Summer Drop 2024
                </motion.span>
                <div className="overflow-hidden">
                    <motion.h1 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }} 
                        className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter leading-[0.85] text-foreground"
                    >
                        UNLEASH<br />THE<br /><span className="text-gradient">FLASH</span>
                    </motion.h1>
                </div>
            </div>

            <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-lg lg:text-xl text-muted-foreground font-medium max-w-md leading-relaxed"
            >
                Authentic, Bold, and Queermade. High-performance fashion for those who refuse to blend in.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="flex flex-col sm:flex-row items-center gap-4 pt-4"
            >
                <Button size="lg" className="w-full sm:w-auto h-16 px-10 rounded-full text-lg font-black uppercase tracking-widest gradient-primary shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-300" asChild>
                    <Link href="/shop">
                        Shop Now
                    </Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-16 px-10 rounded-full text-lg font-black uppercase tracking-widest border-2 hover:bg-secondary transition-all" asChild>
                    <Link href="/about" className="flex items-center gap-2">
                        Discovery
                    </Link>
                </Button>
            </motion.div>
        </motion.div>

        {/* Floating Badges for visual depth */}
        <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="hidden xl:flex absolute top-[15%] right-[10%] p-4 glass rounded-2xl flex-col gap-1 items-center shadow-2xl rotate-12"
        >
            <span className="text-2xl font-black">100%</span>
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Authentic</span>
        </motion.div>
      </div>

      {/* IMAGE SECTION */}
      <div className="relative w-full h-[60vh] lg:w-1/2 lg:h-full lg:order-2 overflow-hidden">
          <motion.div
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full h-full"
          >
              <Image 
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop" 
                  alt="Premium Fashion" 
                  fill
                  priority
                  className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent lg:bg-linear-to-r" />
          </motion.div>
          
          <div className="absolute bottom-8 right-8 z-20 flex gap-4">
               <div className="p-4 glass rounded-xl backdrop-blur-md">
                   <p className="text-xs font-black uppercase tracking-widest mb-1 opacity-60">Featured Artist</p>
                   <p className="text-sm font-bold">Alex Rivera • 2024</p>
               </div>
          </div>
      </div>
    </section>
  )
}

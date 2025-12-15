'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const SLIDES = [
  {
    id: 1,
    title: "WEAR YOUR SUPERPOWER",
    subtitle: "Bold reds for the fearless.",
    bgClass: "bg-linear-to-br from-red-500 to-rose-600",
    img: "/hero-1.jpg", // Placeholder
    accent: "text-red-500",
    buttonVariant: "default" as const
  },
  {
    id: 2,
    title: "STYLING IS FREEDOM",
    subtitle: "Vibrant orange for the energetic.",
    bgClass: "bg-linear-to-br from-orange-400 to-amber-500",
    img: "/hero-2.jpg",
    accent: "text-orange-500",
    buttonVariant: "secondary" as const
  },
  {
    id: 3,
    title: "FRESH & NATURAL",
    subtitle: "Crisp greens for the grounded.",
    bgClass: "bg-linear-to-br from-green-400 to-emerald-600",
    img: "/hero-3.jpg",
    accent: "text-green-500",
    buttonVariant: "outline" as const
  },
  {
    id: 4,
    title: "COOL & REFINED",
    subtitle: "Deep blues for the calm.",
    bgClass: "bg-linear-to-br from-blue-400 to-indigo-600",
    img: "/hero-4.jpg",
    accent: "text-blue-500",
    buttonVariant: "default" as const
  }
]

export function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [isAuto, setIsAuto] = useState(true)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length)
  }, [])

  const prev = () => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
    setIsAuto(false)
  }

  useEffect(() => {
    if (!isAuto) return
    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [isAuto, next])

  return (
    <section className="relative w-full h-[85vh] sm:h-[90vh] overflow-hidden bg-zinc-950 text-white">
      {/* Slides Container */}
      {SLIDES.map((slide, index) => {
        const isActive = index === current
        return (
            <div 
                key={slide.id}
                className={cn(
                    "absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center justify-center",
                    isActive ? "opacity-100 z-10" : "opacity-0 z-0"
                )}
            >
                {/* Background (Gradient or Image) */}
                <div className={cn("absolute inset-0 opacity-20", slide.bgClass)} />
                <div className="absolute inset-0 bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-zinc-900/0 to-zinc-950/90" />
                
                {/* Content */}
                <div className="relative z-20 text-center space-y-6 px-4 max-w-4xl mx-auto mt-16 sm:mt-0">
                    <div className={cn(
                        "inline-block rounded-full px-4 py-1 text-sm font-bold tracking-widest uppercase border border-white/20 backdrop-blur-md mb-4 bg-white/5",
                        isActive ? "animate-in fade-in slide-in-from-bottom-8 duration-700" : ""
                    )}>
                        New Collection
                    </div>
                    <h1 className={cn(
                        "text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter drop-shadow-2xl leading-[0.9]",
                        isActive ? "animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-100" : ""
                    )}>
                        {slide.title}
                    </h1>
                    <p className={cn(
                        "text-xl sm:text-2xl text-zinc-300 font-medium max-w-2xl mx-auto",
                        isActive ? "animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200" : ""
                    )}>
                        {slide.subtitle}
                    </p>
                    <div className={cn(
                        "pt-8 flex items-center justify-center gap-4",
                        isActive ? "animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300" : ""
                    )}>
                        <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl bg-white text-black hover:bg-zinc-200" asChild>
                            <Link href="/shop">Some Action <ArrowRight className="ml-2 h-5 w-5" /></Link>
                        </Button>
                    </div>
                </div>
            </div>
        )
      })}

      {/* Navigation Arrows */}
      <button 
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full border border-white/10 bg-black/20 hover:bg-black/50 text-white backdrop-blur-md transition-colors hidden sm:block"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>
      <button 
        onClick={() => { next(); setIsAuto(false); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full border border-white/10 bg-black/20 hover:bg-black/50 text-white backdrop-blur-md transition-colors hidden sm:block"
      >
        <ChevronRight className="h-8 w-8" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {SLIDES.map((_, idx) => (
            <button
                key={idx}
                onClick={() => { setCurrent(idx); setIsAuto(false); }}
                className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    current === idx ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                )}
            />
        ))}
      </div>
      
      {/* Decorative 'Pills' from Logo */}
      <div className="absolute top-0 right-0 p-4 sm:p-12 z-0 opacity-30 blur-3xl">
          <div className="w-64 h-64 rounded-full bg-red-500 absolute top-0 right-32 animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="w-64 h-64 rounded-full bg-orange-500 absolute top-12 right-12 animate-pulse" style={{ animationDuration: '5s' }} />
          <div className="w-64 h-64 rounded-full bg-blue-500 absolute top-32 right-32 animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="w-64 h-64 rounded-full bg-green-500 absolute top-24 right-48 animate-pulse" style={{ animationDuration: '7s' }} />
      </div>

    </section>
  )
}

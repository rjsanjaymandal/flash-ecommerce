'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { BrandBadge } from './brand-badge'
import { BrandGlow } from './brand-glow'
import imageLoader from '@/lib/image-loader'
import { ChevronLeft, ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/store/use-cart-store'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useRealTimeStock } from '@/hooks/use-real-time-stock'

interface HeroProduct {
    id: string
    name: string
    description: string
    price: number
    main_image_url: string | null
    slug: string
    product_stock?: any[]
}

interface HeroCarouselProps {
    products: HeroProduct[]
}

import { QuickAddDialog } from '@/components/products/quick-add-dialog'

// Internal Progress Ring Component
function ProgressRing({ radius, stroke, progress }: { radius: number, stroke: number, progress: number }) {
    const normalizedRadius = radius - stroke * 2
    const circumference = normalizedRadius * 2 * Math.PI
    const strokeDashoffset = circumference - (progress / 100) * circumference
  
    return (
      <div className="relative flex items-center justify-center">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="rotate-[-90deg]"
        >
          <circle
            stroke="white"
            strokeOpacity="0.2"
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <motion.circle
            stroke="white"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
      </div>
    )
}

export function HeroCarousel({ products }: HeroCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)
    const [progress, setProgress] = useState(0)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const containerRef = useRef<HTMLElement>(null)
    const router = useRouter()
    
    // 3D Tilt Values
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const rotateX = useTransform(y, [-0.5, 0.5], [5, -5]) // Reversed for natural tilt
    const rotateY = useTransform(x, [-0.5, 0.5], [-5, 5])
    
    // Quick Add State
    const [quickAddProduct, setQuickAddProduct] = useState<HeroProduct | null>(null)
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)

    // Mouse Parallax & Tilt Logic
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return
        const { left, top, width, height } = containerRef.current.getBoundingClientRect()
        const posX = (e.clientX - left) / width - 0.5
        const posY = (e.clientY - top) / height - 0.5
        setMousePosition({ x: posX, y: posY })
        x.set(posX)
        y.set(posY)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
        setMousePosition({ x: 0, y: 0 })
    }

    // Auto-scroll with Progress
    useEffect(() => {
        if (isQuickAddOpen) return 
        
        const duration = 6000
        const interval = 50 // Update every 50ms for smooth progress
        let elapsed = 0

        const timer = setInterval(() => {
            elapsed += interval
            const p = (elapsed / duration) * 100
            setProgress(p)

            if (elapsed >= duration) {
                handleNext()
                elapsed = 0
            }
        }, interval)

        return () => clearInterval(timer)
    }, [currentIndex, isQuickAddOpen])

    // Reset progress on slide change
    useEffect(() => {
        setProgress(0)
    }, [currentIndex])

    const handleNext = () => {
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % products.length)
    }

    const handlePrev = () => {
        setDirection(-1)
        setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)
    }

    // Swipe Handling
    const SWIPE_THRESHOLD = 50
    const handleDragEnd = (event: any, info: PanInfo) => {
        if (info.offset.x < -SWIPE_THRESHOLD) {
            handleNext()
        } else if (info.offset.x > SWIPE_THRESHOLD) {
            handlePrev()
        }
    }

    if (!products || products.length === 0) return null

    const currentProduct = products[currentIndex]
    if (!currentProduct) return null

    const handleBuyNow = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setQuickAddProduct(currentProduct)
        setIsQuickAddOpen(true)
    }

    // Helper to strip HTML tags
    const stripHtml = (html: string) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }

    // SSR Safe Strip
    const cleanDescription = (desc: string) => {
        if (typeof window === 'undefined') return desc.replace(/<[^>]*>?/gm, '')
        return stripHtml(desc)
    }

    if (!products || products.length === 0) return null

    return (
        <section 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full h-[85vh] lg:h-[90vh] bg-background overflow-hidden group perspective-1000 cursor-grab active:cursor-grabbing"
        >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    initial={{ x: direction > 0 ? '100%' : '-100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: direction > 0 ? '-100%' : '100%', opacity: 0 }}
                    transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={handleDragEnd}
                    className="absolute inset-0 flex flex-col lg:flex-row touch-pan-y"
                >
                     {/* TEXT SECTION - with Parallax */}
                    <div className="relative z-20 w-full lg:w-[45%] h-full flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-20 bg-transparent lg:bg-none pointer-events-none lg:pointer-events-auto">
                         <BrandGlow className="top-1/2 left-0 -translate-y-1/2 opacity-60" />
                        
                         <motion.div 
                            className="space-y-4 lg:space-y-6 relative max-w-xl pointer-events-auto mt-20 lg:mt-0"
                            animate={{ 
                                x: mousePosition.x * 30, 
                                y: mousePosition.y * 30 
                            }}
                            transition={{ type: "spring", stiffness: 75, damping: 15 }}
                         >
                            <motion.div 
                                initial={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                            >
                                <BrandBadge variant="primary" className="mb-4">
                                    {currentIndex === 0 ? (
                                        <span className="animate-pulse">✨ JUST DROPPED</span>
                                    ) : (
                                        "New Arrival"
                                    )}
                                </BrandBadge>
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter leading-[0.9] text-foreground uppercase italic line-clamp-2 lg:line-clamp-3 drop-shadow-lg lg:drop-shadow-none">
                                    {currentProduct.name}
                                </h1>
                            </motion.div>

                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                className="text-base sm:text-lg text-muted-foreground font-medium line-clamp-2 leading-relaxed"
                            >
                                {cleanDescription(currentProduct.description)}
                            </motion.p>
                            
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="flex items-baseline gap-4"
                            >
                                <span className="text-3xl lg:text-5xl font-black text-primary drop-shadow-md">
                                    {formatCurrency(currentProduct.price)}
                                </span>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, type: "spring", bounce: 0.4 }}
                                className="flex flex-row items-center gap-3 pt-4"
                            >
                                <Button 
                                    size="lg" 
                                    className="flex-1 sm:flex-none h-14 sm:h-16 px-6 sm:px-10 rounded-2xl text-base sm:text-lg font-black uppercase tracking-widest gradient-primary shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group/btn" 
                                    onClick={handleBuyNow}
                                >
                                     <span className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                                     <ShoppingBag className="mr-2 sm:mr-3 h-5 w-5" />
                                    Buy Now
                                </Button>
                                <Button size="lg" variant="outline" className="flex-1 sm:flex-none h-14 sm:h-16 px-6 sm:px-10 rounded-2xl text-base sm:text-lg font-black uppercase tracking-widest border-2 hover:bg-secondary transition-all bg-background/50 backdrop-blur-md" asChild>
                                    <Link href={`/product/${currentProduct.slug}`} className="flex items-center justify-center gap-2">
                                        Details <ArrowRight className="h-5 w-5" />
                                    </Link>
                                </Button>
                            </motion.div>
                         </motion.div>
                    </div>

                    {/* IMAGE SECTION - with Ken Burns Effect AND 3D Tilt */}
                    <motion.div 
                        className="absolute inset-0 lg:relative w-full lg:w-[55%] h-full overflow-hidden z-0"
                        style={{ rotateX, rotateY, perspective: 1000 }}
                    >
                         {currentProduct.main_image_url ? (
                            <motion.div
                                className="w-full h-full relative"
                                initial={{ scale: 1.1, opacity: 0.8 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 6, ease: "linear" }}
                            >
                                <Image 
                                    loader={imageLoader}
                                    src={currentProduct.main_image_url} 
                                    alt={currentProduct.name} 
                                    fill
                                    priority={currentIndex === 0}
                                    quality={100}
                                    className="object-cover lg:object-contain object-center" 
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 55vw"
                                />
                            </motion.div>
                         ) : (
                             <div className="w-full h-full bg-muted flex items-center justify-center">
                                 <span className="text-4xl font-black opacity-20 uppercase">No Image</span>
                             </div>
                         )}
                        {/* Overlay Gradient for Text Readability on Mobile, Fades out on Desktop */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent lg:hidden" />
                        <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent opacity-80" />
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            {/* Mobile Progress Bar (Bottom) */}
            <div className="lg:hidden absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-50">
                 <motion.div 
                    className="h-full bg-primary"
                    style={{ width: `${progress}%` }}
                 />
            </div>

            {/* THUMBNAIL NAVIGATION (Desktop) - with Progress Ring */}
            <div className="hidden lg:flex absolute bottom-12 right-12 z-40 gap-4">
                 {products.map((p, idx) => (
                    <button
                        key={p.id}
                        onClick={() => {
                            setDirection(idx > currentIndex ? 1 : -1)
                            setCurrentIndex(idx)
                        }}
                        className={cn(
                            "relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 group/thumb",
                            idx === currentIndex ? "border-primary shadow-lg shadow-primary/40 scale-110" : "border-white/20 opacity-70 hover:opacity-100"
                        )}
                    >
                         {/* Progress Overlay for Active Item */}
                         {idx === currentIndex && (
                             <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                                 <ProgressRing radius={28} stroke={3} progress={progress} />
                             </div>
                         )}

                         {p.main_image_url && (
                             <Image 
                                loader={imageLoader}
                                src={p.main_image_url}
                                alt={p.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover/thumb:scale-110"
                                sizes="64px"
                             />
                         )}
                    </button>
                 ))}
            </div>

            {/* Mobile Dots (Optional - can disable if using progress bar, but kept for direct nav) */}
            <div className="lg:hidden absolute bottom-6 w-full flex justify-center gap-2 z-40">
                {products.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setDirection(idx > currentIndex ? 1 : -1)
                            setCurrentIndex(idx)
                        }}
                        className={cn(
                            "h-2 rounded-full transition-all duration-300 backdrop-blur-md",
                            idx === currentIndex ? "bg-primary w-8" : "bg-white/40 w-2"
                        )}
                    />
                ))}
            </div>

            {/* Navigation Arrows (Desktop Hover) */}
            <div className="hidden lg:flex absolute bottom-12 left-1/2 -translate-x-1/2 gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button size="icon" variant="outline" className="rounded-full h-12 w-12 border-2 bg-background/50 backdrop-blur-md hover:bg-background" onClick={handlePrev}>
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button size="icon" variant="outline" className="rounded-full h-12 w-12 border-2 bg-background/50 backdrop-blur-md hover:bg-background" onClick={handleNext}>
                    <ChevronRight className="h-6 w-6" />
                </Button>
            </div>

             {/* Quick Add Dialog */}
             {quickAddProduct && (
                <QuickAddDialog 
                    product={quickAddProduct}
                    open={isQuickAddOpen}
                    onOpenChange={setIsQuickAddOpen}
                    buyNowMode={true}
                />
            )}
        </section>
    )
}

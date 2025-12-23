'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

export function HeroCarousel({ products }: HeroCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)
    const router = useRouter()
    
    // Quick Add State
    const [quickAddProduct, setQuickAddProduct] = useState<HeroProduct | null>(null)
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)

    // Auto-scroll
    useEffect(() => {
        if (isQuickAddOpen) return 
        const timer = setInterval(() => {
            handleNext()
        }, 6000)
        return () => clearInterval(timer)
    }, [currentIndex, isQuickAddOpen])

    const handleNext = () => {
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % products.length)
    }

    const handlePrev = () => {
        setDirection(-1)
        setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)
    }

    const currentProduct = products[currentIndex]

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

    // SSR Safe Strip (Simple Regex fallback if document undefined)
    const cleanDescription = (desc: string) => {
        if (typeof window === 'undefined') return desc.replace(/<[^>]*>?/gm, '')
        return stripHtml(desc)
    }

    if (!products || products.length === 0) return null

    return (
        <section className="relative w-full h-[85vh] lg:h-[90vh] bg-background overflow-hidden group">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    initial={{ x: direction > 0 ? '100%' : '-100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: direction > 0 ? '-100%' : '100%', opacity: 0 }}
                    transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                    className="absolute inset-0 flex flex-col lg:flex-row"
                >
                     {/* TEXT SECTION */}
                    <div className="relative z-20 w-full lg:w-[45%] h-full flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-20 bg-linear-to-b from-background/90 via-background/70 to-background/90 lg:bg-none backdrop-blur-sm lg:backdrop-blur-none pointer-events-none lg:pointer-events-auto">
                         <BrandGlow className="top-1/2 left-0 -translate-y-1/2 opacity-60" />
                        
                         <div className="space-y-4 lg:space-y-6 relative max-w-xl pointer-events-auto mt-20 lg:mt-0">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <BrandBadge variant="primary" className="mb-4">
                                    New Arrival
                                </BrandBadge>
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter leading-[0.9] text-foreground uppercase italic line-clamp-2 lg:line-clamp-3 drop-shadow-lg lg:drop-shadow-none">
                                    {currentProduct.name}
                                </h1>
                            </motion.div>

                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-base sm:text-lg text-muted-foreground font-medium line-clamp-2 leading-relaxed"
                            >
                                {cleanDescription(currentProduct.description)}
                            </motion.p>
                            
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-baseline gap-4"
                            >
                                <span className="text-3xl lg:text-5xl font-black text-primary drop-shadow-md">
                                    {formatCurrency(currentProduct.price)}
                                </span>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="flex flex-row items-center gap-3 pt-2"
                            >
                                <Button 
                                    size="lg" 
                                    className="flex-1 sm:flex-none h-14 sm:h-16 px-6 sm:px-10 rounded-2xl text-base sm:text-lg font-black uppercase tracking-widest gradient-primary shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-300" 
                                    onClick={handleBuyNow}
                                >
                                     <ShoppingBag className="mr-2 sm:mr-3 h-5 w-5" />
                                    Buy Now
                                </Button>
                                <Button size="lg" variant="outline" className="flex-1 sm:flex-none h-14 sm:h-16 px-6 sm:px-10 rounded-2xl text-base sm:text-lg font-black uppercase tracking-widest border-2 hover:bg-secondary transition-all bg-background/50 backdrop-blur-md" asChild>
                                    <Link href={`/product/${currentProduct.slug}`} className="flex items-center justify-center gap-2">
                                        Details <ArrowRight className="h-5 w-5" />
                                    </Link>
                                </Button>
                            </motion.div>
                         </div>
                    </div>

                    {/* IMAGE SECTION */}
                    <div className="absolute inset-0 lg:static w-full lg:w-[55%] h-full overflow-hidden -z-10 lg:z-0">
                         {currentProduct.main_image_url ? (
                            <Image 
                                loader={imageLoader}
                                src={currentProduct.main_image_url} 
                                alt={currentProduct.name} 
                                fill
                                priority
                                className="object-cover lg:object-contain lg:scale-110 object-center transition-transform duration-700" 
                                sizes="(max-width: 1024px) 100vw, 60vw"
                            />
                         ) : (
                             <div className="w-full h-full bg-muted flex items-center justify-center">
                                 <span className="text-4xl font-black opacity-20 uppercase">No Image</span>
                             </div>
                         )}
                        {/* Overlay Gradient for Text Readability on Mobile, Fades out on Desktop */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent lg:hidden" />
                        <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent opacity-80" />
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* THUMBNAIL NAVIGATION (Desktop) */}
            <div className="hidden lg:flex absolute bottom-12 right-12 z-40 gap-4">
                 {products.map((p, idx) => (
                    <button
                        key={p.id}
                        onClick={() => {
                            setDirection(idx > currentIndex ? 1 : -1)
                            setCurrentIndex(idx)
                        }}
                        className={cn(
                            "relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-105",
                            idx === currentIndex ? "border-primary shadow-lg shadow-primary/40 scale-110" : "border-white/20 opacity-70 hover:opacity-100"
                        )}
                    >
                         {p.main_image_url && (
                             <Image 
                                loader={imageLoader}
                                src={p.main_image_url}
                                alt={p.name}
                                fill
                                className="object-cover"
                             />
                         )}
                    </button>
                 ))}
            </div>

            {/* Mobile Dots */}
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

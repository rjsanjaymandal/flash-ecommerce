'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import FlashImage from '@/components/ui/flash-image'

interface ProductGalleryProps {
    images: string[]
    name: string
    mainImage: string
}

export function ProductGallery({ images, name, mainImage }: ProductGalleryProps) {
    const [activeImage, setActiveImage] = useState(mainImage)

    // Ensure mainImage is in the list if not already
    const allImages = Array.from(new Set([mainImage, ...images])).filter(Boolean)

    return (
        <div className="relative">
            {/* Desktop: Mosaic Grid */}
            <div className="hidden lg:grid grid-cols-12 gap-4 lg:sticky lg:top-28">
                {/* Thumbnails Column */}
                <div className="col-span-2 flex flex-col gap-3 h-[600px] overflow-y-auto pr-1 scrollbar-hide">
                    {allImages.map((img, i) => (
                        <button 
                            key={i} 
                            onClick={() => setActiveImage(img)}
                            className={cn(
                                "aspect-[3/4] rounded-lg overflow-hidden border transition-all duration-300 relative group",
                                activeImage === img 
                                    ? "ring-2 ring-primary border-transparent opacity-100 scale-100" 
                                    : "border-transparent opacity-60 hover:opacity-100 scale-95 hover:scale-100"
                            )}
                        >
                            <div className="relative w-full h-full">
                                <FlashImage 
                                    src={img} 
                                    alt={`View ${i + 1}`} 
                                    fill
                                    className="object-cover" 
                                    sizes="100px"
                                />
                            </div>
                            {activeImage === img && <div className="absolute inset-0 bg-primary/10" />}
                        </button>
                    ))}
                </div>

                {/* Main Image */}
                <div className="col-span-10">
                    <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-muted/20 border border-border/50 shadow-sm relative group cursor-zoom-in">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeImage}
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="h-full w-full relative"
                            >
                                <FlashImage
                                    src={activeImage}
                                    alt={name}
                                    fill
                                    priority
                                    className="object-cover transition-all duration-500 scale-100 group-hover:scale-105"
                                    sizes="(max-width: 1024px) 100vw, 600px"
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Mobile: Swipeable Carousel */}
            <div className="lg:hidden -mx-4 sm:mx-0">
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-2 px-4 sm:px-0 pb-6">
                    {allImages.map((img, i) => (
                        <div key={i} className="snap-center shrink-0 w-[85vw] sm:w-[400px] aspect-[3/4] rounded-2xl overflow-hidden bg-muted/20 border border-border/50 relative shadow-sm">
                             <FlashImage
                                src={img}
                                alt={`${name} view ${i + 1}`}
                                fill
                                className="object-cover"
                                priority={i === 0}
                                sizes="(max-width: 640px) 85vw, 400px"
                            />
                             <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] px-3 py-1.5 rounded-full backdrop-blur-md font-black tracking-widest border border-white/10">
                                 {i + 1} / {allImages.length}
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

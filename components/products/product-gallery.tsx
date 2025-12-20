'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

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
            <div className="lg:sticky lg:top-24 space-y-4">
                <div className="aspect-3/4 lg:aspect-4/5 w-full overflow-hidden rounded-md bg-muted/20 border border-border/50 shadow-sm relative group">
                    <AnimatePresence mode="wait">
                        <motion.img 
                            key={activeImage}
                            src={activeImage} 
                            alt={name} 
                            initial={{ opacity: 0.8 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0.8 }}
                            transition={{ duration: 0.3 }}
                            className="h-full w-full object-cover" 
                        />
                    </AnimatePresence>
                    {/* Zoom/Interactive Hint can go here */}
                </div>
                
                {/* Thumbnails */}
                {allImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                        {allImages.map((img, i) => (
                            <button 
                                key={i} 
                                onClick={() => setActiveImage(img)}
                                className={cn(
                                    "aspect-square bg-muted/20 rounded-md border overflow-hidden transition-all",
                                    activeImage === img ? "ring-2 ring-primary border-transparent" : "border-border/50 hover:border-primary/50"
                                )}
                            >
                                <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

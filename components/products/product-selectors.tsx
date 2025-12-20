'use client'

import { cn } from "@/lib/utils"
import { Flame } from "lucide-react"

interface ProductSelectorsProps {
    sizeOptions: string[]
    colorOptions: string[]
    selectedSize: string
    selectedColor: string
    onSelectSize: (size: string) => void
    onSelectColor: (color: string) => void
    isAvailable: (size: string, color: string) => boolean
    isSizeAvailable: (size: string) => boolean
    getStock: (size: string, color: string) => number
}

export function ProductSelectors({
    sizeOptions,
    colorOptions,
    selectedSize,
    selectedColor,
    onSelectSize,
    onSelectColor,
    isAvailable,
    isSizeAvailable,
    getStock
}: ProductSelectorsProps) {
    
    // Urgency Logic
    const currentStock = getStock(selectedSize, selectedColor)
    const showUrgency = selectedSize && selectedColor && currentStock > 0 && currentStock < 5

    return (
        <div className="space-y-10 mb-10">
            {/* Size Selector */}
            <div className="space-y-6">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em]">
                    <span className="text-primary italic">Select Size</span>
                    <button className="underline hover:text-primary transition-colors opacity-60">Size Guide</button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {sizeOptions.map((size) => {
                        const available = isSizeAvailable(size)
                        const isSelected = selectedSize === size
                        
                        return (
                            <button
                                key={size}
                                onClick={() => onSelectSize(size)}
                                className={cn(
                                    "h-14 w-full rounded-2xl border transition-all duration-300 text-sm font-black uppercase relative overflow-hidden",
                                    isSelected
                                        ? "border-primary bg-primary text-white shadow-xl shadow-primary/20 scale-105" 
                                        : "border-border hover:border-primary/50 hover:bg-primary/5",
                                    !available && "opacity-30 cursor-not-allowed grayscale"
                                )}
                            >
                                {size}
                                {!available && <div className="absolute inset-0 flex items-center justify-center opacity-20"><div className="w-full h-px bg-current rotate-45" /></div>}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Color Selector */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Select Color</span>
                    {showUrgency && (
                        <div className="flex items-center gap-1.5 text-amber-500 animate-pulse">
                            <Flame className="h-3.5 w-3.5 fill-current" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Only {currentStock} Left!</span>
                        </div>
                    )}
                </div>
                
                <div className="flex flex-wrap gap-3">
                    {colorOptions.map((color) => {
                        const available = selectedSize 
                            ? isAvailable(selectedSize, color)
                            : true // If no size selected, show all colors as potentially available (or check if color exists in any size)

                        const isSelected = selectedColor === color

                        return (
                            <button
                                key={color}
                                disabled={!!(selectedSize && !available)}
                                onClick={() => onSelectColor(color)}
                                className={cn(
                                    "h-12 px-8 rounded-2xl border transition-all duration-300 text-[10px] font-black uppercase tracking-widest relative overflow-hidden",
                                    isSelected 
                                        ? "border-primary bg-primary text-white shadow-xl shadow-primary/20 scale-105" 
                                        : "border-border hover:border-primary/50 hover:bg-primary/5",
                                    (selectedSize && !available) && "opacity-30 cursor-not-allowed grayscale"
                                )}
                            >
                                {color}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

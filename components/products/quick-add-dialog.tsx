'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/use-cart-store'
import { toast } from 'sonner'
import { cn, formatCurrency } from '@/lib/utils'
import { useRealTimeStock } from '@/hooks/use-real-time-stock'
import { Check, ShoppingBag } from 'lucide-react'

interface QuickAddDialogProps {
    product: any
    open: boolean
    onOpenChange: (open: boolean) => void
    buyNowMode?: boolean
}

import { useRouter } from 'next/navigation'

export function QuickAddDialog({ product, open, onOpenChange, buyNowMode = false }: QuickAddDialogProps) {
    const router = useRouter()
    const addItem = useCartStore((state) => state.addItem)
    const { stock } = useRealTimeStock(product.id, product.product_stock || [])
    
    // Determine available sizes based on real-time stock
    const availableSizes = Array.from(new Set(stock.filter((s: any) => s.quantity > 0).map((s: any) => s.size)))
    const allSizes = product.size_options && product.size_options.length > 0 
        ? product.size_options 
        : ['XS', 'S', 'M', 'L', 'XL', 'XXL']

    const [selectedSize, setSelectedSize] = useState<string>('')
    

    // Update color when size changes if current color is invalid for new size
    const availableColorsForSize = Array.from(new Set(stock.filter((s: any) => (!selectedSize || s.size === selectedSize) && s.quantity > 0).map((s: any) => s.color)))
    
    // State for color
    const [selectedColor, setSelectedColor] = useState<string>('')

    // Initialize/Reset color when size changes
    // If only 1 color available, auto-select it? Or let user pick?
    // Behavior: Users prefer explicit choice unless it's "Standard".
    
    const handleAddToCart = () => {
         if (!selectedSize) {
            toast.error("Please select a size")
            return
        }
        
        // Use selected color or fallback if not selected (should enforce selection for multi-color)
        const finalColor = selectedColor || availableColorsForSize[0] || 'Standard'

        if (!finalColor && product.color_options?.length > 1) {
             toast.error("Please select a color")
             return
        }

        const stockItem = stock.find((item: any) => item.size === selectedSize && item.color === finalColor)
        const maxQuantity = stockItem?.quantity || 0

        if (maxQuantity === 0) {
            toast.error("Selected option is out of stock")
            return
        }

        addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.main_image_url,
            size: selectedSize,
            color: finalColor,
            quantity: 1,
            maxQuantity: maxQuantity
        })
        
        if (buyNowMode) {
             router.push('/checkout')
        } else {
             onOpenChange(false)
        }
        
        setSelectedSize('')
        setSelectedColor('')
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span className="truncate pr-4">{product.name}</span>
                        <span className="font-medium text-muted-foreground text-sm">{formatCurrency(product.price)}</span>
                    </DialogTitle>
                    <DialogDescription>
                        Select your options to add to cart
                    </DialogDescription>
                </DialogHeader>
                
                <div className="py-4 space-y-6">
                    {/* Size Selection */}
                    <div className="space-y-3">
                        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Select Size</div>
                        <div className="grid grid-cols-3 gap-3">
                            {allSizes.map((size: string) => {
                                const isAvailable = stock.some((s: any) => s.size === size && s.quantity > 0)
                                const isSelected = selectedSize === size

                                return (
                                    <button
                                        key={size}
                                        disabled={!isAvailable}
                                        onClick={() => {
                                            setSelectedSize(size)
                                            setSelectedColor('') // Reset color on size change
                                        }}
                                        className={cn(
                                            "h-12 rounded-xl border text-sm font-bold transition-all relative overflow-hidden",
                                            isSelected 
                                                ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]" 
                                                : "border-input hover:bg-muted/50 text-foreground",
                                            !isAvailable && "opacity-40 cursor-not-allowed bg-muted/20"
                                        )}
                                    >
                                        {size}
                                        {!isAvailable && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-full h-px bg-current -rotate-45 opacity-50" />
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Color Selection (Only if colors exist and vary) */}
                    {(product.color_options?.length > 0 || availableColorsForSize.length > 1) && (
                        <div className="space-y-3">
                            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Select Color</div>
                            <div className="flex flex-wrap gap-2">
                                {Array.from(new Set([...(product.color_options || []), ...availableColorsForSize])).map((color: string) => {
                                    // Check if this color is valid for the selected size (if size selected)
                                    // If no size selected, check if color exists in ANY stock
                                    const isValidForSize = !selectedSize || stock.some((s: any) => s.size === selectedSize && s.color === color && s.quantity > 0)
                                    const isSelected = selectedColor === color

                                    if (color === 'Standard') return null

                                    return (
                                        <button
                                            key={color}
                                            disabled={!isValidForSize}
                                            onClick={() => setSelectedColor(color)}
                                            className={cn(
                                                "h-10 px-4 min-w-[3rem] rounded-lg border text-sm font-medium transition-all relative",
                                                isSelected 
                                                    ? "border-primary bg-primary text-primary-foreground shadow-md" 
                                                    : "border-input hover:bg-muted/50",
                                                !isValidForSize && "opacity-40 cursor-not-allowed"
                                            )}
                                        >
                                            {color}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <Button 
                        size="lg" 
                        className="w-full h-12 rounded-xl font-bold uppercase tracking-widest" 
                        onClick={handleAddToCart}
                        disabled={!selectedSize || (product.color_options?.length > 1 && !selectedColor && availableColorsForSize.length > 1)}
                    >
                         {buyNowMode ? 'Proceed to Checkout' : 'Add to Cart'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

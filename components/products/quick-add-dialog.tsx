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
}

export function QuickAddDialog({ product, open, onOpenChange }: QuickAddDialogProps) {
    const addItem = useCartStore((state) => state.addItem)
    const { stock } = useRealTimeStock(product.id, product.product_stock || [])
    
    // Determine available sizes based on real-time stock
    const availableSizes = Array.from(new Set(stock.filter((s: any) => s.quantity > 0).map((s: any) => s.size)))
    const allSizes = product.size_options && product.size_options.length > 0 
        ? product.size_options 
        : ['XS', 'S', 'M', 'L', 'XL', 'XXL']

    const [selectedSize, setSelectedSize] = useState<string>('')
    
    // Auto-select color (usually standard or first available)
    const availableColors = Array.from(new Set(stock.filter((s: any) => (!selectedSize || s.size === selectedSize) && s.quantity > 0).map((s: any) => s.color)))
    const selectedColor = product.color_options?.[0] || availableColors[0] || 'Standard'

    const handleAddToCart = () => {
         if (!selectedSize) {
            toast.error("Please select a size")
            return
        }

        const stockItem = stock.find((item: any) => item.size === selectedSize && item.color === selectedColor)
        const maxQuantity = stockItem?.quantity || 0

        if (maxQuantity === 0) {
            toast.error("Selected size is out of stock")
            return
        }

        addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.main_image_url,
            size: selectedSize,
            color: selectedColor,
            quantity: 1,
            maxQuantity: maxQuantity
        })
        // toast.success("Added to Cart") -> Handled by store
        onOpenChange(false)
        setSelectedSize('')
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
                        Select your size to add to cart
                    </DialogDescription>
                </DialogHeader>
                
                <div className="py-4 space-y-6">
                    <div className="grid grid-cols-3 gap-3">
                        {allSizes.map((size: string) => {
                            const isAvailable = stock.some((s: any) => s.size === size && s.quantity > 0)
                            const isSelected = selectedSize === size

                            return (
                                <button
                                    key={size}
                                    disabled={!isAvailable}
                                    onClick={() => setSelectedSize(size)}
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

                    <Button 
                        size="lg" 
                        className="w-full h-12 rounded-xl font-bold uppercase tracking-widest" 
                        onClick={handleAddToCart}
                        disabled={!selectedSize}
                    >
                        <ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

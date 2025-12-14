'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/cart-context'
import { cn, formatCurrency } from "@/lib/utils"

export function ProductDetailClient({ product }: { product: any }) {
  const { addItem } = useCart()
  const stock = product.product_stock || []
  
  // Selection State
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  
  // Available options logic
  const availableSizes = Array.from(new Set(stock.map((s: any) => s.size)))
  const availableColors = Array.from(new Set(stock.filter((s: any) => s.size === selectedSize).map((s: any) => s.color))) 

  const currentStockItem = stock.find((s: any) => s.size === selectedSize && s.color === selectedColor)
  const maxQty = currentStockItem?.quantity || 0

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return
    addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.main_image_url,
        size: selectedSize,
        color: selectedColor,
        quantity: 1,
        maxQuantity: maxQty
    })
  }

  return (
    <div className="min-h-screen pt-24 pb-12 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
                <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted border border-border">
                     {product.main_image_url ? (
                        <img src={product.main_image_url} alt={product.name} className="h-full w-full object-cover" />
                     ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">No Image</div>
                     )}
                </div>
            </div>

            {/* Product Info */}
            <div className="space-y-8 sticky top-24 h-fit">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">{product.name}</h1>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(product.price)}</p>
                </div>

                <div className="prose prose-sm text-muted-foreground">
                    <p>{product.description}</p>
                </div>

                {/* Selectors */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Size</label>
                        <div className="flex flex-wrap gap-2">
                            {product.size_options?.map((size: string) => {
                                // Check if this size exists in stock at all
                                const hasStock = stock.some((s: any) => s.size === size && s.quantity > 0)
                                return (
                                    <button
                                        key={size}
                                        disabled={!hasStock}
                                        onClick={() => { setSelectedSize(size); setSelectedColor('') }} // Reset color on size change
                                        className={cn(
                                            "min-w-12 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                                            selectedSize === size 
                                                ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                                                : "border-input bg-background hover:bg-muted",
                                            !hasStock && "opacity-50 cursor-not-allowed box-decoration-slice line-through"
                                        )}
                                    >
                                        {size}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Color</label>
                        <div className="flex flex-wrap gap-2">
                            {product.color_options?.map((color: string) => {
                                 // Check availability for selected size if chosen, else general availability
                                 const hasStockForSize = selectedSize 
                                    ? stock.some((s: any) => s.size === selectedSize && s.color === color && s.quantity > 0)
                                    : stock.some((s: any) => s.color === color && s.quantity > 0)

                                return (
                                    <button
                                        key={color}
                                        disabled={!selectedSize || !hasStockForSize}
                                        onClick={() => setSelectedColor(color)}
                                        className={cn(
                                            "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                                            selectedColor === color 
                                                ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                                                : "border-input bg-background hover:bg-muted",
                                             (!selectedSize || !hasStockForSize) && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        {color}
                                    </button>
                                )
                            })}
                        </div>
                         {!selectedSize && <p className="text-xs text-muted-foreground">Select a size first</p>}
                    </div>
                </div>

                <div className="pt-6 border-t border-border">
                    <Button 
                        size="lg" 
                        className="w-full h-14 text-lg bg-linear-to-r from-primary to-accent" 
                        disabled={!selectedSize || !selectedColor || maxQty === 0}
                        onClick={handleAddToCart}
                    >
                        {maxQty === 0 ? 'Out of Stock' : 'Add to Bag'}
                    </Button>
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                        Free shipping on orders over {formatCurrency(100)} • 30-day returns
                    </p>
                </div>
            </div>
        </div>
    </div>
  )
}

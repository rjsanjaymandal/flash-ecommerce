'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/cart-context'
import { useWishlist } from '@/context/wishlist-context'
import { cn, formatCurrency } from "@/lib/utils"
import { Star, Truck, RefreshCcw, ShieldCheck, ChevronDown, Plus, Minus, Heart } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// Types
type StockItem = {
    size: string
    color: string
    quantity: number
}

type ProductDetailProps = {
    product: {
        id: string
        name: string
        description: string
        price: number
        main_image_url: string
        size_options: string[]
        color_options: string[]
        product_stock: StockItem[]
    }
}

export function ProductDetailClient({ product }: ProductDetailProps) {
  const { addItem: addToCart } = useCart() // Rename to avoid conflict
  const { addItem, removeItem, isInWishlist } = useWishlist()
  const isWishlisted = isInWishlist(product.id)
  
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)

  // Fallback Standards
  const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL']
  
  // Logic to determine what options to show
  // If DB has explicit options, use them. 
  // If not, try to infer from stock.
  // If stock is also empty/partial, use STANDARD_SIZES as a last resort so the UI isn't empty.
  const sizeOptions = product.size_options?.length 
      ? product.size_options 
      : (product.product_stock?.length ? Array.from(new Set(product.product_stock.map((s: any) => s.size))).sort() : STANDARD_SIZES)

  const colorOptions = product.color_options?.length 
      ? product.color_options 
      : Array.from(new Set(product.product_stock?.map((s: any) => s.color) || ['Standard'])).sort() as string[]

  // --- DSA OPTIMIZATION: Check Stock O(1) ---
  const stockMap = useMemo(() => {
      const map: Record<string, number> = {}
      if (!product.product_stock) return map
      
      product.product_stock.forEach(item => {
          const key = `${item.size}-${item.color}`
          map[key] = item.quantity
      })
      return map
  }, [product.product_stock])

  const handleBuyNow = () => {
      if (!selectedSize || !selectedColor) {
          toast.error("Please select a size and color")
          return
      }
      handleAddToCart()
      window.location.href = '/checkout'
  }

  // Helpers
  const getStock = (size: string, color: string) => {
      if (!size || !color) return 0
      return stockMap[`${size}-${color}`] || 0
  }

  // Check if a specific combination is actually purchasable
  const isAvailable = (size: string, color: string) => {
      return (stockMap[`${size}-${color}`] || 0) > 0
  }

  // Check if a size has ANY available colors (for initial state)
  const isSizeAvailable = (size: string) => {
      return product.product_stock?.some(s => s.size === size && s.quantity > 0)
  }

  // Derived State
  const maxQty = getStock(selectedSize, selectedColor)
  const isOutOfStock = maxQty === 0 && selectedSize && selectedColor

  const handleAddToCart = () => {
    // 1. Validation
    if (!selectedSize || !selectedColor) {
        toast.error("Please select a size and color")
        return
    }

    if (maxQty <= 0) {
        toast.error("Selected combination is out of stock")
        return
    }
    
    // 2. Add to Cart
    try {
        addToCart({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.main_image_url,
            size: selectedSize,
            color: selectedColor,
            quantity: quantity,
            maxQuantity: maxQty
        })
        toast.success("Added to Bag")
    } catch (err) {
        console.error("Cart Error:", err)
        toast.error("Failed to add to cart")
    }
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24">
                
                {/* LEFT: Gallery (Sticky on Desktop) */}
                <div className="relative">
                    <div className="lg:sticky lg:top-24 space-y-4">
                        <div className="aspect-[4/5] w-full overflow-hidden rounded-md bg-muted/20 border border-border/50 shadow-sm">
                            {product.main_image_url ? (
                                <img 
                                    src={product.main_image_url} 
                                    alt={product.name} 
                                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" 
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-muted">No Image</div>
                            )}
                        </div>
                        {/* Placeholder for future gallery thumbnails */}
                        <div className="grid grid-cols-4 gap-2">
                             {[...Array(3)].map((_, i) => (
                                 <div key={i} className="aspect-square bg-muted/20 rounded-md border border-border/50 animate-pulse" />
                             ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Product Info */}
                <div className="flex flex-col h-full pt-2">
                    
                    {/* Title & Price */}
                    <div className="border-b border-border/60 pb-8 mb-8">
                         <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-foreground capitalize mb-4">
                            {product.name}
                        </h1>
                        <div className="flex items-center justify-between">
                            <p className="text-2xl font-medium">{formatCurrency(product.price)}</p>
                            <div className="flex items-center gap-1 text-sm">
                                <Star className="h-4 w-4 fill-primary text-primary" />
                                <span className="font-semibold">4.9</span>
                                <span className="text-muted-foreground underline decoration-muted-foreground/50 underline-offset-4 cursor-pointer">
                                    (Review Count)
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Selectors */}
                    <div className="space-y-8 mb-8">
                        {/* Size Selector */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold uppercase tracking-wider text-muted-foreground">Size</span>
                                <button className="underline hover:text-primary transition-colors">Size Guide</button>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                {sizeOptions.map((size) => {
                                    // Check if this size has ANY valid stock in any color
                                    const available = isSizeAvailable(size)
                                    
                                    return (
                                        <button
                                            key={size}
                                            onClick={() => { setSelectedSize(size); setQuantity(1); setSelectedColor('') }}
                                            className={cn(
                                                "h-12 w-full rounded-md border transition-all duration-200 text-sm font-medium relative overflow-hidden",
                                                selectedSize === size 
                                                    ? "border-foreground bg-foreground text-background" 
                                                    : "border-input hover:border-foreground/50",
                                                !available && "opacity-50 text-muted-foreground bg-muted/20"
                                            )}
                                        >
                                            {size}
                                            {!available && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-full h-[1px] bg-red-500 transform rotate-45"></div>
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Color Selector */}
                        <div className="space-y-4">
                            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Color</span>
                            <div className="flex flex-wrap gap-3">
                                {colorOptions.map((color) => {
                                    // If size is selected, check specific availability
                                    // If no size, check general availability
                                    const available = selectedSize 
                                        ? isAvailable(selectedSize, color)
                                        : product.product_stock?.some(s => s.color === color && s.quantity > 0)

                                    return (
                                        <button
                                            key={color}
                                            disabled={selectedSize && !available}
                                            onClick={() => { setSelectedColor(color); setQuantity(1) }}
                                            className={cn(
                                                "h-10 px-6 rounded-full border transition-all duration-200 text-sm capitalize relative overflow-hidden",
                                                selectedColor === color 
                                                    ? "border-foreground bg-foreground text-background shadow-md" 
                                                    : "border-input hover:border-foreground/50",
                                                (selectedSize && !available) && "opacity-40 cursor-not-allowed bg-muted"
                                            )}
                                        >
                                            {color}
                                            {(selectedSize && !available) && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-[120%] h-[1px] bg-red-500/80 transform -rotate-12"></div>
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                            {!selectedSize && <p className="text-xs text-muted-foreground animate-pulse">Select a size to see available colors</p>}
                        </div>
                    </div>

                    {/* Quantity & Add to Cart */}
                    <div className="space-y-6">
                        {/* Quantity Counter (Only if maxQty > 1) */}
                         {maxQty > 1 && (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quantity</span>
                                <div className="flex items-center border rounded-full h-10 w-fit">
                                    <button 
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="w-10 h-full flex items-center justify-center hover:bg-muted/50 rounded-l-full"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                                    <button 
                                        onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                                        className="w-10 h-full flex items-center justify-center hover:bg-muted/50 rounded-r-full"
                                        disabled={quantity >= maxQty}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>
                                <span className="text-xs text-muted-foreground">{maxQty} available</span>
                            </div>
                        )}

                        <div className="flex gap-4">
                             <Button 
                                size="lg" 
                                className="flex-1 h-14 text-lg font-bold tracking-wider uppercase rounded-full shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
                                disabled={!selectedSize || !selectedColor || isOutOfStock}
                                onClick={handleAddToCart}
                            >
                                {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
                            </Button>
                            <Button 
                                size="lg" 
                                variant="secondary"
                                className="flex-1 h-14 text-lg font-bold tracking-wider uppercase rounded-full shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
                                disabled={!selectedSize || !selectedColor || isOutOfStock}
                                onClick={handleBuyNow}
                            >
                                Buy Now
                            </Button>
                            
                            <Button
                                size="lg"
                                variant="outline"
                                className={cn(
                                    "h-14 w-14 rounded-full border-2 hover:bg-muted transition-colors",
                                    isWishlisted && "border-primary bg-primary/10 text-primary hover:bg-primary/20"
                                )}
                                onClick={() => {
                                    if (isWishlisted) {
                                        removeItem(product.id)
                                    } else {
                                        addItem({
                                            productId: product.id,
                                            name: product.name,
                                            price: product.price,
                                            image: product.main_image_url,
                                            slug: (product as any).slug || '' // Ensure slug exists
                                        })
                                    }
                                }}
                            >
                                <div className="flex items-center justify-center">
                                    <Star className={cn("h-6 w-6", isWishlisted ? "fill-primary text-primary" : "text-foreground")} /> 
                                    {/* Using Star instead of Heart to match the request or just personal preference? 
                                        Wait, user asked for Wishlist. Standard is Heart. 
                                        The imports showed Star, Truck etc. Let me check if Heart is imported. 
                                        It is NOT imported. I need to adding Heart to imports first or reuse Star? 
                                        Wishlist implies Heart usually. I should add Heart to imports. 
                                     */}
                                     <Heart className={cn("h-6 w-6", isWishlisted && "fill-current")} />
                                </div>
                            </Button>
                        </div>

                         {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-2 py-6 border-b border-border/60">
                             <div className="flex flex-col items-center gap-2 text-center">
                                 <Truck className="h-5 w-5 text-muted-foreground" />
                                 <span className="text-[10px] uppercase font-bold tracking-wide">Fast Delivery</span>
                             </div>
                             <div className="flex flex-col items-center gap-2 text-center">
                                 <RefreshCcw className="h-5 w-5 text-muted-foreground" />
                                 <span className="text-[10px] uppercase font-bold tracking-wide">Free Returns</span>
                             </div>
                             <div className="flex flex-col items-center gap-2 text-center">
                                 <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                                 <span className="text-[10px] uppercase font-bold tracking-wide">Secure Checkout</span>
                             </div>
                        </div>

                        {/* Accordions */}
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="details">
                                <AccordionTrigger className="uppercase text-xs font-bold tracking-widest text-muted-foreground hover:text-foreground">
                                    Product Details
                                </AccordionTrigger>
                                <AccordionContent className="prose prose-sm text-muted-foreground leading-relaxed">
                                    {product.description || "No description available."}
                                    <ul className="mt-4 list-disc pl-4 space-y-1">
                                        <li>Premium Fabric Blend</li>
                                        <li>Relaxed, Modern Fit</li>
                                        <li>Designed in-house</li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="shipping">
                                <AccordionTrigger className="uppercase text-xs font-bold tracking-widest text-muted-foreground hover:text-foreground">
                                    Shipping & Returns
                                </AccordionTrigger>
                                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                                    Free shipping on all orders over ₹2000. Orders are processed within 24 hours.
                                    Returns accepted within 14 days of delivery.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                    </div>
                </div>
            </div>
        </div>
    

    </div>
  )
}

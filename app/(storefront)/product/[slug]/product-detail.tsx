'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/use-cart-store'
import { useWishlistStore, selectIsInWishlist } from '@/store/use-wishlist-store'
import { cn, formatCurrency } from "@/lib/utils"
import { Star, Truck, RefreshCcw, ShieldCheck, ChevronDown, Plus, Minus, Heart, ChevronRight, Home } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { motion, AnimatePresence } from 'framer-motion'

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
        gallery_image_urls?: string[]
        size_options: string[]
        color_options: string[]
        product_stock: StockItem[]
        category_id?: string
    }
    initialReviews: {
        count: number
        average: string
    }
}

export function ProductDetailClient({ product, initialReviews }: ProductDetailProps) {
  const addToCart = useCartStore((state) => state.addItem)
  const addItem = useWishlistStore((state) => state.addItem)
  const removeItem = useWishlistStore((state) => state.removeItem)
  const isWishlisted = useWishlistStore((state) => selectIsInWishlist(state, product.id))
  
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(product.main_image_url)

  // Fallback Standards
  const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL']
  
  // Logic to determine what options to show
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

  // Construct Gallery Images
  const galleryImages = [
      product.main_image_url,
      ...(product.gallery_image_urls || [])
  ].filter(Boolean)

  if (galleryImages.length === 0) galleryImages.push('/placeholder.svg')

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
            
            {/* Breadcrumbs */}
            <nav className="flex items-center text-sm text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap pb-2">
                <Link href="/" className="hover:text-foreground transition-colors"><Home className="h-4 w-4" /></Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
                {product.category_id && (
                    <>
                        <ChevronRight className="h-4 w-4 mx-2" />
                        <Link href={`/shop?category=${product.category_id}`} className="hover:text-foreground transition-colors">Category</Link>
                    </>
                )}
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="font-medium text-foreground">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24">
                
                {/* LEFT: Gallery (Sticky on Desktop) */}
                <div className="relative">
                    <div className="lg:sticky lg:top-24 space-y-4">
                        <div className="aspect-3/4 lg:aspect-4/5 w-full overflow-hidden rounded-md bg-muted/20 border border-border/50 shadow-sm relative group">
                            <AnimatePresence mode="wait">
                                <motion.img 
                                    key={activeImage}
                                    src={activeImage} 
                                    alt={product.name} 
                                    initial={{ opacity: 0.8 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0.8 }}
                                    transition={{ duration: 0.3 }}
                                    className="h-full w-full object-cover" 
                                />
                            </AnimatePresence>
                            {/* Zoom Hint */}
                             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {/* Can add a zoom icon later if lightbox is implemented */}
                             </div>
                        </div>
                        
                        {/* Thumbnails */}
                        {galleryImages.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {galleryImages.map((img, i) => (
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

                {/* RIGHT: Product Info */}
                <div className="flex flex-col h-full pt-2">
                    
                    {/* Title & Price */}
                    <div className="border-b border-border/60 pb-8 mb-8">
                         <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-foreground capitalize mb-4 leading-tight">
                            {product.name}
                        </h1>
                        <div className="flex items-center justify-between">
                            <p className="text-3xl font-medium tracking-tight">{formatCurrency(product.price)}</p>
                            
                            {/* Integrated Reviews */}
                            {initialReviews.count > 0 && (
                                <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
                                    <div className="flex text-yellow-500">
                                        <Star className="h-4 w-4 fill-current" />
                                    </div>
                                    <span className="font-bold text-sm">{initialReviews.average}</span>
                                    <span className="text-xs text-muted-foreground border-l border-border pl-2 ml-1">
                                        {initialReviews.count} Reviews
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Selectors */}
                    <div className="space-y-8 mb-8">
                        {/* Size Selector */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold uppercase tracking-wider text-muted-foreground">Size</span>
                                <button className="underline hover:text-primary transition-colors text-xs text-muted-foreground">Size Guide</button>
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
                                                    ? "border-foreground bg-foreground text-background shadow-lg" 
                                                    : "border-input hover:border-foreground/50 hover:bg-muted/30",
                                                !available && "opacity-50 text-muted-foreground bg-muted/20 cursor-not-allowed"
                                            )}
                                        >
                                            {size}
                                            {!available && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-full h-px bg-red-500/50 transform rotate-45"></div>
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
                                            disabled={!!(selectedSize && !available)}
                                            onClick={() => { setSelectedColor(color); setQuantity(1) }}
                                            className={cn(
                                                "h-10 px-6 rounded-full border transition-all duration-200 text-sm capitalize relative overflow-hidden",
                                                selectedColor === color 
                                                    ? "border-foreground bg-foreground text-background shadow-md transform scale-105" 
                                                    : "border-input hover:border-foreground/50",
                                                (selectedSize && !available) && "opacity-40 cursor-not-allowed bg-muted"
                                            )}
                                        >
                                            {color}
                                            {(selectedSize && !available) && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-[120%] h-px bg-red-500/80 transform -rotate-12"></div>
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                            {!selectedSize && <p className="text-xs text-muted-foreground animate-pulse flex items-center gap-1"><ChevronDown className="h-3 w-3"/> Select a size to see available colors</p>}
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
                                        className="w-10 h-full flex items-center justify-center hover:bg-muted/50 rounded-l-full transition-colors"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                                    <button 
                                        onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                                        className="w-10 h-full flex items-center justify-center hover:bg-muted/50 rounded-r-full transition-colors"
                                        disabled={quantity >= maxQty}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>
                                <span className="text-xs text-muted-foreground font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{maxQty} available</span>
                            </div>
                        )}

                        {/* Actions (Visible on all screens, Stacked on Mobile) */}
                        <div className="flex flex-col lg:flex-row gap-4 w-full">
                            <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md p-4 border-t border-border lg:static lg:bg-transparent lg:p-0 lg:border-none pb-8 lg:pb-0">
                                <div className="flex gap-3 container mx-auto px-0 lg:px-0 max-w-none">
                                    <Button 
                                        size="lg" 
                                        className="flex-1 h-12 lg:h-14 lg:flex-1 text-base lg:text-lg font-bold tracking-wider uppercase rounded-full shadow-xl shadow-primary/20 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300"
                                        disabled={Boolean(!selectedSize || !selectedColor || isOutOfStock)}
                                        onClick={handleAddToCart}
                                    >
                                        {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
                                    </Button>
                                    <Button 
                                        size="lg" 
                                        variant="secondary"
                                        className="flex-1 h-12 lg:h-14 lg:flex-1 text-base lg:text-lg font-bold tracking-wider uppercase rounded-full shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 hidden sm:flex bg-secondary hover:bg-secondary/80"
                                        disabled={Boolean(!selectedSize || !selectedColor || isOutOfStock)}
                                        onClick={handleBuyNow}
                                    >
                                        Buy Now
                                    </Button>
                                    
                                     <Button
                                        size="lg"
                                        variant="outline"
                                        className={cn(
                                            "h-12 w-12 lg:h-14 lg:w-14 rounded-full border-2 hover:bg-muted transition-colors px-0 shrink-0",
                                            isWishlisted && "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
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
                                                    slug: (product as any).slug || '' 
                                                })
                                            }
                                        }}
                                    >
                                        <Heart className={cn("h-5 w-5 lg:h-6 lg:w-6 transition-colors", isWishlisted ? "fill-red-500 stroke-red-500" : "text-foreground")} />
                                    </Button>
                                </div>
                            </div>
                        </div>


                         {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-2 py-6 border-b border-border/60">
                             <div className="flex flex-col items-center gap-2 text-center group">
                                 <div className="p-3 bg-muted/30 rounded-full group-hover:bg-primary/10 transition-colors">
                                     <Truck className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                 </div>
                                 <span className="text-[10px] uppercase font-bold tracking-wide">Fast Delivery</span>
                             </div>
                             <div className="flex flex-col items-center gap-2 text-center group">
                                 <div className="p-3 bg-muted/30 rounded-full group-hover:bg-primary/10 transition-colors">
                                     <RefreshCcw className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                 </div>
                                 <span className="text-[10px] uppercase font-bold tracking-wide">Free Returns</span>
                             </div>
                             <div className="flex flex-col items-center gap-2 text-center group">
                                 <div className="p-3 bg-muted/30 rounded-full group-hover:bg-primary/10 transition-colors">
                                    <ShieldCheck className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                 </div>
                                 <span className="text-[10px] uppercase font-bold tracking-wide">Secure Checkout</span>
                             </div>
                        </div>

                        {/* Accordions */}
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="details" className="border-border/60">
                                <AccordionTrigger className="uppercase text-xs font-bold tracking-widest text-muted-foreground hover:text-foreground hover:no-underline py-6">
                                    Product Details
                                </AccordionTrigger>
                                <AccordionContent className="prose prose-sm text-muted-foreground leading-relaxed pb-6">
                                    {product.description || "No description available."}
                                    <ul className="mt-4 list-disc pl-4 space-y-2 marker:text-primary/50">
                                        <li>Premium Fabric Blend for All-Day Comfort</li>
                                        <li>Relaxed, Gender-Neutral Fit</li>
                                        <li>Ethically Designed & Manufactured</li>
                                        <li>Durable Construction</li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="shipping" className="border-border/60">
                                <AccordionTrigger className="uppercase text-xs font-bold tracking-widest text-muted-foreground hover:text-foreground hover:no-underline py-6">
                                    Shipping & Returns
                                </AccordionTrigger>
                                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-6">
                                    <p className="mb-2"><strong>Global Shipping:</strong> Free shipping on all orders over ₹2000. Orders are processed within 24 hours.</p>
                                    <p><strong>Easy Returns:</strong> Returns accepted within 14 days of delivery. No questions asked.</p>
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


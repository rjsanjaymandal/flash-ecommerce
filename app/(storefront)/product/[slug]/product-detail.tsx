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
                         <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-foreground uppercase mb-6 leading-[0.85]">
                            <span className="text-gradient">{product.name}</span>
                        </h1>
                        <div className="flex items-center justify-between">
                            <p className="text-4xl font-black tracking-tighter italic">{formatCurrency(product.price)}</p>
                            
                            {/* Integrated Reviews */}
                            {initialReviews.count > 0 && (
                                <div className="flex items-center gap-2 glass px-4 py-2 rounded-2xl border-white/5 shadow-xl">
                                    <div className="flex text-amber-400">
                                        <Star className="h-4 w-4 fill-current" />
                                    </div>
                                    <span className="font-black text-xs uppercase tracking-widest">{initialReviews.average}</span>
                                    <div className="h-3 w-px bg-white/10 mx-1" />
                                    <span className="text-[10px] uppercase font-black tracking-[0.2em] opacity-60">
                                        {initialReviews.count} Reviews
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Selectors */}
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
                                    
                                    return (
                                        <button
                                            key={size}
                                            onClick={() => { setSelectedSize(size); setQuantity(1); setSelectedColor('') }}
                                            className={cn(
                                                "h-14 w-full rounded-2xl border transition-all duration-300 text-sm font-black uppercase relative overflow-hidden",
                                                selectedSize === size 
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
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Select Color</span>
                            <div className="flex flex-wrap gap-3">
                                {colorOptions.map((color) => {
                                    const available = selectedSize 
                                        ? isAvailable(selectedSize, color)
                                        : product.product_stock?.some(s => s.color === color && s.quantity > 0)

                                    return (
                                        <button
                                            key={color}
                                            disabled={!!(selectedSize && !available)}
                                            onClick={() => { setSelectedColor(color); setQuantity(1) }}
                                            className={cn(
                                                "h-12 px-8 rounded-2xl border transition-all duration-300 text-[10px] font-black uppercase tracking-widest relative overflow-hidden",
                                                selectedColor === color 
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

                    {/* Quantity & Add to Cart */}
                    <div className="space-y-8">
                        {/* Actions (Visible on all screens, Stacked on Mobile) */}
                        <div className="space-y-4 w-full">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button 
                                    size="lg" 
                                    className="flex-1 h-14 lg:h-16 text-sm font-black uppercase tracking-[0.3em] rounded-2xl gradient-primary shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                                    disabled={Boolean(!selectedSize || !selectedColor || isOutOfStock)}
                                    onClick={handleAddToCart}
                                >
                                    {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
                                </Button>
                                
                                <Button 
                                    size="lg" 
                                    variant="outline"
                                    className="flex-1 h-14 lg:h-16 text-sm font-black uppercase tracking-[0.3em] rounded-2xl border-2 hover:bg-secondary transition-all duration-300"
                                    disabled={Boolean(!selectedSize || !selectedColor || isOutOfStock)}
                                    onClick={handleBuyNow}
                                >
                                    Buy Now
                                </Button>

                                <Button
                                    size="lg"
                                    variant="outline"
                                    className={cn(
                                        "h-14 w-14 lg:h-16 lg:w-16 rounded-2xl border transition-all duration-300 px-0 shrink-0",
                                        isWishlisted ? "border-red-500/50 bg-red-500/10 text-red-500" : "hover:border-primary/50 hover:bg-primary/5"
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
                                    <Heart className={cn("h-6 w-6 transition-colors", isWishlisted ? "fill-red-500 stroke-red-500" : "text-foreground")} />
                                </Button>
                            </div>
                        </div>

                         {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-2 py-8 border-b border-border/60">
                             <div className="flex flex-col items-center gap-3 text-center group">
                                 <div className="h-10 w-10 flex items-center justify-center bg-primary/5 rounded-2xl group-hover:bg-primary/10 transition-colors">
                                     <Truck className="h-5 w-5 text-primary" />
                                 </div>
                                 <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Express Shipping</span>
                             </div>
                             <div className="flex flex-col items-center gap-3 text-center group">
                                 <div className="h-10 w-10 flex items-center justify-center bg-accent/5 rounded-2xl group-hover:bg-accent/10 transition-colors">
                                     <RefreshCcw className="h-5 w-5 text-accent" />
                                 </div>
                                 <span className="text-[10px] uppercase font-black tracking-widest opacity-60">No-Sync Returns</span>
                             </div>
                             <div className="flex flex-col items-center gap-3 text-center group">
                                 <div className="h-10 w-10 flex items-center justify-center bg-emerald-500/5 rounded-2xl group-hover:bg-emerald-500/10 transition-colors">
                                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                 </div>
                                 <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Secure Checkout</span>
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


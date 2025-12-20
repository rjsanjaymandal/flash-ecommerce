'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/use-cart-store'
import { useWishlistStore, selectIsInWishlist } from '@/store/use-wishlist-store'
import { cn, formatCurrency } from "@/lib/utils"
import { Star, Truck, RefreshCcw, ShieldCheck, ChevronRight, Home, Plus, Heart, Clock } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { checkPreorderStatus, togglePreorder } from '@/app/actions/preorder'
import { ProductGallery } from '@/components/products/product-gallery'
import { ProductSelectors } from '@/components/products/product-selectors'
import { MobileStickyBar } from '@/components/storefront/mobile-sticky-bar'
import { FAQJsonLd } from '@/components/seo/faq-json-ld'

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
        images?: {
            thumbnail: string
            mobile: string
            desktop: string
        }
        slug?: string
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
    const [isOnWaitlist, setIsOnWaitlist] = useState(false)
    const [showStickyBar, setShowStickyBar] = useState(false)
    
    // Ref for the main action button to sticky bar intersection
    const mainActionRef = useRef<HTMLDivElement>(null)

    // Check Waitlist Status
    useEffect(() => {
         checkPreorderStatus(product.id).then(setIsOnWaitlist)
    }, [product.id])

    // Scroll Observer for Sticky Bar
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Show sticky bar when main button is NOT intersecting (scrolled past)
                setShowStickyBar(!entry.isIntersecting)
            },
            { threshold: 0 }
        )

        if (mainActionRef.current) {
            observer.observe(mainActionRef.current)
        }

        return () => observer.disconnect()
    }, [])
    
    // Fallback Standards
    const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
  
    // Logic to determine what options to show
    const sizeOptions = useMemo(() => {
        const sizes = product.size_options?.length 
            ? [...product.size_options]
            : (product.product_stock?.length ? Array.from(new Set(product.product_stock.map((s: any) => s.size))) : [...STANDARD_SIZES])
      
        return sizes.sort((a, b) => {
            const indexA = STANDARD_SIZES.indexOf(a)
            const indexB = STANDARD_SIZES.indexOf(b)
            if (indexA !== -1 && indexB !== -1) return indexA - indexB
            if (indexA !== -1) return -1
            if (indexB !== -1) return 1
            return a.localeCompare(b)
        })
    }, [product.size_options, product.product_stock])

    const colorOptions = product.color_options?.length 
        ? product.color_options 
        : Array.from(new Set(product.product_stock?.map((s: any) => s.color) || ['Standard'])).sort() as string[]

    // Stock Logic
    const stockMap = useMemo(() => {
        const map: Record<string, number> = {}
        if (!product.product_stock) return map
        product.product_stock.forEach(item => {
            const key = `${item.size}-${item.color}`
            map[key] = item.quantity
        })
        return map
    }, [product.product_stock])

    const getStock = (size: string, color: string) => stockMap[`${size}-${color}`] || 0
    const isAvailable = (size: string, color: string) => (stockMap[`${size}-${color}`] || 0) > 0
    const isSizeAvailable = (size: string) => product.product_stock?.some(s => s.size === size && s.quantity > 0)

    const maxQty = getStock(selectedSize, selectedColor)
    const isOutOfStock = maxQty === 0 && selectedSize && selectedColor

    // Handlers
    const handlePreOrder = async () => {
        try {
            const result = await togglePreorder(product.id)
            if (result.error) {
                toast.error(result.error)
            } else {
                const isAdded = result.status === 'added'
                setIsOnWaitlist(isAdded)
                toast.success(isAdded ? "Added to waitlist" : "Removed from waitlist")
            }
        } catch (error) {
            toast.error("Please login first")
        }
    }

    const handleAddToCart = () => {
        if (!selectedSize || !selectedColor) {
            toast.error("Please select a size and color")
            return
        }
        if (maxQty <= 0) {
            toast.error("Selected combination is out of stock")
            return
        }
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
            toast.error("Failed to add to cart")
        }
    }

    const handleBuyNow = () => {
        if (!selectedSize || !selectedColor) {
            toast.error("Please select a size and color")
            return
        }
        handleAddToCart()
        window.location.href = '/checkout'
    }

    // FAQ Data
    const faqData = [
        { question: "What material is this?", answer: "Premium Fabric Blend designed for comfort and durability." },
        { question: "How is the fit?", answer: "Relaxed, gender-neutral fit. True to size." },
        { question: "Shipping policy?", answer: "Free global shipping on orders over ₹2000. Processed in 24 hours." },
        { question: "Return policy?", answer: "Returns accepted within 14 days of delivery." }
    ]

    return (
        <div className="min-h-screen bg-background pt-6 pb-20">
            <FAQJsonLd questions={faqData} />
            <MobileStickyBar 
                isVisible={showStickyBar}
                price={formatCurrency(product.price)}
                isOutOfStock={Boolean(isOutOfStock)}
                isOnWaitlist={isOnWaitlist}
                disabled={!selectedSize || !selectedColor}
                onAddToCart={handleAddToCart}
                onPreOrder={handlePreOrder}
            />

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
                    {/* LEFT: Gallery */}
                    <ProductGallery 
                        images={product.gallery_image_urls || []} 
                        name={product.name} 
                        mainImage={product.images?.desktop || product.main_image_url} 
                    />

                    {/* RIGHT: Product Info */}
                    <div className="flex flex-col h-full pt-2">
                        {/* Title & Price */}
                        <div className="border-b border-border/60 pb-8 mb-8">
                             <h1 className="text-4xl lg:text-6xl font-black tracking-tighter text-foreground uppercase mb-6 leading-[0.85]">
                                <span className="text-gradient">{product.name}</span>
                            </h1>
                            <div className="flex items-center justify-between">
                                <p className="text-4xl font-black tracking-tighter italic">{formatCurrency(product.price)}</p>
                                {initialReviews.count > 0 && (
                                    <div className="flex items-center gap-2 bg-muted/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-border/50 shadow-sm">
                                        <div className="flex text-amber-400"><Star className="h-4 w-4 fill-current" /></div>
                                        <span className="font-black text-xs uppercase tracking-widest text-foreground">{initialReviews.average}</span>
                                        <div className="h-3 w-px bg-border mx-1" />
                                        <span className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">{initialReviews.count} Reviews</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selectors */}
                        <ProductSelectors 
                            sizeOptions={sizeOptions}
                            colorOptions={colorOptions}
                            selectedSize={selectedSize}
                            selectedColor={selectedColor}
                            onSelectSize={(s) => { setSelectedSize(s); setQuantity(1); setSelectedColor('') }}
                            onSelectColor={(c) => { setSelectedColor(c); setQuantity(1) }}
                            isAvailable={isAvailable}
                            isSizeAvailable={isSizeAvailable}
                            getStock={getStock}
                        />

                        {/* Actions */}
                        <div className="space-y-8" ref={mainActionRef}>
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-3">
                                    <Button 
                                        size="lg" 
                                        className={cn(
                                            "flex-1 h-16 text-xs sm:text-sm font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl transition-all duration-300",
                                            isOutOfStock 
                                                ? "bg-amber-400 text-amber-950 hover:bg-amber-500 shadow-amber-500/20" 
                                                : "gradient-primary shadow-primary/30 hover:scale-[1.02] active:scale-95"
                                        )}
                                        disabled={Boolean(!selectedSize || !selectedColor)}
                                        onClick={isOutOfStock ? handlePreOrder : handleAddToCart}
                                    >
                                        {isOutOfStock ? (
                                            <span className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                {isOnWaitlist ? "Joined Waitlist" : "Join Waitlist"}
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Plus className="h-4 w-4" />
                                                Add to Bag
                                            </span>
                                        )}
                                    </Button>

                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className={cn(
                                            "h-16 w-16 rounded-2xl border-2 transition-all duration-300 px-0 shrink-0",
                                            isWishlisted ? "border-red-500/50 bg-red-500/10 text-red-500 shadow-lg shadow-red-500/20" : "hover:border-primary/50 hover:bg-primary/5"
                                        )}
                                        onClick={() => isWishlisted ? removeItem(product.id) : addItem({ productId: product.id, name: product.name, price: product.price, image: product.main_image_url, slug: product.slug || '' })}
                                    >
                                        <Heart className={cn("h-6 w-6 transition-colors", isWishlisted ? "fill-red-500 stroke-red-500" : "text-foreground")} />
                                    </Button>
                                </div>
                                
                                {isOutOfStock ? null : (
                                    <Button 
                                        size="lg" 
                                        className="w-full h-16 text-xs sm:text-sm font-black uppercase tracking-[0.2em] rounded-2xl bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 shadow-xl"
                                        disabled={Boolean(!selectedSize || !selectedColor)}
                                        onClick={handleBuyNow}
                                    >
                                        Instantly Checkout
                                    </Button>
                                )}
                            </div>
                        </div>

                         {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-2 py-8 border-b border-border/60">
                             <div className="flex flex-col items-center gap-3 text-center group">
                                 <div className="h-10 w-10 flex items-center justify-center bg-primary/5 rounded-2xl group-hover:bg-primary/10 transition-colors"><Truck className="h-5 w-5 text-primary" /></div>
                                 <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Express Shipping</span>
                             </div>
                             <div className="flex flex-col items-center gap-3 text-center group">
                                 <div className="h-10 w-10 flex items-center justify-center bg-accent/5 rounded-2xl group-hover:bg-accent/10 transition-colors"><RefreshCcw className="h-5 w-5 text-accent" /></div>
                                 <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Easy Returns</span>
                             </div>
                             <div className="flex flex-col items-center gap-3 text-center group">
                                 <div className="h-10 w-10 flex items-center justify-center bg-emerald-500/5 rounded-2xl group-hover:bg-emerald-500/10 transition-colors"><ShieldCheck className="h-5 w-5 text-emerald-500" /></div>
                                 <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Secure Checkout</span>
                             </div>
                        </div>

                        {/* Accordions */}
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="details" className="border-border/60">
                                <AccordionTrigger className="uppercase text-xs font-bold tracking-widest text-muted-foreground hover:text-foreground hover:no-underline py-6">Product Details</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                                    <div 
                                        className="prose prose-stone prose-lg max-w-none prose-headings:font-bold prose-p:text-muted-foreground prose-li:text-muted-foreground"
                                        dangerouslySetInnerHTML={{ __html: product.description || "No description available." }}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="shipping" className="border-border/60">
                                <AccordionTrigger className="uppercase text-xs font-bold tracking-widest text-muted-foreground hover:text-foreground hover:no-underline py-6">Shipping & Returns</AccordionTrigger>
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
    )
}

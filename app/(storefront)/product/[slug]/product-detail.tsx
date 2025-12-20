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
import { ShareButton } from '@/components/products/share-button'
import { motion } from 'framer-motion'

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
        categories?: {
            name: string
        } | null
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
                {/* Refined Breadcrumbs */}
                <nav className="flex items-center text-xs lg:text-sm text-muted-foreground mb-8 lg:mb-12 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
                    <Link href="/" className="hover:text-primary transition-colors flex-shrink-0">
                        Home
                    </Link>
                    <span className="mx-2 text-muted-foreground/40">/</span>
                    <Link href="/shop" className="hover:text-primary transition-colors flex-shrink-0">
                        Shop
                    </Link>
                    
                    {product.categories?.name && (
                        <>
                            <span className="mx-2 text-muted-foreground/40">/</span>
                            <Link 
                                href={`/shop?category=${product.category_id}`} 
                                className="hover:text-primary transition-colors flex-shrink-0 font-medium text-foreground/80 hover:text-primary"
                            >
                                {product.categories.name}
                            </Link>
                        </>
                    )}
                    
                    <span className="mx-2 text-muted-foreground/40">/</span>
                    <span className="font-bold text-foreground truncate max-w-[120px] sm:max-w-xs md:max-w-md">
                        {product.name}
                    </span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
                    {/* LEFT: Gallery (Takes 7 cols) */}
                    <div className="lg:col-span-7">
                        <ProductGallery 
                            images={product.gallery_image_urls || []} 
                            name={product.name} 
                            mainImage={product.images?.desktop || product.main_image_url} 
                        />
                    </div>

                    {/* RIGHT: Product Info (Takes 5 cols) */}
                    <div className="lg:col-span-5 flex flex-col h-full pt-2 lg:sticky lg:top-24 self-start">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-card/50 backdrop-blur-sm rounded-none lg:p-0"
                        >
                            {/* Title & Price */}
                            <div className="border-b border-border/60 pb-8 mb-8">
                                <div className="flex justify-between items-start mb-4">
                                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground uppercase leading-[0.9] max-w-[85%]">
                                        <span className="text-gradient">{product.name}</span>
                                    </h1>
                                    <ShareButton title={product.name} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <p className="text-3xl font-black tracking-tighter text-foreground">{formatCurrency(product.price)}</p>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Inclusive of all taxes</p>
                                    </div>
                                    
                                    {initialReviews.count > 0 && (
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-1.5 text-amber-400">
                                                <Star className="h-4 w-4 fill-current" />
                                                <span className="font-black text-lg text-foreground">{initialReviews.average}</span>
                                            </div>
                                            <Link href="#reviews" className="text-[10px] bg-muted px-2 py-1 rounded-full font-bold uppercase tracking-widest text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                                                {initialReviews.count} Reviews
                                            </Link>
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
                            <div className="space-y-6" ref={mainActionRef}>
                                <div className="flex flex-col gap-3">
                                    <div className="flex gap-3">
                                        <Button 
                                            size="lg" 
                                            className={cn(
                                                "flex-1 h-14 text-sm font-black uppercase tracking-[0.15em] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300",
                                                isOutOfStock 
                                                    ? "bg-amber-400 text-amber-950 hover:bg-amber-500" 
                                                    : "bg-foreground text-background hover:bg-foreground/90 hover:scale-[1.01]"
                                            )}
                                            disabled={Boolean(!selectedSize || !selectedColor)}
                                            onClick={isOutOfStock ? handlePreOrder : handleAddToCart}
                                        >
                                            {isOutOfStock ? (
                                                <span className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    {isOnWaitlist ? "On Waitlist" : "Join Waitlist"}
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
                                                "h-14 w-14 rounded-xl border-2 transition-all duration-300 px-0 shrink-0",
                                                isWishlisted ? "border-red-500/50 bg-red-500/5 text-red-500" : "hover:border-primary/30 hover:bg-primary/5"
                                            )}
                                            onClick={() => isWishlisted ? removeItem(product.id) : addItem({ productId: product.id, name: product.name, price: product.price, image: product.main_image_url, slug: product.slug || '' })}
                                        >
                                            <Heart className={cn("h-5 w-5 transition-colors", isWishlisted ? "fill-red-500 stroke-red-500" : "text-foreground")} />
                                        </Button>
                                    </div>
                                    
                                    {!isOutOfStock && (
                                        <Button 
                                            size="lg" 
                                            className="w-full h-14 text-sm font-black uppercase tracking-[0.15em] rounded-xl gradient-primary text-white shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.01] transition-all"
                                            disabled={Boolean(!selectedSize || !selectedColor)}
                                            onClick={handleBuyNow}
                                        >
                                            Buy It Now
                                        </Button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Short Description Accordion */}
                            <div className="mt-8">
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="details" className="border-border/60">
                                        <AccordionTrigger className="uppercase text-[11px] font-black tracking-widest text-muted-foreground hover:text-foreground">Product Description</AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground leading-relaxed">
                                            <div 
                                                className="prose prose-sm prose-stone max-w-none text-sm text-foreground/80 font-medium"
                                                dangerouslySetInnerHTML={{ __html: product.description || "No description available." }}
                                            />
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="shipping" className="border-border/60">
                                        <AccordionTrigger className="uppercase text-[11px] font-black tracking-widest text-muted-foreground hover:text-foreground">Shipping Info</AccordionTrigger>
                                        <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Truck className="h-4 w-4 text-primary" />
                                                <span>Free shipping on orders over ₹2000</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <RefreshCcw className="h-4 w-4 text-primary" />
                                                <span>14-day easy returns policy</span>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency } from '@/lib/utils'
import { ShoppingBag, Heart, Star } from 'lucide-react'
import Image from 'next/image'
import { useWishlistStore, selectIsInWishlist } from '@/store/use-wishlist-store'
import { useCartStore } from '@/store/use-cart-store'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { QuickView } from '@/components/products/quick-view'
import type { Product } from '@/lib/services/product-service'
import { checkPreorderStatus, togglePreorder } from '@/app/actions/preorder'

interface ProductCardProps {
    product: Product
    showRating?: boolean
    priority?: boolean
}

export function ProductCard({ product, showRating = true, priority = false }: ProductCardProps) {
  // Use optimized images if available, starting with thumbnail for grid, or mobile for slightly larger cards
  // Fallback to main_image_url
  const optimizedSrc = product.images?.thumbnail || product.images?.mobile || product.main_image_url
  const [imageSrc, setImageSrc] = useState(optimizedSrc || '/placeholder.svg')
  const [isNew, setIsNew] = useState(false)
  
  // Pre-order state
  const [isOnWaitlist, setIsOnWaitlist] = useState(false)
  const [isLoadingWaitlist, setIsLoadingWaitlist] = useState(false)

  const router = useRouter()
  
  const addToCart = useCartStore((state) => state.addItem)
  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen)
  const addToWishlist = useWishlistStore((state) => state.addItem)
  const removeFromWishlist = useWishlistStore((state) => state.removeItem)
  const isWishlisted = useWishlistStore((state) => selectIsInWishlist(state, product.id))
  
  const stock = product.product_stock || []
  const hasMultipleOptions = (product.size_options && product.size_options.length > 0) || (product.color_options && product.color_options.length > 0)
  
  // Calculate total stock
  const totalStock = stock.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0)
  const isOutOfStock = totalStock === 0

  // Optional: Get rating from product if passed (e.g. from a joined aggregate)
  const rating = product.average_rating || 0
  const reviewCount = product.review_count || 0

  // Check waitlist status on mount if OOS
  useEffect(() => {
      if (isOutOfStock) {
          checkPreorderStatus(product.id).then(setIsOnWaitlist)
      }
  }, [isOutOfStock, product.id])

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isWishlisted) {
        removeFromWishlist(product.id)
    } else {
        addToWishlist({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.main_image_url || '',
            slug: product.slug || ''
        })
        toast.success("Added to Wishlist")
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (hasMultipleOptions) {
        router.push(`/product/${product.slug}`)
        return
    }

    const variant = stock[0]
    if (variant) {
         addToCart({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.main_image_url || '',
            size: variant.size,
            color: variant.color,
            maxQuantity: variant.quantity || 0,
            quantity: 1
        })
        toast.success("Added to Bag")
        setIsCartOpen(true)
    } else {
         router.push(`/product/${product.slug}`)
    }
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (hasMultipleOptions) {
        router.push(`/product/${product.slug}`)
        return
    }

     const variant = stock[0]
     if (variant) {
         addToCart({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.main_image_url || '',
            size: variant.size,
            color: variant.color,
            maxQuantity: variant.quantity || 0,
            quantity: 1
        })
        router.push('/checkout')
    } else {
         router.push(`/product/${product.slug}`)
    }
  }

  const handlePreOrder = async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      setIsLoadingWaitlist(true)
      try {
          const result = await togglePreorder(product.id)
          if (result.error) {
              toast.error(result.error)
              if (result.error.includes("logged in")) {
                  router.push('/login')
              }
          } else {
              setIsOnWaitlist(result.status === 'added')
              toast.success(result.status === 'added' ? "Added to waitlist!" : "Removed from waitlist.")
          }
      } catch (error) {
          toast.error("Something went wrong.")
      } finally {
          setIsLoadingWaitlist(false)
      }
  }

  useEffect(() => {
    if (product.created_at) {
        const isProductNew = new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        setIsNew(isProductNew)
    }
  }, [product.created_at])

  return (
    <motion.div 
        whileHover={{ y: -4 }}
        className="group relative flex flex-col gap-3"
    >
        {/* Image Container */}
        <Link href={`/product/${product.slug || product.id}`} className="block relative aspect-3/4 overflow-hidden rounded-xl bg-muted/20 border border-transparent group-hover:border-border/50 transition-all duration-300 shadow-sm">
            {/* Badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                 {isOutOfStock ? (
                     <Badge className="bg-amber-500 hover:bg-amber-600 text-white uppercase tracking-widest text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm border-none">Coming Soon</Badge>
                 ) : isNew ? (
                     <Badge className="bg-white/90 text-black hover:bg-white uppercase tracking-widest text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm backdrop-blur-md border-none">New</Badge>
                 ) : null}
            </div>

            {/* Wishlist Button */}
             <button
                onClick={handleWishlistClick}
                className={cn(
                    "absolute top-3 right-3 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md transition-all duration-300 hover:scale-110 shadow-sm opacity-0 group-hover:opacity-100",
                    isWishlisted ? "text-red-500 bg-red-50/90 opacity-100" : "text-black hover:bg-white"
                )}
            >
                <Heart className={cn("h-4 w-4 transition-colors", isWishlisted ? "fill-current" : "group-hover/heart:fill-red-200")} />
            </button>

            {/* Main Image */}
            <motion.div
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative h-full w-full bg-zinc-100"
            >
                <Image 
                    src={imageSrc} 
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    onError={() => setImageSrc('/placeholder.svg')}
                    priority={priority}
                    unoptimized
                />
            </motion.div>

            {/* Desktop Action Overlay */}
            <div className="hidden lg:flex absolute inset-x-3 bottom-3 gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out z-20">
                {!isOutOfStock ? (
                    <>
                        <Button 
                            size="sm" 
                            className="flex-1 bg-card text-foreground hover:bg-primary hover:text-primary-foreground shadow-xl font-bold h-10 rounded-full transition-all duration-300 uppercase text-[10px] tracking-widest"
                            onClick={handleAddToCart}
                        >
                             <ShoppingBag className="h-3.5 w-3.5 mr-2" />
                             Add to Cart
                        </Button>
                        <div onClick={(e) => e.preventDefault()} className="shrink-0">
                            <QuickView product={product} /> 
                        </div>
                    </>
                ) : (
                    <Button 
                        size="sm" 
                        className={cn(
                            "flex-1 shadow-xl font-bold h-10 rounded-full transition-all duration-300 uppercase text-[10px] tracking-widest",
                            isOnWaitlist ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-card hover:bg-primary hover:text-primary-foreground text-foreground"
                        )}
                        onClick={handlePreOrder}
                        disabled={isLoadingWaitlist}
                    >
                         {isLoadingWaitlist ? 'Updating...' : isOnWaitlist ? 'Joined Waitlist' : 'Pre Order'}
                    </Button>
                )}
            </div>
        </Link>
        
        {/* Details */ }
        <div className="space-y-1.5 px-0.5">
             <div className="flex flex-col gap-0.5">
                <Link href={`/product/${product.slug || product.id}`} className="hover:text-primary transition-colors inline-block">
                    <h3 className="font-semibold text-sm lg:text-[15px] leading-tight text-foreground line-clamp-1 capitalize">{product.name}</h3>
                </Link>
                
                {/* Review Integration */}
                {showRating && (
                    <div className="flex items-center gap-1.5">
                        <div className="flex text-yellow-400">
                             <Star className={cn("h-3 w-3 fill-current", rating === 0 && "text-muted/30 fill-muted/30")} />
                        </div>
                        <span className="text-[11px] font-bold text-muted-foreground">{rating > 0 ? rating.toFixed(1) : 'No reviews'}</span>
                        {reviewCount > 0 && <span className="text-[10px] text-muted-foreground/60">({reviewCount})</span>}
                    </div>
                )}
             </div>
             <p className="font-black text-sm lg:text-base text-foreground tracking-tight">{formatCurrency(product.price)}</p>
        </div>

         {/* Mobile Actions */}
        <div className="lg:hidden mt-1">
            {!isOutOfStock ? (
                <div className="grid grid-cols-2 gap-2">
                     <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-full h-9 text-[10px] font-black uppercase tracking-widest border-zinc-200 shadow-sm"
                        onClick={handleAddToCart}
                    >
                        Add
                    </Button>
                    <Button 
                        size="sm" 
                        className="rounded-full h-9 text-[10px] font-black uppercase tracking-widest shadow-sm"
                        onClick={handleBuyNow}
                    >
                        Buy Now
                    </Button>
                </div>
            ) : (
                <Button 
                    size="sm" 
                    className={cn(
                        "w-full rounded-full h-9 text-[10px] font-black uppercase tracking-widest shadow-sm",
                        isOnWaitlist ? "bg-green-500 hover:bg-green-600 text-white" : ""
                    )}
                    onClick={handlePreOrder}
                    disabled={isLoadingWaitlist}
                >
                    {isLoadingWaitlist ? '...' : isOnWaitlist ? 'On Waitlist' : 'Pre Order'}
                </Button>
            )}
        </div>
    </motion.div>
  )
}


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
        className="group relative flex flex-col gap-2"
    >
        {/* Image Container */}
        <Link href={`/product/${product.slug || product.id}`} className="block relative aspect-[3/4] overflow-hidden rounded-md bg-muted/20 border border-transparent group-hover:border-border/50 transition-all duration-300">
            {/* Badges */}
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
                 {isOutOfStock ? (
                     <Badge className="bg-neutral-900 text-white hover:bg-neutral-800 uppercase tracking-wider text-[9px] font-bold px-2 py-0.5 rounded-sm border-none shadow-sm">Sold Out</Badge>
                 ) : isNew ? (
                     <Badge className="bg-white text-black hover:bg-white/90 uppercase tracking-wider text-[9px] font-bold px-2 py-0.5 rounded-sm border-none shadow-sm backdrop-blur-md">New</Badge>
                 ) : null}
                 
                 {/* Sale Badge Example (Logic can be added later) */}
                 {/* <Badge className="bg-red-600 text-white uppercase tracking-wider text-[9px] font-bold px-2 py-0.5 rounded-sm border-none">-20%</Badge> */}
            </div>

            {/* Wishlist Button */}
             <button
                onClick={handleWishlistClick}
                className={cn(
                    "absolute top-2 right-2 z-10 h-7 w-7 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all duration-200 hover:scale-110 shadow-sm opacity-0 group-hover:opacity-100",
                    isWishlisted ? "text-red-500 opacity-100" : "text-black hover:bg-white"
                )}
            >
                <Heart className={cn("h-3.5 w-3.5 transition-colors", isWishlisted ? "fill-current" : "group-hover/heart:fill-red-200")} />
            </button>

            {/* Main Image */}
            <div className="relative h-full w-full bg-zinc-100 overflow-hidden">
                <Image 
                    src={imageSrc} 
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    onError={() => setImageSrc('/placeholder.svg')}
                    priority={priority}
                    unoptimized
                />
            </div>

            {/* Desktop Action Overlay */}
            <div className="hidden lg:flex absolute inset-x-2 bottom-2 gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out z-20">
                {!isOutOfStock ? (
                    <>
                        <Button 
                            size="sm" 
                            className="flex-1 bg-white text-black hover:bg-neutral-100 shadow-md font-bold h-9 rounded-sm transition-all duration-200 uppercase text-[10px] tracking-widest border border-transparent"
                            onClick={handleAddToCart}
                        >
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
                            "flex-1 shadow-md font-bold h-9 rounded-sm transition-all duration-200 uppercase text-[10px] tracking-widest",
                            isOnWaitlist ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-neutral-900 hover:bg-neutral-800 text-white"
                        )}
                        onClick={handlePreOrder}
                        disabled={isLoadingWaitlist}
                    >
                         {isLoadingWaitlist ? '...' : isOnWaitlist ? 'Joined' : 'Notify Me'}
                    </Button>
                )}
            </div>
        </Link>
        
        {/* Details */ }
        <div className="space-y-1 px-0.5">
             <div className="flex flex-col gap-0.5">
                <div className="flex justify-between items-start gap-2">
                    <Link href={`/product/${product.slug || product.id}`} className="hover:text-primary transition-colors flex-1 min-w-0">
                        <h3 className="font-bold text-xs lg:text-sm leading-tight text-foreground uppercase tracking-wide truncate">{product.name}</h3>
                    </Link>
                    <p className="font-bold text-xs lg:text-sm text-foreground tracking-tight tabular-nums whitespace-nowrap">{formatCurrency(product.price)}</p>
                </div>
                
                {/* Variant Hint or Metadata */}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground/70 uppercase tracking-wider font-medium">
                    <span>{product.categories?.name || 'Collection'}</span>
                    {hasMultipleOptions && (
                         <span>{stock.length > 0 ? '+ Options' : ''}</span>
                    )}
                </div>
             </div>
        </div>

         {/* Mobile Actions */}
        <div className="lg:hidden mt-2 grid grid-cols-2 gap-2">
            {!isOutOfStock ? (
                <>
                     <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 rounded-sm text-[10px] font-bold uppercase tracking-widest border-zinc-200 shadow-sm hover:bg-zinc-50"
                        onClick={handleAddToCart}
                    >
                        Add
                    </Button>
                    <Button 
                        size="sm" 
                        className="h-9 rounded-sm text-[10px] font-bold uppercase tracking-widest shadow-sm bg-neutral-900 text-white hover:bg-neutral-800"
                        onClick={handleBuyNow}
                    >
                        Buy Now
                    </Button>
                </>
            ) : (
                <Button 
                    size="sm" 
                    className={cn(
                        "col-span-2 h-9 rounded-sm text-[10px] font-bold uppercase tracking-widest shadow-sm",
                        isOnWaitlist ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-neutral-900 hover:bg-neutral-800 text-white"
                    )}
                    onClick={handlePreOrder}
                    disabled={isLoadingWaitlist}
                >
                    {isLoadingWaitlist ? '...' : isOnWaitlist ? 'Joined Waitlist' : 'Notify Me'}
                </Button>
            )}
        </div>
    </motion.div>
  )
}


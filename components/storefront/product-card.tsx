'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency } from '@/lib/utils'
import { ShoppingBag, Heart, Eye } from 'lucide-react'
import Image from 'next/image'
import { useWishlistStore, selectIsInWishlist } from '@/store/use-wishlist-store'
import { useCartStore } from '@/store/use-cart-store'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { QuickView } from '@/components/products/quick-view'

export function ProductCard({ product }: { product: any }) {
  const [imageSrc, setImageSrc] = useState(product.main_image_url || '/placeholder.svg')
  const router = useRouter()
  const addToCart = useCartStore((state) => state.addItem)
  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen)
  const addToWishlist = useWishlistStore((state) => state.addItem)
  const removeFromWishlist = useWishlistStore((state) => state.removeItem)
  const isWishlisted = useWishlistStore((state) => selectIsInWishlist(state, product.id))
  
  const stock = product.product_stock || []
  const hasMultipleOptions = (product.size_options?.length > 0 || product.color_options?.length > 0)
  
  // Calculate total stock
  const totalStock = stock.reduce((acc: number, item: any) => acc + item.quantity, 0)
  const isOutOfStock = totalStock === 0

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
            image: product.main_image_url,
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
            image: product.main_image_url,
            size: variant.size,
            color: variant.color,
            maxQuantity: variant.quantity,
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
            image: product.main_image_url,
            size: variant.size,
            color: variant.color,
            maxQuantity: variant.quantity,
            quantity: 1
        })
        router.push('/checkout')
    } else {
         router.push(`/product/${product.slug}`)
    }
  }
  
  const isNew = product.created_at && new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  return (
    <motion.div 
        whileHover={{ y: -5 }}
        className="group relative flex flex-col gap-3"
    >
        {/* Image Container */}
        <Link href={`/product/${product.slug || product.id}`} className="block relative aspect-3/4 overflow-hidden rounded-lg bg-muted/20">
            {/* Badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                 {isOutOfStock ? (
                     <Badge variant="destructive" className="uppercase tracking-wider text-[10px] font-bold shadow-sm">Out of Stock</Badge>
                 ) : isNew ? (
                     <Badge className="bg-white text-black hover:bg-white/90 uppercase tracking-wider text-[10px] font-bold shadow-sm backdrop-blur-md">New</Badge>
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
                <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
            </button>

            {/* Main Image */}
            <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
                className="h-full w-full bg-muted/20"
            >
                <Image 
                    src={imageSrc} 
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={() => setImageSrc('/placeholder.svg')}
                    unoptimized
                />
            </motion.div>

            {/* Desktop Action Overlay */}
            {!isOutOfStock && (
                <div className="hidden lg:flex absolute inset-x-4 bottom-4 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out z-20">
                    <Button 
                        size="sm" 
                        className="flex-1 bg-white text-black hover:bg-white/90 shadow-lg font-medium h-10 rounded-full"
                        onClick={handleAddToCart}
                    >
                         <ShoppingBag className="h-4 w-4 mr-2" />
                         Add to Cart
                    </Button>
                    <div onClick={(e) => e.preventDefault()}>
                        <QuickView product={product} /> 
                    </div>
                </div>
            )}
        </Link>
        
        {/* Details */ }
        <div className="space-y-1">
             <div className="flex justify-between items-start gap-2">
                <Link href={`/product/${product.slug || product.id}`} className="group-hover:text-primary transition-colors flex-1">
                    <h3 className="font-medium text-sm lg:text-base leading-tight truncate">{product.name}</h3>
                </Link>
             </div>
             <p className="font-bold text-sm lg:text-base">{formatCurrency(product.price)}</p>
        </div>

         {/* Mobile Actions (Visible below card) */}
        <div className="lg:hidden grid grid-cols-2 gap-2 mt-1">
             <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full h-9 text-xs font-semibold"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
            >
                Add
            </Button>
            <Button 
                size="sm" 
                className="rounded-full h-9 text-xs font-semibold"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
            >
                Buy Now
            </Button>
        </div>
    </motion.div>
  )
}

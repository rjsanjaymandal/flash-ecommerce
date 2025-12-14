'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency } from '@/lib/utils'
import { ShoppingBag, Star, Heart, Zap, Eye } from 'lucide-react'
import { useWishlist } from '@/context/wishlist-context'
import { useCart } from '@/context/cart-context'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

export function ProductCard({ product }: { product: any }) {
  const router = useRouter()
  const { addItem: addToCart } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  
  const isWishlisted = isInWishlist(product.id)
  
  const stock = product.product_stock || []
  const hasMultipleOptions = (product.size_options?.length > 0 || product.color_options?.length > 0)
  
  // Calculate total stock
  const totalStock = stock.reduce((acc: number, item: any) => acc + item.quantity, 0)
  const isOutOfStock = totalStock === 0

  // Get simple price display
  const displayPrice = formatCurrency(product.price)

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
    }
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (hasMultipleOptions) {
        router.push(`/shop/${product.slug}`)
        return
    }

    // Single variant logic (if any) or simplified add
    // For now, if no options properly defined but stock exists, find first Item
    const variant = stock[0]
    if (variant) {
         addToCart({
            id: variant.id, 
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.main_image_url,
            size: variant.size,
            color: variant.color,
            maxQuantity: variant.quantity,
            quantity: 1
        })
        toast.success("Added to bag")
    } else {
         // Fallback to PDP if data is weird
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
            id: variant.id, 
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
  
  return (
    <div className="group relative flex flex-col gap-3">
        {/* Image Container */}
        <Link href={`/product/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden rounded-xl bg-muted/20">
            {/* Badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                 {isOutOfStock && <Badge variant="destructive" className="uppercase tracking-wider text-[10px] font-bold">Out of Stock</Badge>}
                 {!isOutOfStock && product.created_at && new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                     <Badge className="bg-primary text-primary-foreground uppercase tracking-wider text-[10px] font-bold">New</Badge>
                 )}
            </div>

            {/* Wishlist Button */}
             <button
                onClick={handleWishlistClick}
                className={cn(
                    "absolute top-3 right-3 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-all duration-300 hover:scale-110 shadow-sm",
                    isWishlisted ? "text-red-500 bg-red-50/90" : "text-muted-foreground hover:text-foreground"
                )}
            >
                <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
            </button>

            {/* Main Image */}
            <img 
                src={product.main_image_url || '/placeholder.jpg'} 
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700 wille-change-transform group-hover:scale-105"
            />

            {/* Action Bar Overlay */}
            {!isOutOfStock && (
                <div className="absolute inset-x-4 bottom-4 grid grid-cols-2 gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out z-20">
                    <Button 
                        size="sm" 
                        variant="secondary"
                        className="h-9 w-full rounded-lg bg-background/90 hover:bg-background text-foreground backdrop-blur-md shadow-lg font-medium text-xs transition-transform active:scale-95"
                        onClick={handleQuickAdd}
                    >
                        {hasMultipleOptions ? <Eye className="h-3.5 w-3.5 mr-1.5"/> : <ShoppingBag className="h-3.5 w-3.5 mr-1.5"/>}
                        {hasMultipleOptions ? "View" : "Add"}
                    </Button>
                    <Button 
                        size="sm" 
                        className="h-9 w-full rounded-lg shadow-lg font-medium text-xs transition-transform active:scale-95"
                        onClick={handleBuyNow}
                    >
                         <Zap className="h-3.5 w-3.5 mr-1.5 fill-current" />
                         Buy
                    </Button>
                </div>
            )}
        </Link>
        
        {/* Details */}
        <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
                 <Link href={`/product/${product.slug}`} className="hover:underline">
                    <h3 className="font-medium text-base leading-tight truncate-2-lines text-foreground/90 group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                </Link>
            </div>
            
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                    {displayPrice}
                </p>
                {/* Simulated Rating for aesthetic */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>4.8</span>
                </div>
            </div>
        </div>
    </div>
  )
}

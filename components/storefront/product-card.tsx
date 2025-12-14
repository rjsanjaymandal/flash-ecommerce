'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency } from '@/lib/utils'
import { ShoppingBag, Star, Heart } from 'lucide-react'
import { useCart } from '@/context/cart-context'
import { toast } from 'sonner'

export function ProductCard({ product }: { product: any }) {
  const { addItem } = useCart()
  const stock = product.product_stock || []
  const hasMultipleOptions = (product.size_options?.length > 1 || product.color_options?.length > 1)
  
  const firstVariant = stock.find((s: any) => s.quantity > 0)
  const isOutOfStock = !firstVariant

  // Amazon-style Price Formatting
  const [dollars, cents] = product.price.toString().split('.')

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault() 
    if (isOutOfStock) return

    if (hasMultipleOptions) {
        return
    }

    addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.main_image_url,
        size: firstVariant.size,
        color: firstVariant.color,
        quantity: 1,
        maxQuantity: firstVariant.quantity
    })
    toast.success('Added to cart')
  }

  return (
    <Link 
        href={`/product/${product.slug}`}
        className="group flex flex-col h-full bg-card rounded-xl overflow-hidden border border-border/40 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 hover:border-primary/20"
    >
        {/* Image Area */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted/20">
            {product.main_image_url ? (
                <img 
                    src={product.main_image_url} 
                    alt={product.name}
                    className={cn(
                        "h-full w-full object-cover transition-transform duration-700 group-hover:scale-105",
                        isOutOfStock && "opacity-60 grayscale"
                    )}
                />
            ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
            )}
            
            {/* Overlay Gradient (Subtle) */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Top Right Actions */}
            <button 
                className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-red-500 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-[-10px] group-hover:translate-y-0"
                onClick={(e) => {
                    e.preventDefault()
                    toast.success("Added to wishlist")
                }}
            >
                <Heart className="h-4 w-4" />
            </button>
            
            {/* Badges */}
             <div className="absolute top-3 left-3 flex flex-col gap-2">
                {isOutOfStock ? (
                   <span className="bg-black/80 backdrop-blur-md text-white px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-sm">
                        Sold Out
                    </span>
                ) : product.price < 50 && (
                     <span className="bg-red-500/90 backdrop-blur-md text-white px-2 py-1 text-[10px] font-bold tracking-widest uppercase rounded-sm">
                        Sale
                    </span>
                )}
            </div>

            {/* Quick Add (Slide Up on Hover) */}
            <div className="absolute bottom-4 inset-x-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10">
                {!hasMultipleOptions && !isOutOfStock ? (
                    <Button 
                        onClick={handleQuickAdd}
                        className="w-full bg-white text-black hover:bg-gray-100 font-bold tracking-wide shadow-lg rounded-full"
                    >
                        <ShoppingBag className="mr-2 h-4 w-4" /> Quick Add
                    </Button>
                ) : (
                    <Button 
                        variant="secondary"
                        className="w-full bg-white/90 backdrop-blur text-black hover:bg-white font-bold tracking-wide shadow-lg rounded-full"
                    >
                        {isOutOfStock ? 'Notify Me' : 'View Options'}
                    </Button>
                )}
            </div>
        </div>

        {/* Minimalist Info Block */}
        <div className="flex flex-col p-4 space-y-1.5 bg-card z-20 relative">
            
            <div className="flex justify-between items-start gap-4">
                 <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                    {product.name}
                </h3>
                <div className="flex items-baseline gap-0.5 text-foreground font-bold shrink-0">
                    <span className="text-xs">₹</span>
                    <span className="text-lg">{dollars}</span>
                    {cents && <span className="text-[10px] align-top">{cents}</span>}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground capitalize">{product.categories?.name || 'Collection'}</p>
                
                 {/* Subtle Rating */}
                 <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    <span className="text-xs font-medium text-muted-foreground">4.8</span>
                </div>
            </div>
        </div>
    </Link>
  )
}

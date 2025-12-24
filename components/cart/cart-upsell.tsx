'use client'

import { useQuery } from "@tanstack/react-query"
import { getUpsellProducts } from "@/app/actions/cart-upsell"
import { useCartStore } from "@/store/use-cart-store"
import { Loader2, Plus, ShoppingBag } from "lucide-react"
import NextImage from "next/image"
import imageLoader from "@/lib/image-loader"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { toast } from "sonner"

export function CartUpsell() {
    const cartItems = useCartStore((state) => state.items)
    const addItem = useCartStore((state) => state.addItem)

    // Extract unique category IDs from cart items to pass to upsell engine
    // Since we don't have categoryId in cartItems, we'll suggest based on items or just use general trending
    // Extract unique category IDs from cart items
    const categoryIds = Array.from(new Set(cartItems.map(i => i.categoryId).filter(Boolean))) as string[]

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['cart-upsell', categoryIds.join(',')], 
        queryFn: () => getUpsellProducts(categoryIds, cartItems.map(i => i.productId)),
        staleTime: 1000 * 60 * 5 
    })

    // Filter out items already in cart
    const upsellItems = products.filter(
        p => !cartItems.some(ci => ci.productId === p.id)
    )

    if (isLoading) return <div className="py-4 text-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin mx-auto"/></div>
    if (upsellItems.length === 0) return null

    const handleQuickAdd = (product: any) => {
        // Default to first variant if available, otherwise just add product
        // Note: For complex products with sizes, this simplified logic assumes a default or asks user to choose.
        // For a seamless "Upsell", ideal for accessories (One Size).
        // Safest approach: If it has variants, we ideally redirect or open quick view.
        // Here, we'll try to find a safe default (e.g., first One Size or M)
        const hasVariants = product.product_stock && product.product_stock.length > 0
        
        let size = 'OS'
        let color = 'Default'
        let maxQty = 99

        if (hasVariants) {
            const variant = product.product_stock[0]
            size = variant.size
            color = variant.color
            maxQty = variant.quantity
        }
        
        addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.main_image_url,
            quantity: 1,
            size,
            color,
            maxQuantity: maxQty,
            slug: product.slug
        })
        toast.success(`Added ${product.name}`)
    }

    return (
        <div className="space-y-3 py-4 border-t border-dashed border-border/50">
            <h3 className="text-xs font-black uppercase tracking-widest px-1 text-muted-foreground">
                Don't Miss Out
            </h3>
            
            <div className="flex gap-3 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide snap-x">
                {upsellItems.slice(0, 6).map((product) => (
                    <motion.div 
                        key={product.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="snap-start shrink-0 w-32 group relative"
                    >
                        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-secondary/5 border border-border/40 relative mb-2 group/img">
                             {product.main_image_url ? (
                                <NextImage 
                                    loader={imageLoader}
                                    src={product.main_image_url} 
                                    alt={product.name} 
                                    fill 
                                    quality={80}
                                    className="object-contain p-2 transition-transform duration-500 group-hover/img:scale-105" 
                                    sizes="128px"
                                />
                             ) : (
                                <div className="h-full w-full flex items-center justify-center bg-secondary/10 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">No Image</div>
                             )}
                             
                             <button
                                onClick={() => handleQuickAdd(product)}
                                className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-white text-black shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
                                title="Quick Add"
                             >
                                <Plus className="h-4 w-4" />
                             </button>
                        </div>
                        
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-bold uppercase truncate pr-2 leading-tight">
                                {product.name}
                            </h4>
                            <p className="text-[10px] text-muted-foreground font-mono">
                                {formatCurrency(product.price)}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

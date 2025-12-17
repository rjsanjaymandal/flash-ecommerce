'use client'

import { useWishlistStore } from "@/store/use-wishlist-store"
import { ProductCard } from "@/components/storefront/product-card"
import { Heart } from "lucide-react"

export function WishlistTab() {
    const { items } = useWishlistStore()

    if (items.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed bg-muted/20">
                <div className="h-12 w-12 bg-background rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <Heart className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-1">Your Wishlist is Empty</h3>
                <p className="text-muted-foreground max-w-sm mb-4 text-sm">
                    Save items you love here to check them out later.
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-2 duration-500">
            {items.map((item) => (
                // Reconstruct a minimal product object for ProductCard
                <ProductCard key={item.productId} product={{
                    id: item.productId,
                    name: item.name,
                    price: item.price,
                    main_image_url: item.image,
                    slug: item.slug
                }} />
            ))}
        </div>
    )
}

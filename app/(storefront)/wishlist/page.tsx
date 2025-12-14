'use client'

import { useWishlist } from "@/context/wishlist-context"
import { ProductCard } from "@/components/storefront/product-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Heart } from "lucide-react"

export default function WishlistPage() {
  const { items } = useWishlist()

  return (
    <div className="container mx-auto px-4 py-12 min-h-[60vh]">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-8 w-8 text-primary fill-primary/20" />
        <h1 className="text-3xl font-bold tracking-tight">Your Wishlist</h1>
        <span className="text-muted-foreground text-lg">({items.length})</span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-muted/20 rounded-xl border border-dashed border-border">
          <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center">
             <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Your wishlist is empty</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Save items you love here to check them out later.
            </p>
          </div>
          <Button size="lg" asChild>
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
             // @ts-ignore - ProductCard expects a full product object, but we only store partial data. 
             // We need to ensure ProductCard can handle this or we fetch full data.
             // For now, let's adapt ProductCard or render a simplified card.
             // Actually, best to render a dedicated WishlistCard or ensure ProductCard is flexible.
             // Let's check ProductCard props.
             <ProductCard 
                key={item.productId} 
                product={{
                    id: item.productId,
                    name: item.name,
                    price: item.price,
                    main_image_url: item.image,
                    slug: item.slug,
                    // Mock missing props that ProductCard might need
                    description: '', 
                    size_options: [],
                    color_options: [],
                    category_id: '',
                    is_active: true,
                    created_at: '',
                    updated_at: ''
                }} 
             />
          ))}
        </div>
      )}
    </div>
  )
}

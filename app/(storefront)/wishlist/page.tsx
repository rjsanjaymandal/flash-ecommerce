'use client'

import { useWishlistStore } from "@/store/use-wishlist-store"
import { ProductCard } from "@/components/storefront/product-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Heart, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getProductsByIds } from "@/lib/services/product-service"
import { useEffect, useState } from "react"

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items)
  
  // Get IDs from context
  const productIds = items.map(i => i.productId)

  // Fetch live data
  const { data: products, isLoading } = useQuery({
      queryKey: ['wishlist-products', productIds],
      queryFn: async () => {
          if (productIds.length === 0) return []
          return await getProductsByIds(productIds)
      },
      enabled: productIds.length > 0,
      staleTime: 1000 * 60 // 1 minute
  })

  // Handle Loading
  if (isLoading) {
      return (
          <div className="container mx-auto px-4 py-24 min-h-[60vh] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  // Determine what to show: products from DB or empty
  const hasProducts = products && products.length > 0

  return (
    <div className="container mx-auto px-4 py-12 min-h-[60vh]">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-8 w-8 text-primary fill-primary/20" />
        <h1 className="text-3xl font-bold tracking-tight">Your Wishlist</h1>
        <span className="text-muted-foreground text-lg">({hasProducts ? products.length : 0})</span>
      </div>

      {!hasProducts ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-muted/20 rounded-xl border border-dashed border-border animate-in fade-in zoom-in duration-500">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {products.map((product: any) => (
             <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

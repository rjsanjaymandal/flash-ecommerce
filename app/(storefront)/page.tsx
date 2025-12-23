import { CategoryVibes } from "@/components/storefront/category-vibes"
import { getRootCategories } from "@/lib/services/category-service"
import { NewsletterSection } from "@/components/marketing/newsletter-section"
import { AsyncFeaturedGrid } from "@/components/storefront/async-featured-grid"
import { AsyncPersonalizedPicks } from "@/components/storefront/async-personalized-picks"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export const revalidate = 60
// Force rebuild

function GridSkeleton() {
    return (
        <div className="container mx-auto px-4 py-16">
             <div className="flex flex-col items-center text-center mb-12 space-y-4">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-3">
                        <Skeleton className="aspect-3/4 rounded-xl" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                ))}
            </div>
        </div>
    )
}

import { HeroCarousel } from "@/components/storefront/hero-carousel"
import { createClient } from "@/lib/supabase/client" // Need server client logic locally or import service

// Helper to fetch Hero Products
async function getHeroProducts() {
  const supabase = createClient()
  // Fetch active products with their stock
  const { data } = await supabase
    .from('products')
    .select('*, product_stock(quantity)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(20) // Fetch more to filter down

  if (!data) return []

  // Filter for products that actually have stock
  // and limit to 5
  return data
    .filter(p => {
        const totalStock = p.product_stock?.reduce((sum: number, s: any) => sum + s.quantity, 0) || 0
        return totalStock > 0
    })
    .slice(0, 5)
}

export default async function Home() {
  const categories = await getRootCategories(4)
  const heroProducts = await getHeroProducts()

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-black selection:text-white pb-12">
      
      {/* 1. HERO CAROUSEL (Dynamic) */}
      <HeroCarousel products={heroProducts} />

      {/* 2. SHOP BY CATEGORY (Fast/Cached) */}
      <CategoryVibes categories={categories || []} />

      {/* 4. FEATURED PRODUCTS (New Arrivals) - Streamed */}
      <Suspense fallback={<GridSkeleton />}>
        <AsyncFeaturedGrid />
      </Suspense>

      {/* 5. PERSONALIZED PICKS - Streamed */}
      <Suspense fallback={<GridSkeleton />}>
        <AsyncPersonalizedPicks />
      </Suspense>

      {/* 5. NEWSLETTER */}
      <NewsletterSection />

    </div>
  )
}

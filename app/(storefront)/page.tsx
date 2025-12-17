import { Hero } from "@/components/storefront/hero"
import { FeaturedGrid } from "@/components/storefront/featured-grid"
import { CategoryVibes } from "@/components/storefront/category-vibes"
import { Button } from "@/components/ui/button"
import { Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import { getProducts } from "@/lib/services/product-service"
import { getRootCategories } from "@/lib/services/category-service"
import { NewsletterSection } from "@/components/marketing/newsletter-section"

import { PersonalizedPicks } from "@/components/storefront/personalized-picks"

export const revalidate = 60

export default async function Home() {
  const [{ data: products }, { data: picks }, categories] = await Promise.all([
    getProducts({
        is_active: true,
        limit: 8, // Fetch more to share
        sort: 'newest'
    }),
    getProducts({
        is_active: true,
        limit: 4,
        sort: 'random' as any // Assuming service handles or just gets different ones
    }),
    getRootCategories(4)
  ])

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-black selection:text-white pb-12">
      
      {/* 1. HERO SECTION */}
      <Hero />

      {/* 2. SHOP BY CATEGORY (Pick Your Vibe) */}
      <CategoryVibes categories={categories || []} />

      {/* 3. FEATURED GRID */}
      <FeaturedGrid products={products?.slice(0, 4) || []} />

      {/* 4. PERSONALIZED PICKS */}
      <PersonalizedPicks products={picks || []} />

      {/* 5. NEWSLETTER */}
      <NewsletterSection />

    </div>
  )
}

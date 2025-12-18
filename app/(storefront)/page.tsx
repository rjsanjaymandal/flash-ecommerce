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
  const [{ data: products }, { data: picks }, { data: _trending }, categories] = await Promise.all([
    getProducts({
        is_active: true,
        limit: 8,
        sort: 'newest'
    }),
    getProducts({
        is_active: true,
        limit: 4,
        sort: 'random' as any
    }),
    getProducts({
        is_active: true,
        limit: 4,
        sort: 'trending'
    }),
    getRootCategories(4)
  ])

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-black selection:text-white pb-12">
      
      {/* 1. HERO SECTION */}
      <Hero />

      {/* 2. SHOP BY CATEGORY (Pick Your Vibe) */}
      <CategoryVibes categories={categories || []} />

      {/* 4. FEATURED PRODUCTS (New Arrivals) */}
      <FeaturedGrid 
        products={products || []} 
        title="NEW ARRIVALS" 
        subtitle="The latest drops and freshest fits, curated just for you."
        badge="Just In"
      />

      {/* 5. PERSONALIZED PICKS */}
      <PersonalizedPicks products={picks || []} />

      {/* 5. NEWSLETTER */}
      <NewsletterSection />

    </div>
  )
}

import { Hero } from "@/components/storefront/hero"
import { FeaturedGrid } from "@/components/storefront/featured-grid"
import { CategoryVibes } from "@/components/storefront/category-vibes"
import { Button } from "@/components/ui/button"
import { Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import { getProducts } from "@/lib/services/product-service"
import { getRootCategories } from "@/lib/services/category-service"
import { NewsletterSection } from "@/components/marketing/newsletter-section"

export const revalidate = 60

export default async function Home() {
  const [{ data: products }, categories] = await Promise.all([
    getProducts({
        is_active: true,
        limit: 4,
        sort: 'newest'
    }),
    getRootCategories(4)
  ])

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-black selection:text-white">
      
      {/* 1. NEW HERO SECTION */}
      <Hero />

      {/* 2. SHOP BY CATEGORY (Pick Your Vibe) */}
      <CategoryVibes categories={categories || []} />

      {/* 3. FEATURED GRID */}
      <FeaturedGrid products={products || []} />

      {/* 4. NEWSLETTER */}
      <NewsletterSection />

    </div>
  )
}

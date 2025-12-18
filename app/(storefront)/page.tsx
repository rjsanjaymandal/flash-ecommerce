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
  const [{ data: products }, { data: picks }, { data: trending }, categories] = await Promise.all([
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

      {/* 3. FEATURED GRID */}
      <FeaturedGrid products={products?.slice(0, 4) || []} />

      {/* 4. TRENDING NOW (Dynamic Bestsellers) */}
      {trending && trending.length > 0 && (
          <section className="py-24 bg-zinc-50/50">
              <div className="container mx-auto px-4">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                      <div className="space-y-4">
                          <span className="text-primary font-black tracking-[0.4em] uppercase text-[10px]">What's Hot</span>
                          <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.8] italic">
                              TRENDING <span className="text-gradient">NOW</span>
                          </h2>
                      </div>
                      <Button asChild variant="link" className="text-foreground font-black uppercase tracking-widest group">
                          <Link href="/shop?sort=trending" className="flex items-center gap-2">
                              View All Trends <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Link>
                      </Button>
                  </div>
                  <FeaturedGrid products={trending} />
              </div>
          </section>
      )}

      {/* 5. PERSONALIZED PICKS */}
      <PersonalizedPicks products={picks || []} />

      {/* 5. NEWSLETTER */}
      <NewsletterSection />

    </div>
  )
}

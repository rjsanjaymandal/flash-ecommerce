import { Hero } from "@/components/storefront/hero"
import { FeaturedGrid } from "@/components/storefront/featured-grid"
import { CategoryVibes } from "@/components/storefront/category-vibes"
import { Button } from "@/components/ui/button"
import { Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import { getProducts } from "@/lib/services/product-service"
import { getRootCategories } from "@/lib/services/category-service"

export const revalidate = 60

export default async function Home() {
  const [products, categories] = await Promise.all([
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
      <section className="py-24 container mx-auto px-4 text-center border-t border-border">
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-linear-to-r from-red-100 via-orange-100 to-blue-100 mb-4 animate-pulse">
               <Star className="h-6 w-6 text-orange-500 fill-orange-500" />
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
                STYLING IS <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-blue-600">
                    MY SUPERPOWER
                </span>
            </h2>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                Join our community and get exclusive access to new drops, events, and styling tips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto pt-8">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full w-full bg-foreground text-background hover:bg-foreground/90">
                    Get Started
                </Button>
            </div>
        </div>
      </section>

    </div>
  )
}

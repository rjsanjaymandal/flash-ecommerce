import { getRootCategories } from "@/lib/services/category-service";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

// Lazy load non-ATF (Above The Fold) components
const CategoryVibes = dynamic(() =>
  import("@/components/storefront/category-vibes").then(
    (mod) => mod.CategoryVibes,
  ),
);
const NewsletterSection = dynamic(() =>
  import("@/components/marketing/newsletter-section").then(
    (mod) => mod.NewsletterSection,
  ),
);
const AsyncFeaturedGrid = dynamic(() =>
  import("@/components/storefront/async-featured-grid").then(
    (mod) => mod.AsyncFeaturedGrid,
  ),
);
const AsyncPersonalizedPicks = dynamic(() =>
  import("@/components/storefront/async-personalized-picks").then(
    (mod) => mod.AsyncPersonalizedPicks,
  ),
);
const BlueprintSection = dynamic(() =>
  import("@/components/storefront/blueprint-section").then(
    (mod) => mod.BlueprintSection,
  ),
);
const SeoContent = dynamic(() =>
  import("@/components/storefront/seo-content").then((mod) => mod.SeoContent),
);

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
  );
}

import {
  getFeaturedProducts,
  getProducts,
  type Product,
} from "@/lib/services/product-service";
import { getSmartCarouselData } from "@/lib/data/get-smart-carousel";
import {
  HeroCarousel,
  type HeroProduct,
} from "@/components/storefront/hero-carousel";

// Cache for 15 minutes (900 seconds) as requested
export const revalidate = 900;

export default async function Home() {
  const categories = await getRootCategories(4);

  let heroProducts: HeroProduct[] = [];
  try {
    heroProducts = await getSmartCarouselData();
  } catch (error) {
    console.error("[Home] Failed to fetch carousel data:", error);
  }

  // Fetch Random Product for Blueprint Section (Dynamic from Carousel)
  let blueprintProduct = null;
  if (heroProducts.length > 0) {
    const randomIndex = Math.floor(Math.random() * heroProducts.length);
    blueprintProduct = heroProducts[randomIndex];
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground pb-12">
      {/* SEO H1: Anime Streetwear Primary Keyword */}
      <h1 className="sr-only">
        FlashhFashion | Flash Fashion India - Anime Streetwear & Gender-Neutral
        Clothing
      </h1>

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

      {/* 5.5. THE BLUEPRINT (Quality Tech Specs) */}
      <BlueprintSection product={blueprintProduct} />

      {/* 6. SEO CONTENT (Why Choose Us) */}
      <SeoContent />

      {/* 7. NEWSLETTER */}
      <NewsletterSection />
    </div>
  );
}

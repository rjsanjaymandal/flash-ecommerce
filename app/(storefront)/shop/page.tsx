import { getLinearCategories } from "@/lib/services/category-service";
import { ShopFilters } from "@/components/storefront/shop-filters";
import { ShopHeader } from "@/components/storefront/shop-header";
import { ProductGrid } from "@/components/storefront/product-grid";
import { ProductGridSkeleton } from "@/components/skeletons/product-grid-skeleton"; // Static import verified
import { CategoryDiscoveryBar } from "@/components/storefront/category-discovery-bar";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { Suspense } from "react";

// Force dynamic to ensure stock status is always fresh for the user
export const dynamic = "force-dynamic";

export const metadata = {
  title:
    "Shop All | Premium Minimalist Streetwear & Japanese Aesthetics | FLASH",
  description:
    "Explore the complete FLASH collection. Premium anime streetwear, Japanese-inspired heavyweight t-shirts, and minimalist luxury essentials. High-quality prints and tech fabrics designed in India.",
  alternates: {
    canonical: "https://flashhfashion.in/shop",
  },
};

export default async function ShopPage(props: {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
    size?: string;
    color?: string;
    q?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const categories = await getLinearCategories(true);

  return (
    <div className="min-h-screen bg-background pt-4 pb-20">
      <BreadcrumbJsonLd
        items={[
          {
            name: "Home",
            item:
              process.env.NEXT_PUBLIC_SITE_URL || "https://flashhfashion.in",
          },
          {
            name: "Shop",
            item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://flashhfashion.in"}/shop`,
          },
        ]}
      />
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header Section */}
        <ShopHeader />

        {/* Quick Discovery Bar */}
        <CategoryDiscoveryBar categories={categories || []} />

        {/* Filters & Grid Layout */}
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 relative">
          {/* Filters Sidebar Component */}
          <Suspense fallback={<div className="w-72 hidden md:block" />}>
            <ShopFilters categories={categories || []} />
          </Suspense>

          {/* Product Grid Area with Suspense Streaming */}
          <Suspense
            key={JSON.stringify(searchParams)}
            fallback={<ProductGridSkeleton />}
          >
            <ProductGrid params={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

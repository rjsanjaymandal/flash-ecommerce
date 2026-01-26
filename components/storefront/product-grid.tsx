import { getProducts } from "@/lib/services/product-service";
import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";
import { ItemListJsonLd } from "@/components/seo/item-list-json-ld";

interface ProductGridProps {
  products: any[];
  params: any;
}

// We split this into a component, but keeping the fetch logic *inside* it makes it easier to suspend
export async function ProductGrid({ params }: { params: any }) {
  const { data: products } = await getProducts({
    is_active: true,
    category_id: params.category,
    sort: params.sort,
    min_price: params.min_price ? Number(params.min_price) : undefined,
    max_price: params.max_price ? Number(params.max_price) : undefined,
    size: params.size,
    color: params.color,
    search: params.q,
  });

  const itemListItems =
    products?.map((p) => ({
      name: p.name,
      image: p.main_image_url || "",
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${p.slug}`,
      price: p.price,
      currency: "INR",
    })) || [];

  return (
    <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {itemListItems.length > 0 && <ItemListJsonLd products={itemListItems} />}
      {/* Secondary Toolbar (Sort) */}
      <div className="flex flex-wrap gap-2 items-center justify-between mb-8 pb-4 border-b border-border/40">
        <p className="text-sm font-bold text-foreground">
          {products?.length || 0} ITEMS
        </p>
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 no-scrollbar mask-gradient-right">
          <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground mr-2 hidden sm:inline-block shrink-0">
            Sort By
          </span>
          <Link
            href={{ query: { ...params, sort: "trending" } }}
            className="shrink-0"
          >
            <Button
              variant={params.sort === "trending" ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-8 rounded-full text-xs font-bold transition-all",
                params.sort === "trending" &&
                  "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md",
              )}
            >
              Trending
            </Button>
          </Link>
          <Link
            href={{ query: { ...params, sort: undefined } }}
            className="shrink-0"
          >
            <Button
              variant={!params.sort ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-8 rounded-full text-xs font-bold transition-all",
                !params.sort &&
                  "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md",
              )}
            >
              Newest
            </Button>
          </Link>
          <Link
            href={{ query: { ...params, sort: "price_asc" } }}
            className="shrink-0"
          >
            <Button
              variant={params.sort === "price_asc" ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-8 rounded-full text-xs font-bold transition-all",
                params.sort === "price_asc" &&
                  "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md",
              )}
            >
              Price Low
            </Button>
          </Link>
          <Link
            href={{ query: { ...params, sort: "price_desc" } }}
            className="shrink-0"
          >
            <Button
              variant={params.sort === "price_desc" ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-8 rounded-full text-xs font-bold transition-all",
                params.sort === "price_desc" &&
                  "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md",
              )}
            >
              Price High
            </Button>
          </Link>
          <Link
            href={{ query: { ...params, sort: "random" } }}
            className="shrink-0"
          >
            <Button
              variant={params.sort === "random" ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-8 rounded-full text-xs font-bold transition-all",
                params.sort === "random" &&
                  "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md",
              )}
            >
              Shuffle
            </Button>
          </Link>
        </div>
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
          {products.map((product: any, index: number) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 4}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-dashed border-border bg-muted/20">
          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <SlidersHorizontal className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-black mb-2 tracking-tight">
            No matches found
          </h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            We couldn&apos;t find any products matching your current filters.
          </p>
          <Button asChild className="rounded-full font-bold px-8">
            <Link href="/shop">Clear All Filters</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

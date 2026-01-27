import { getProducts } from "@/lib/services/product-service";
import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";
import { ItemListJsonLd } from "@/components/seo/item-list-json-ld";
import { ProductList } from "./product-list";

interface ShopParams {
  category?: string;
  sort?: string;
  min_price?: string;
  max_price?: string;
  size?: string;
  color?: string;
  q?: string;
}

export async function ProductGrid({ params }: { params: ShopParams }) {
  console.log("[ProductGrid] Params:", params);
  const { data: products } = await getProducts({
    is_active: true,
    category_id: params.category,
    sort: params.sort as any,
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
    <div className="flex-1 min-w-0">
      {itemListItems.length > 0 && <ItemListJsonLd products={itemListItems} />}

      {/* Secondary Toolbar (Sort) */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between mb-10 pb-6 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <p className="text-xs font-black uppercase tracking-widest text-foreground/70">
            {products?.length || 0} Artifacts Found
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 no-scrollbar">
          <span className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground mr-2 shrink-0">
            Sort
          </span>
          <div className="flex bg-muted/30 p-1 rounded-full border border-border/40 backdrop-blur-sm">
            {[
              { id: "trending", label: "Trending" },
              { id: undefined, label: "Newest" },
              { id: "price_asc", label: "Price Low" },
              { id: "price_desc", label: "Price High" },
              { id: "random", label: "Shuffle" },
            ].map((option) => (
              <Link
                key={option.label}
                href={{ query: { ...params, sort: option.id } }}
                className="shrink-0"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 px-4 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all duration-300 border-none",
                    params.sort === option.id || (!params.sort && !option.id)
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-transparent",
                  )}
                >
                  {option.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {products && products.length > 0 ? (
        <ProductList products={products} />
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

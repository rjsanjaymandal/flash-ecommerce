"use client";

import { useState } from "react";
import { ProductList } from "./product-list";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { fetchMoreProducts } from "@/app/actions/product-grid-actions";
import { Product } from "@/lib/services/product-service";
import { ItemListJsonLd } from "@/components/seo/item-list-json-ld";

interface PaginatedProductGridProps {
  initialProducts: Product[];
  initialMeta: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
  searchParams: any;
}

export function PaginatedProductGrid({
  initialProducts,
  initialMeta,
  searchParams,
}: PaginatedProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(page < initialMeta.totalPages);

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const nextPage = page + 1;

    try {
      const result = await fetchMoreProducts(nextPage, searchParams);

      if (result.success && result.data) {
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newProducts = result.data.filter(
            (p: Product) => !existingIds.has(p.id),
          );
          return [...prev, ...newProducts];
        });
        setPage(nextPage);
        setHasMore(nextPage < result.meta.totalPages);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more products:", error);
    } finally {
      setLoading(false);
    }
  };

  const itemListItems = products.map((p) => ({
    name: p.name,
    image: p.main_image_url || "",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${p.slug}`,
    price: p.price,
    currency: "INR",
  }));

  return (
    <div className="space-y-12">
      <ItemListJsonLd products={itemListItems} />
      <ProductList products={products} />

      {hasMore && (
        <div className="flex justify-center pt-8 border-t border-border/40">
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            size="lg"
            className="rounded-none uppercase tracking-[0.2em] font-bold px-12 py-6 md:py-3 w-full md:w-auto min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

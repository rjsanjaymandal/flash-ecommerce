"use client";

import { useEffect, useState, useRef } from "react";
import { Product } from "@/lib/services/product-service";
import { getUpsellProducts } from "@/app/actions/cart-upsell";
import { ProductCard } from "@/components/storefront/product-card";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface RecommendedProductsProps {
  categoryId: string;
  currentProductId: string;
  title?: string;
}

export function RecommendedProducts({
  categoryId,
  currentProductId,
  title = "Complete The Look",
}: RecommendedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      setLoading(true);
      try {
        // Fetch upsell products for this category, excluding the current product
        const results = await getUpsellProducts(
          [categoryId],
          [currentProductId]
        );
        setProducts(results.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
      }
    }

    if (categoryId) {
      fetchRecommendations();
    }
  }, [categoryId, currentProductId]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="mt-24 mb-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-foreground">
            {title}
          </h2>
          <div className="h-px flex-1 bg-border/50 ml-6 hidden sm:block" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            : products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <ProductCard product={product as any} />
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}

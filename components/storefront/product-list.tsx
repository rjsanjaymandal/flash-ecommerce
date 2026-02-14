import { motion } from "framer-motion";
import { ProductCard } from "@/components/storefront/product-card";
import { useRealTimeGrid } from "@/hooks/use-real-time-grid";
import { useMemo } from "react";

interface ProductListProps {
  products: any[];
}

export function ProductList({ products }: ProductListProps) {
  const productIds = useMemo(() => products.map((p) => p.id), [products]);
  const initialStocks = useMemo(() => {
    const stocks: Record<string, any[]> = {};
    products.forEach((p) => {
      stocks[p.id] = p.product_stock || [];
    });
    return stocks;
  }, [products]);

  // Unified subscription for all products in this list
  useRealTimeGrid(productIds, initialStocks);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16"
    >
      {products.map((product: any, index: number) => (
        <motion.div
          key={product.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0 },
          }}
        >
          <ProductCard product={product} priority={index < 4} />
        </motion.div>
      ))}
    </motion.div>
  );
}

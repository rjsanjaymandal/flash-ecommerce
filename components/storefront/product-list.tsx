"use client";

import { motion } from "framer-motion";
import { ProductCard } from "@/components/storefront/product-card";

interface ProductListProps {
  products: any[];
}

export function ProductList({ products }: ProductListProps) {
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
      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16"
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

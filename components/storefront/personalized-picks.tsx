"use client";

import { motion } from "framer-motion";
import { ProductCard } from "./product-card";
import { Sparkles } from "lucide-react";
import { BrandGlow } from "./brand-glow";
import { BrandBadge } from "./brand-badge";

export function PersonalizedPicks({ products }: { products: any[] }) {
  if (!products?.length) return null;

  return (
    <section className="py-24 bg-muted overflow-hidden relative">
      <BrandGlow
        className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        size="lg"
      />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-16 gap-4">
          <BrandBadge
            variant="primary"
            className="animate-bounce-slow flex items-center gap-2"
          >
            <Sparkles className="h-3 w-3 text-primary" />
            Tailored for You
          </BrandBadge>
          <h2 className="text-4xl md:text-8xl font-black tracking-tighter text-foreground leading-[0.8] uppercase italic">
            PICKED{" "}
            <span className="text-gradient drop-shadow-[0_0_30px_rgba(var(--primary),0.3)]">
              JUST
            </span>{" "}
            FOR YOU
          </h2>
          <p className="text-muted-foreground text-sm md:text-base font-medium tracking-wide max-w-sm mt-2">
            Based on your recent activity and style preferences.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                delay: index * 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

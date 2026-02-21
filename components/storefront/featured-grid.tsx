"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ProductCard } from "./product-card";
import { BrandGlow } from "./brand-glow";
import { BrandBadge } from "./brand-badge";

export function FeaturedGrid({
  products,
  title = "TRENDING NOW",
  subtitle = "The most coveted pieces from our latest collection.",
  badge = "What's Hot",
}: {
  products: any[];
  title?: string;
  subtitle?: string;
  badge?: string;
}) {
  return (
    <section className="py-8 md:py-16 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      <div className="flex flex-col items-center text-center gap-6 mb-8 md:mb-12 relative z-10">
        <BrandBadge variant="outline">{badge}</BrandBadge>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-foreground leading-[0.9] uppercase italic text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/70">
            {title}
          </h2>
          {/* Decorative stroke/shadow text if desired, or keep clean */}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-6"
        >
          <p className="text-muted-foreground text-sm md:text-base font-medium tracking-wide max-w-lg mx-auto">
            {subtitle}
          </p>
          <Link
            href="/shop"
            className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b border-foreground/20 pb-1 hover:border-foreground transition-all"
          >
            View All Products
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </motion.div>
      </div>

      {/* Mobile: Horizontal Scroll | Desktop: Grid */}
      <div className="flex overflow-x-auto snap-x snap-mandatory lg:grid lg:grid-cols-4 gap-4 md:gap-8 pb-8 lg:pb-0 px-4 md:px-0 -mx-4 md:mx-0 scrollbar-hide">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            className="min-w-[200px] w-[45vw] lg:w-auto shrink-0 snap-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
          >
            <ProductCard product={product} priority={index < 2} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

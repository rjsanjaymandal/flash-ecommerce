"use client";

import Link from "next/link";
import FlashImage from "@/components/ui/flash-image";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandBadge } from "./brand-badge";
import Marquee from "@/components/ui/marquee";

interface Category {
  id: string;
  name: string;
  image_url: string | null;
  slug: string;
}

interface CategoryVibesProps {
  categories: Category[];
}

export function CategoryVibes({ categories }: CategoryVibesProps) {
  if (!categories?.length) return null;

  // Bento Grid Layout Patterns (Desktop)
  const getGridClass = (index: number) => {
    // Pattern: Big Large (2x2) -> Tall (1x2) -> Wide (2x1) -> Small (1x1)
    const pattern = [
      "md:col-span-2 md:row-span-2", // Hero
      "md:col-span-1 md:row-span-2", // Tall
      "md:col-span-2 md:row-span-1", // Wide
      "md:col-span-1 md:row-span-1", // Standard
    ];
    return pattern[index % pattern.length];
  };

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* BACKGROUND MARQUEE */}
      <div className="absolute top-20 left-0 right-0 opacity-[0.03] pointer-events-none select-none z-0">
        <Marquee className="[--duration:60s] [--gap:2rem]" reverse>
          <span className="text-[12rem] font-black italic tracking-tighter mx-8">
            PICK YOUR VIBE
          </span>
          <span className="text-[12rem] font-black italic tracking-tighter mx-8 text-stroke-2">
            UNAPOLOGETIC
          </span>
          <span className="text-[12rem] font-black italic tracking-tighter mx-8">
            BOLD
          </span>
        </Marquee>
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="flex flex-col items-start gap-4 mb-12">
          <BrandBadge
            variant="primary"
            className="mb-2 shadow-lg shadow-primary/20"
          >
            <Sparkles className="w-3 h-3 mr-1" /> The Collections
          </BrandBadge>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-8xl font-black tracking-tighter text-foreground leading-[0.85] uppercase italic"
          >
            PICK YOUR <span className="text-gradient">VIBE</span>
          </motion.h2>
        </div>

        {/* DYNAMIC BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 auto-rows-[300px]">
          {/* If we have exactly 3 categories, use a 6-3-3 split or 8-4 split structure */}
          {/* Current Logic: Just map and let CSS Grid flow, but with specific spans */}

          {categories.map((cat, i) => {
            // Dynamic Spanning Logic
            let spanClass = "md:col-span-3 md:row-span-1"; // Default small

            if (categories.length === 3) {
              // Layout for 3 items: Large Left (6), Stacked Right (6 split -> 6 top, 6 bottom? No. 6, 6, 6 doesn't fit 12 grid if 3 items)
              // Row 1: Item 1 (8 cols) | Item 2 (4 cols)
              // Row 2: Item 3 (4 cols) | View All (8 cols)

              if (i === 0) spanClass = "md:col-span-8 md:row-span-2";
              else if (i === 1) spanClass = "md:col-span-4 md:row-span-1";
              else if (i === 2) spanClass = "md:col-span-4 md:row-span-1";
            } else {
              // Fallback pattern
              const pattern = [
                "md:col-span-6 md:row-span-2", // Large
                "md:col-span-3 md:row-span-1",
                "md:col-span-3 md:row-span-1",
              ];
              spanClass =
                pattern[i % pattern.length] || "md:col-span-3 md:row-span-1";
            }

            return (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.id}`}
                className={cn(
                  "group relative overflow-hidden rounded-[2rem] bg-zinc-900 border border-white/10 transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10",
                  "min-h-[300px] md:min-h-0",
                  spanClass,
                )}
              >
                {/* IMAGE */}
                {cat.image_url ? (
                  <div className="absolute inset-0 overflow-hidden">
                    <FlashImage
                      src={cat.image_url}
                      alt={cat.name}
                      fill
                      resizeMode="cover"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                    <span className="text-8xl opacity-10 font-black grayscale">
                      ⚡
                    </span>
                  </div>
                )}

                {/* CONTENT */}
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <h3 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase italic leading-[0.9] mb-2 drop-shadow-lg">
                      {cat.name}
                    </h3>

                    <div className="flex items-center gap-2 text-white/80 group-hover:text-primary transition-colors duration-300">
                      <span className="text-xs font-bold uppercase tracking-widest hidden md:inline-block">
                        Shop Now
                      </span>
                      <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* "VIEW ALL" TILE */}
          <Link
            href="/shop"
            className={cn(
              "group relative overflow-hidden rounded-[2rem] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center p-6 text-center hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors",
              categories.length === 3
                ? "md:col-span-8 md:row-span-1"
                : "md:col-span-3 md:row-span-1",
            )}
          >
            <div className="relative z-10 flex items-center gap-4">
              <span className="text-xl font-black uppercase tracking-wider">
                View All Collections
              </span>
              <ArrowUpRight className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

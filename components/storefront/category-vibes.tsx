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

        {/* BENTO GRID (Desktop) / SNAP SCROLL (Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:auto-rows-[300px] gap-4 md:gap-6">
          {categories.slice(0, 5).map((cat, i) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.id}`}
              className={cn(
                "group relative overflow-hidden rounded-[2rem] bg-zinc-900 border border-white/10 transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10",
                "min-h-[400px] md:min-h-0", // Mobile Height
                getGridClass(i),
              )}
            >
              {/* IMAGE HOVER EFFECT */}
              {cat.image_url && (
                <div className="absolute inset-0 overflow-hidden">
                  <FlashImage
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    resizeMode="cover"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                </div>
              )}

              {/* CONTENT */}
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  {/* Dynamic Badge (Simulated) */}
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                      New Drop
                    </span>
                  </div>

                  <h3 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase italic leading-[0.9] mb-2 drop-shadow-lg">
                    {cat.name}
                  </h3>

                  <div className="flex items-center gap-2 text-white/80 group-hover:text-primary transition-colors duration-300">
                    <span className="text-xs font-bold uppercase tracking-widest hidden md:inline-block">
                      View Collection
                    </span>
                    <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* "VIEW ALL" TILE (If odd number or to fill grid) */}
          <Link
            href="/shop"
            className="md:col-span-1 md:row-span-1 min-h-[200px] group relative overflow-hidden rounded-[2rem] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center p-6 text-center hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="relative z-10">
              <span className="block text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                👀
              </span>
              <span className="text-lg font-black uppercase tracking-wider">
                View All Collections
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

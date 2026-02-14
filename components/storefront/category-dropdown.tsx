"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import FlashImage from "@/components/ui/flash-image";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
  children?: {
    id: string;
    name: string;
    slug: string;
  }[];
}

interface CategoryDropdownProps {
  categories: Category[];
}

export function CategoryDropdown({ categories }: CategoryDropdownProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount =
        direction === "left" ? -clientWidth / 2 : clientWidth / 2;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="absolute top-full left-[50%] -translate-x-1/2 w-[calc(100vw-2rem)] max-w-7xl pt-4 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out z-[100] hidden lg:block">
      <div className="bg-background/95 backdrop-blur-2xl border border-border/40 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] rounded-[2rem] overflow-hidden p-8 lg:p-10 ring-1 ring-white/10 relative">
        {/* Decorative Gradients */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row gap-12 relative z-10">
          {/* CATEGORY LISTS (LEFT) */}
          <div className="flex-1 min-w-[300px]">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 bg-primary rounded-full" />
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-foreground/50">
                Departments
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-x-10 gap-y-12">
              {categories.slice(0, 4).map((category) => (
                <div key={category.id} className="space-y-4 group/cat">
                  <Link
                    href={`/shop?category=${category.id}`}
                    className="flex items-center justify-between group/header no-underline"
                  >
                    <h4 className="font-serif text-lg text-foreground group-hover/header:text-primary transition-colors duration-300">
                      {category.name}
                    </h4>
                    <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover/header:opacity-100 group-hover/header:translate-x-0 transition-all text-primary duration-300" />
                  </Link>

                  {category.children && category.children.length > 0 && (
                    <div className="flex flex-col gap-2.5">
                      {category.children.slice(0, 4).map((child) => (
                        <Link
                          key={child.id}
                          href={`/shop?category=${child.id}`}
                          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-all duration-300 flex items-center gap-2 group/item"
                        >
                          <span className="w-1 h-1 rounded-full bg-border group-hover/item:bg-primary group-hover/item:scale-150 transition-all" />
                          {child.name}
                        </Link>
                      ))}
                      {category.children.length > 4 && (
                        <Link
                          href={`/shop?category=${category.id}`}
                          className="text-[10px] font-black text-primary/60 hover:text-primary uppercase tracking-widest mt-1 italic transition-colors"
                        >
                          + {category.children.length - 4} More
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-border/40">
              <Link
                href="/shop"
                className="group inline-flex items-center gap-4 py-3 px-6 bg-foreground text-background rounded-full hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                  Explore Full Catalog
                </span>
                <ChevronRight className="h-4 w-4 stroke-[3px] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* DROP-IN CAROUSEL (RIGHT) */}
          <div className="lg:w-[450px] xl:w-[550px] relative">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-foreground/50">
                  Featured Drops
                </h3>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => scroll("left")}
                  disabled={!canScrollLeft}
                  className="p-2 rounded-full border border-border/40 hover:bg-foreground/5 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <button
                  onClick={() => scroll("right")}
                  disabled={!canScrollRight}
                  className="p-2 rounded-full border border-border/40 hover:bg-foreground/5 disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div
              ref={scrollRef}
              onScroll={checkScroll}
              className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
            >
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.id}`}
                  className="relative flex-none w-[240px] xl:w-[280px] aspect-[10/13] rounded-3xl overflow-hidden group/card snap-start"
                >
                  {category.image_url ? (
                    <>
                      <FlashImage
                        src={category.image_url}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover/card:opacity-90" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                      <div className="text-4xl opacity-10 font-black">
                        FLASH
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <p className="text-[10px] font-black text-white/60 mb-1 uppercase tracking-widest italic drop-shadow-md">
                      Collection
                    </p>
                    <h5 className="text-xl font-serif text-white mb-4 drop-shadow-md">
                      {category.name}
                    </h5>
                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center opacity-0 translate-y-4 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-500">
                      <ChevronRight className="h-4 w-4 text-black stroke-[3px]" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import FlashImage from "@/components/ui/flash-image";
import { cn } from "@/lib/utils";
import { ChevronRight, ArrowUpRight } from "lucide-react";

interface CategoryDropdownProps {
  categories: {
    id: string;
    name: string;
    slug: string;
    image_url?: string | null;
    children?: {
      id: string;
      name: string;
      slug: string;
    }[];
  }[];
}

export function CategoryDropdown({ categories }: CategoryDropdownProps) {
  // Split categories for masonry effect if needed, but grid-cols-3 is standard.
  // We'll make the empty-child categories look like cards.

  return (
    <div className="absolute top-full left-0 w-[800px] -translate-x-[200px] pt-4 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 ease-out z-[100]">
      <div className="bg-background/95 backdrop-blur-md border border-border/50 shadow-2xl rounded-2xl overflow-hidden p-8 ring-1 ring-white/10">
        <div className="grid grid-cols-12 gap-8">
          {/* Dynamic Categories Grid */}
          <div className="col-span-9 grid grid-cols-2 gap-x-8 gap-y-10">
            {categories.map((category) => (
              <div key={category.id} className="space-y-3 group/cat">
                <Link
                  href={`/shop?category=${category.id}`}
                  className="flex items-center gap-2 group/header"
                >
                  <h4 className="font-black text-sm uppercase tracking-widest text-foreground group-hover/header:text-primary transition-colors">
                    {category.name}
                  </h4>
                  <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover/header:opacity-100 group-hover/header:translate-x-0 transition-all text-primary" />
                </Link>

                {/* If children exist, list them. If not, show description/CTA */}
                {category.children && category.children.length > 0 ? (
                  <div className="flex flex-col gap-1.5 border-l border-border/50 pl-3">
                    {category.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/shop?category=${child.id}`}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative"
                      >
                        <span className="absolute -left-[13px] top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-border group-hover:bg-primary transition-colors" />
                        {child.name}
                      </Link>
                    ))}
                    <Link
                      href={`/shop?category=${category.id}`}
                      className="text-xs font-bold text-primary mt-2 flex items-center gap-1 hover:underline underline-offset-4"
                    >
                      View All
                    </Link>
                  </div>
                ) : (
                  <div className="border-l border-border/50 pl-3">
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      Explore our premium collection of{" "}
                      {category.name.toLowerCase()}.
                    </p>
                    <Link
                      href={`/shop?category=${category.id}`}
                      className="text-xs font-bold text-foreground bg-secondary/50 hover:bg-primary hover:text-primary-foreground px-3 py-1.5 rounded-full transition-all inline-flex items-center gap-1"
                    >
                      Browse Collection
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Links / Featured Column */}
          <div className="col-span-3 space-y-6 border-l border-border/50 pl-8 flex flex-col">
            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Trending
              </h4>
              <div className="flex flex-col gap-3">
                <Link
                  href="/shop"
                  className="block relative group/card overflow-hidden rounded-lg aspect-[3/2] bg-muted"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/80 to-purple-600/80 mix-blend-multiply transition-opacity group-hover/card:opacity-90" />
                  <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                    <span className="text-white font-black uppercase tracking-widest text-lg drop-shadow-md">
                      New Arrivals
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

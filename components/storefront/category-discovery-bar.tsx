"use client";

import { useQueryState } from "nuqs";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/store-types";

interface CategoryDiscoveryBarProps {
  categories: Category[];
}

export function CategoryDiscoveryBar({
  categories,
}: CategoryDiscoveryBarProps) {
  const [activeCategory, setActiveCategory] = useQueryState("category", {
    shallow: false,
    history: "push",
  });

  return (
    <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-4 no-scrollbar mask-gradient-right">
      <button
        onClick={() => setActiveCategory(null)}
        className={cn(
          "shrink-0 px-6 py-3 rounded-2xl font-black uppercase tracking-tighter italic text-[10px] transition-all border outline-none",
          !activeCategory
            ? "bg-primary text-primary-foreground shadow-[0_10px_20px_rgba(234,88,12,0.2)] border-primary"
            : "bg-muted/30 text-muted-foreground hover:bg-muted/50 border-transparent hover:border-primary/20",
        )}
      >
        All Drops
      </button>
      {categories?.map((c) => (
        <button
          key={c.id}
          onClick={() => setActiveCategory(c.slug)}
          className={cn(
            "shrink-0 px-6 py-3 rounded-2xl font-black uppercase tracking-tighter italic text-[10px] transition-all border outline-none",
            activeCategory === (c.slug || c.id)
              ? "bg-primary text-primary-foreground shadow-[0_10px_20px_rgba(234,88,12,0.2)] border-primary"
              : "bg-muted/30 text-muted-foreground hover:bg-muted/50 border-transparent hover:border-primary/20",
          )}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}

"use client";

import { motion } from "framer-motion";

export function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {/* Image Skeleton */}
      <div className="aspect-2/3 w-full rounded-xl bg-muted/40 animate-pulse border border-border/20" />

      {/* Details Skeleton */}
      <div className="space-y-2 px-0.5">
        <div className="h-4 w-3/4 bg-muted/40 animate-pulse rounded-md" />
        <div className="flex items-center gap-2">
          <div className="h-3 w-12 bg-muted/40 animate-pulse rounded-full" />
          <div className="h-3 w-8 bg-muted/40 animate-pulse rounded-full" />
        </div>
        <div className="h-5 w-1/4 bg-muted/40 animate-pulse rounded-md mt-2" />
      </div>

      {/* Mobile Actions Skeleton (Visible on small screens) */}
      <div className="lg:hidden grid grid-cols-2 gap-2 mt-1">
        <div className="h-9 w-full bg-muted/40 animate-pulse rounded-full" />
        <div className="h-9 w-full bg-muted/40 animate-pulse rounded-full" />
      </div>
    </div>
  );
}

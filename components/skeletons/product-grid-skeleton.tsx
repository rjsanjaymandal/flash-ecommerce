import { Skeleton } from "@/components/ui/skeleton";

export function ProductGridSkeleton() {
  // Skeleton loader for product grid
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/40">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-4 w-20 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-3/4 rounded-none" />
            <div className="space-y-1.5 px-0.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

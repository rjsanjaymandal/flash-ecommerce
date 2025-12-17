import { Skeleton } from "@/components/ui/skeleton"
import { ProductGridSkeleton } from "@/components/skeletons/product-grid-skeleton"

export function ShopPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
       <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Skeleton */}
            <div className="hidden md:block w-64 space-y-8 flex-shrink-0">
                 <div className="space-y-4">
                     <Skeleton className="h-8 w-32" />
                     <Skeleton className="h-4 w-full" />
                     <Skeleton className="h-4 w-full" />
                     <Skeleton className="h-4 w-2/3" />
                 </div>
                 <div className="space-y-4">
                     <Skeleton className="h-8 w-32" />
                     <Skeleton className="h-32 w-full rounded-xl" />
                 </div>
            </div>

            {/* Grid Skeleton */}
            <div className="flex-1 space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32 rounded-full" />
                </div>
                <ProductGridSkeleton />
            </div>
       </div>
    </div>
  )
}

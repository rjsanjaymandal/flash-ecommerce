
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Skeleton (if homepage) or Header Skeleton */}
      <div className="w-full h-[60vh] md:h-[80vh] bg-zinc-100 rounded-3xl mb-12 animate-pulse" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
         {[1, 2, 3].map((i) => (
             <div key={i} className="h-40 rounded-3xl bg-zinc-100 animate-pulse" />
         ))}
      </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                  <Skeleton className="h-[300px] w-full rounded-2xl" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
              </div>
          ))}
       </div>
    </div>
  )
}

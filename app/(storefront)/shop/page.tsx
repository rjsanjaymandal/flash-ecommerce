import { getProducts, ProductFilter } from '@/lib/services/product-service'
import { getLinearCategories } from '@/lib/services/category-service'
import { ProductCard } from '@/components/storefront/product-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ShopFilters } from '@/components/storefront/shop-filters'
import { SlidersHorizontal } from 'lucide-react'

// Force dynamic to ensure stock status is always fresh for the user
export const dynamic = 'force-dynamic'

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    category?: string; 
    sort?: string; 
    min_price?: string; 
    max_price?: string;
    size?: string;
  }>
}) {
  const params = await searchParams
  
  // 1. Fetch Categories for Filters
  const categories = await getLinearCategories()

  // 2. Fetch Products
  const filter: ProductFilter = {
      is_active: true,
      category_id: params.category,
      sort: params.sort as any,
      min_price: params.min_price ? Number(params.min_price) : undefined,
      max_price: params.max_price ? Number(params.max_price) : undefined,
      size: params.size
  }
  const products = await getProducts(filter)

  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center gap-4 mb-16 max-w-2xl mx-auto animate-in slide-in-from-top-4 duration-700">
             <Badge className="px-4 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors uppercase tracking-widest text-xs font-bold border-none">
                New Arrivals
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground">
                THE <span className="text-transparent bg-clip-text bg-linear-to-r from-red-500 via-orange-500 to-primary">COLLECTION</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
                Explore our latest gender-neutral drops. Designed for comfort, styled for impact.
            </p>
        </div>

        {/* Filters & Grid Layout */}
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 relative">
          
            {/* Filters Sidebar Component */}
            <ShopFilters categories={categories || []} />

            {/* Product Grid Area */}
            <div className="flex-1 min-w-0">
                
                {/* Secondary Toolbar (Sort) */}
                <div className="flex flex-wrap gap-2 items-center justify-between mb-8 pb-4 border-b border-border/40">
                    <p className="text-sm font-bold text-foreground">
                        {products?.length || 0} ITEMS
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground mr-2 hidden sm:inline-block">Sort By</span>
                        <Link href={{ query: { ...params, sort: undefined } }}>
                            <Button variant={!params.sort ? "secondary" : "ghost"} size="sm" className={cn("h-8 rounded-full text-xs font-bold", !params.sort && "bg-black text-white hover:bg-zinc-800")}>
                                Newest
                            </Button>
                        </Link>
                        <Link href={{ query: { ...params, sort: 'price_asc' } }}>
                            <Button variant={params.sort === 'price_asc' ? "secondary" : "ghost"} size="sm" className={cn("h-8 rounded-full text-xs font-bold", params.sort === 'price_asc' && "bg-black text-white hover:bg-zinc-800")}>
                                Price Low
                            </Button>
                        </Link>
                        <Link href={{ query: { ...params, sort: 'price_desc' } }}>
                            <Button variant={params.sort === 'price_desc' ? "secondary" : "ghost"} size="sm" className={cn("h-8 rounded-full text-xs font-bold", params.sort === 'price_desc' && "bg-black text-white hover:bg-zinc-800")}>
                                Price High
                            </Button>
                        </Link>
                    </div>
                </div>

                {products && products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                        {products.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-dashed border-border bg-muted/20 animate-in fade-in zoom-in duration-500">
                        <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <SlidersHorizontal className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-black mb-2 tracking-tight">No matches found</h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            We couldn't find any products matching your current filters.
                        </p>
                         <Button asChild className="rounded-full font-bold px-8">
                            <Link href="/shop">Clear All Filters</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}

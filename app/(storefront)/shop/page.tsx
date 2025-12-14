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
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12 pb-8 border-b border-border/40">
            <div className="space-y-4 max-w-2xl">
                 <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground">
                    THE <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-500">COLLECTION</span>
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                    Explore our latest gender-neutral drops. Designed for comfort, styled for impact.
                </p>
            </div>
            
            <div className="flex items-center gap-2 self-start md:self-end">
                 <p className="text-sm font-medium text-muted-foreground">
                    {products?.length || 0} ITEMS
                </p>
            </div>
        </div>

        {/* Filters & Grid Layout */}
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 relative">
          
            {/* Filters Sidebar Component (Handles its own stickiness) */}
            <ShopFilters categories={categories || []} />

            {/* Product Grid Area */}
            <div className="flex-1 min-w-0"> {/* min-w-0 prevents grid blowout */}
                
                {/* Secondary Toolbar (Sort) */}
                <div className="flex flex-wrap gap-2 items-center justify-end mb-6">
                    <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground mr-2">Sort By</span>
                    <Link href={{ query: { ...params, sort: undefined } }}>
                        <Button variant={!params.sort ? "secondary" : "ghost"} size="sm" className="h-8 rounded-full text-xs font-medium">
                            Newest
                        </Button>
                    </Link>
                    <Link href={{ query: { ...params, sort: 'price_asc' } }}>
                        <Button variant={params.sort === 'price_asc' ? "secondary" : "ghost"} size="sm" className="h-8 rounded-full text-xs font-medium">
                            Price: Low to High
                        </Button>
                    </Link>
                    <Link href={{ query: { ...params, sort: 'price_desc' } }}>
                        <Button variant={params.sort === 'price_desc' ? "secondary" : "ghost"} size="sm" className="h-8 rounded-full text-xs font-medium">
                            Price: High to Low
                        </Button>
                    </Link>
                </div>

                {products && products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                        {products.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center rounded-xl border-2 border-dashed border-muted animate-in fade-in zoom-in duration-500">
                        <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                            <SlidersHorizontal className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No matches found</h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            We couldn't find any products matching your current filters.
                        </p>
                         <Button asChild variant="default">
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

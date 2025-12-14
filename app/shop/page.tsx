import { getProducts, ProductFilter } from '@/lib/services/product-service'
import { getLinearCategories } from '@/lib/services/category-service'
import { ProductCard } from '@/components/storefront/product-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ShopFilters } from '@/components/storefront/shop-filters'

export const revalidate = 60

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
    <div className="min-h-screen container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b pb-6">
        <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Shop Collection</h1>
            <p className="text-muted-foreground mt-2 text-lg">
                Explore our latest styles and exclusive drops.
            </p>
        </div>
        
        {/* Sort Options */}
        <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground font-medium mr-2">Sort by:</span>
            <Button variant={!params.sort ? "default" : "outline"} size="sm" className="rounded-full" asChild>
                <Link href={{ query: { ...params, sort: undefined } }}>Newest</Link>
            </Button>
            <Button variant={params.sort === 'price_asc' ? "default" : "outline"} size="sm" className="rounded-full" asChild>
                <Link href={{ query: { ...params, sort: 'price_asc' } }}>Price: Low</Link>
            </Button>
            <Button variant={params.sort === 'price_desc' ? "default" : "outline"} size="sm" className="rounded-full" asChild>
                <Link href={{ query: { ...params, sort: 'price_desc' } }}>Price: High</Link>
            </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Filters (Sidebar / Mobile Mock) */}
        <ShopFilters categories={categories || []} />

        {/* Product Grid */}
        <div className="flex-1">
            {products && products.length > 0 ? (
                <>
                    <p className="mb-4 text-sm text-muted-foreground font-medium">{products.length} items found</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-6 gap-y-10">
                        {products.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </>
            ) : (
                <div className="text-center py-32 border-2 border-dashed rounded-xl bg-muted/5 flex flex-col items-center justify-center">
                    <p className="text-xl font-bold mb-2">No products match your filters</p>
                    <p className="text-muted-foreground mb-6">Try adjusting the price range or size</p>
                    <Button asChild>
                        <Link href="/shop">Clear All Filters</Link>
                    </Button>
                </div>
            )}
        </div>
      </div>
    </div>
  )
}

import { getProducts, ProductFilter } from '@/lib/services/product-service'
import { getLinearCategories } from '@/lib/services/category-service'
import { ProductCard } from '@/components/storefront/product-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const revalidate = 60

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string }
}) {
  // 1. Fetch Categories (Linear List for Sidebar)
  const categories = await getLinearCategories()

  // 2. Fetch Products using Service
  const filter: ProductFilter = {
      is_active: true,
      category_id: searchParams.category,
      sort: searchParams.sort as any
  }
  const products = await getProducts(filter)

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Shop Collection</h1>
            <p className="text-muted-foreground mt-1">
                {products?.length || 0} products found
            </p>
        </div>
        
        {/* Sort Options (Simple Links) */}
        <div className="flex gap-2">
            <Button variant={!searchParams.sort ? "secondary" : "ghost"} size="sm" asChild>
                <Link href={{ query: { ...searchParams, sort: undefined } }}>Newest</Link>
            </Button>
            <Button variant={searchParams.sort === 'price_asc' ? "secondary" : "ghost"} size="sm" asChild>
                <Link href={{ query: { ...searchParams, sort: 'price_asc' } }}>Price: Low to High</Link>
            </Button>
            <Button variant={searchParams.sort === 'price_desc' ? "secondary" : "ghost"} size="sm" asChild>
                <Link href={{ query: { ...searchParams, sort: 'price_desc' } }}>Price: High to Low</Link>
            </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 space-y-6">
            <div>
                <h3 className="font-semibold mb-4">Categories</h3>
                <div className="space-y-2">
                    <Button 
                        variant={!searchParams.category ? "secondary" : "ghost"} 
                        className={cn("w-full justify-start", !searchParams.category && "bg-primary/10 text-primary")}
                        asChild
                    >
                        <Link href="/shop">All Products</Link>
                    </Button>
                    {categories?.map((cat: any) => (
                        <Button 
                            key={cat.id} 
                            variant={searchParams.category === cat.id ? "secondary" : "ghost"} 
                            className={cn("w-full justify-start", searchParams.category === cat.id && "bg-primary/10 text-primary")}
                            asChild
                        >
                            <Link href={{ query: { ...searchParams, category: cat.id } }}>
                                {cat.name}
                            </Link>
                        </Button>
                    ))}
                </div>
            </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
            {products && products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product: any) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 border rounded-xl bg-muted/10">
                    <p className="text-lg font-medium">No products found</p>
                    <p className="text-muted-foreground">Try clearing the filters</p>
                    <Button variant="link" asChild className="mt-2">
                        <Link href="/shop">Clear Filters</Link>
                    </Button>
                </div>
            )}
        </div>
      </div>
    </div>
  )
}

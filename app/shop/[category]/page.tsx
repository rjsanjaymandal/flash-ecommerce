import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/storefront/product-card'
import { notFound } from 'next/navigation'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function ShopPage(props: { params: Promise<{ category: string }> }) {
  const params = await props.params;
  const { category } = params
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select(`
        *,
        categories!inner(name, slug)
    `)
    .eq('is_active', true)
    
  if (category !== 'all' && category !== 'new-arrivals') {
      query = query.eq('categories.slug', category)
  }

  // Handle new arrivals logic if needed, e.g., order by date
  if (category === 'new-arrivals') {
      query = query.order('created_at', { ascending: false }).limit(10)
  }

  const { data: products } = await query

  if (!products) return <div>Loading...</div>

  return (
    <div className="min-h-screen py-24 container mx-auto px-4">
        <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight capitalize">
                {category === 'all' ? 'All Products' : category.replace('-', ' ')}
            </h1>
            <p className="text-muted-foreground mt-2">
                {products.length} items found
            </p>
        </div>

        {products.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
                No products found in this category.
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        )}
    </div>
  )
}

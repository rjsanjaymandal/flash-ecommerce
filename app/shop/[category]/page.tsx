import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/storefront/product-card'
import { notFound } from 'next/navigation'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function ShopPage(props: { params: Promise<{ category: string }> }) {
  const params = await props.params;
  const { category: slug } = params
  const supabase = await createClient()

  let products: any[] = []
  let categoryData: any = null
  let subCategories: any[] = []

  // 1. Handle Special Routes
  if (slug === 'all') {
      const { data } = await supabase.from('products').select('*').eq('is_active', true)
      products = data || []
  } else if (slug === 'new-arrivals') {
      const { data } = await supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(20)
      products = data || []
  } else {
      // 2. Fetch Category ID by Slug
      const { data: cat } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single()
      
      if (!cat) notFound()
      categoryData = cat

      // 3. Fetch Products by Category ID
      // Note: This fetches purely by ID. If we want recursive products (items in child categories), we'd need a recursive query or flat check.
      // For this step, we'll keep it simple: Exact Category Match.
      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', (cat as any).id)
        .eq('is_active', true)
      products = prods || []

      // 4. Fetch Subcategories for Navigation
      const { data: subs } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', (cat as any).id)
        .eq('is_active', true)
      subCategories = subs || []
  }

  return (
    <div className="min-h-screen py-24 container mx-auto px-4">
        <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight capitalize">
                {categoryData ? categoryData.name : slug.replace('-', ' ')}
            </h1>
            
            {categoryData?.description && (
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">{categoryData.description}</p>
            )}

            {/* Subcategories Nav */}
            {subCategories.length > 0 && (
                <div className="flex flex-wrap gap-4 justify-center mt-6">
                    {subCategories.map((sub: any) => (
                        <a 
                            key={sub.id} 
                            href={`/shop/${sub.slug}`}
                            className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        >   
                            {sub.image_url && <img src={sub.image_url} className="w-4 h-4 rounded-full mr-2 object-cover" alt="" />}
                            {sub.name}
                        </a>
                    ))}
                </div>
            )}

            <p className="text-muted-foreground mt-4 text-sm">
                {products.length} {products.length === 1 ? 'item' : 'items'} found
            </p>
        </div>

        {products.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
                No products found in this category.
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        )}
    </div>
  )
}

import { createStaticClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import type { Product } from '@/lib/services/product-service'

async function fetchProductBySlug(slug: string): Promise<Product | null> {
    const supabase = createStaticClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name), product_stock(*)')
      .eq('slug', slug)
      .single()
    
    if (error) return null

    const p = data as any
    return {
        ...p,
        average_rating: Number(p.average_rating || 0),
        review_count: Number(p.review_count || 0)
    } as Product
}

export const getCachedProduct = unstable_cache(
    async (slug: string) => fetchProductBySlug(slug),
    ['product-details-cached'], 
    { 
        revalidate: 900, // 15 Minutes
        tags: ['products'] 
    }
)

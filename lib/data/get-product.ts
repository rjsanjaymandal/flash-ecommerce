import { createStaticClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import type { Product } from '@/lib/services/product-service'

async function fetchProductBySlug(slug: string): Promise<Product | null> {
    const supabase = createStaticClient()
    const query = supabase
      .from('products')
      .select('*, categories(name), product_stock(*)')
    
    // Check if input looks like a UUID (fallback for ID-based routing)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)
    
    try {
        if (isUuid) {
            // Try precise ID match first
            const { data: idMatch } = await supabase.from('products').select('*, categories(name), product_stock(*)').eq('id', slug).single()
            if (idMatch) return formatProduct(idMatch)
        }

        const { data, error } = await query.eq('slug', slug).single()
        
        if (error) return null

        return formatProduct(data)
    } catch (error) {
        console.error('fetchProductBySlug failed:', error)
        return null
    }
}

function formatProduct(p: any): Product {
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

'use server'

import { getFeaturedProducts, Product } from "@/lib/services/product-service"
import { createStaticClient } from "@/lib/supabase/server"

export async function getUpsellProducts(categoryIds: string[] = [], inCartIds: string[] = []): Promise<Product[]> {
    const supabase = createStaticClient()
    
    let products: Product[] = []

    if (categoryIds.length > 0) {
        // 1. Suggest items from the same category
        const { data } = await supabase
            .from('products')
            .select('*, categories(name), product_stock(*)')
            .in('category_id', categoryIds)
            .eq('is_active', true)
            .not('id', 'in', `(${inCartIds.join(',')})`)
            .limit(10)
        
        products = data || []
    }

    // 2. Fallback to featured if not enough category matches
    if (products.length < 4) {
        const featured = await getFeaturedProducts()
        const additional = featured.filter(p => !inCartIds.includes(p.id) && !products.some(prev => prev.id === p.id))
        products = [...products, ...additional].slice(0, 10)
    }
    
    return products
}

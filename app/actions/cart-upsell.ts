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
            .limit(20) // Fetch more to allow for stock filtering
        
        products = (data || []).filter(p => {
            const hasStock = p.product_stock?.some((s: any) => s.quantity > 0)
            return hasStock
        }).slice(0, 10)
    }

    // 2. Fallback to featured if not enough category matches or for initial list
    if (products.length < 4) {
        const featured = await getFeaturedProducts()
        const additional = featured.filter(p => {
            const isInCart = inCartIds.includes(p.id)
            const isAlreadySuggested = products.some(prev => prev.id === p.id)
            const hasStock = p.product_stock?.some((s: any) => s.quantity > 0)
            return !isInCart && !isAlreadySuggested && hasStock
        })
        products = [...products, ...additional].slice(0, 10)
    }
    
    return products
}

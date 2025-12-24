'use server'

import { getProductBySlug } from '@/lib/services/product-service'

/**
 * Pre-warms the Next.js Data Cache for a specific product.
 * Called on hover/interaction to make the subsequent navigation instant.
 */
export async function prefetchProductAction(slug: string) {
    if (!slug) return
    
    // This triggers the getProductBySlug which uses unstable_cache
    // If the data is already cached, it does nothing.
    // If not, it fetches and populates the cache.
    await getProductBySlug(slug)
}

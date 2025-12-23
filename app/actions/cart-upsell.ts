'use server'

import { getFeaturedProducts, Product } from "@/lib/services/product-service"

export async function getUpsellProducts(): Promise<Product[]> {
    // In a real app, we might use robust logic: "Get Accessories not in Cart"
    // For now, we reuse Featured Products as a proxy for "Trending"
    const products = await getFeaturedProducts()
    return products.slice(0, 10) // Return top 10
}

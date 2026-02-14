'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/utils'

export async function globalAdminSearch(query: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    if (!query || query.length < 2) return { products: [], orders: [] }

    const [productsRes, ordersRes] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, slug, main_image_url')
        .ilike('name', `%${query}%`)
        .limit(5),
      supabase
        .from('orders')
        .select('id, shipping_name, total, status')
        .or(`shipping_name.ilike.%${query}%,id.ilike.%${query}%`)
        .limit(5)
    ])

    return {
      products: productsRes.data || [],
      orders: ordersRes.data || []
    }
  } catch (error) {
    console.error('Global search error:', error)
    return { products: [], orders: [] }
  }
}

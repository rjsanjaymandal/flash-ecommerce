'use server'

import { createClient } from '@/lib/supabase/server'

export async function getSearchIndex() {
  const supabase = await createClient()
  
  // Fetch minimal data for search
  const { data } = await supabase
    .from('products')
    .select('id, name, description, main_image_url, price, slug')
    .limit(50) // Cap initial load

  return data || []
}

export async function searchProducts(query: string) {
  if (!query || query.length < 2) return []
  
  const supabase = await createClient()

  const { data } = await supabase
    .from('products')
    .select('id, name, description, main_image_url, price, slug')
    .ilike('name', `%${query}%`)
    .limit(10)

  return data || []
}

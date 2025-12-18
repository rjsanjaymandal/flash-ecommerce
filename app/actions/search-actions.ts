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

  // Use Full Text Search with 'websearch_to_tsquery' logic
  // logic: filter by search_vector matching query
  const { data } = await supabase
    .from('products')
    .select('id, name, description, main_image_url, price, slug')
    .textSearch('search_vector', query, {
        type: 'websearch',
        config: 'english'
    })
    .limit(10)

  return data || []
}

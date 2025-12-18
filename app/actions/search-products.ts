'use server'

import { createClient } from '@/lib/supabase/server'

export async function searchProducts(query: string) {
  if (!query || query.trim().length === 0) {
    return []
  }

  try {
    const supabase = await createClient()

    // Convert query to prefix match logic for "autocomplete" feel
    const formattedQuery = query.trim().split(/\s+/).map(w => `${w}:*`).join(' & ');

    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, images')
      .textSearch('name', formattedQuery, {
        config: 'english'
      })
      .limit(5)

    if (error) {
      console.error('Error searching products:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Unexpected error in searchProducts:', err)
    return []
  }
}

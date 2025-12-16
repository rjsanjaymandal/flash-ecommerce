'use server'

import { createClient } from '@/lib/supabase/server'

export async function getSearchIndex() {
  const supabase = await createClient()
  
  // Fetch minimal data for search
  const { data } = await supabase
    .from('products')
    .select('id, name, description, main_image_url')

  return data || []
}

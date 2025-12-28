'use server'

import { createClient } from '@/lib/supabase/server'

// Return the full lightweight search index for client-side fuzzy search
interface RawSearchProduct {
    id: string
    name: string | null
    price: number
    main_image_url: string | null
    slug?: string | null
    category: { name: string } | { name: string }[] | null
}

export async function getSearchIndex() {
    const supabase = await createClient()
    
    const { data } = await supabase
        .from('products')
        .select('id, name, price, main_image_url, slug, category:categories(name)')
        .eq('is_active', true)
        .limit(1000) as { data: RawSearchProduct[] | null }

    if (!data) return []

    // Map to specific shape if needed, or return as is
    return data.map((p) => {
        const cat = Array.isArray(p.category) ? p.category[0] : p.category
        return {
            id: p.id,
            name: p.name || '',
            price: p.price,
            slug: p.slug || p.id,
            display_image: p.main_image_url,
            category_name: cat?.name || '',
        }
    })
}

export async function searchProducts(query: string) {
    if (!query) return []
     const supabase = await createClient()
     const { data } = await supabase
       .from('products')
       .select('id, name, price, main_image_url')
       .ilike('name', `%${query}%`)
       .eq('is_active', true)
       .limit(5)
     return data || []
}

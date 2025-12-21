'use server'

import { createClient } from '@/lib/supabase/server'

// Return the full lightweight search index for client-side fuzzy search
export async function getSearchIndex() {
    const supabase = await createClient()
    
    // Select minimal fields needed for search & display
    // EXCLUDING 'images' as it appears to be a non-existent column in this env, causing 500s.
    // relying on 'main_image_url'.
    const { data } = await supabase
        .from('products')
        .select('id, name, price, main_image_url, category:categories(name)')
        .eq('is_active', true)
        .limit(1000)

    if (!data) return []

    // Map to specific shape if needed, or return as is
    return data.map((p: any) => {
        // Handle Supabase relation: could be object or array depending on mapping
        const cat = Array.isArray(p.category) ? p.category[0] : p.category
        return {
            ...p,
            name: p.name || '',
            // Provide a fallback 'images' array for frontend components expecting it
            images: p.main_image_url ? [p.main_image_url] : [], 
            category_name: cat?.name || '', // Flatten for Fuse
            // Unify image field for display
            display_image: p.main_image_url || null
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

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type Category = {
  id: string
  name: string
  slug: string
  parent_id: string | null
  image_url?: string
  is_active: boolean
  children?: Category[]
}

export async function getCategoriesTree() {
    const supabase = await createClient()
    
    // 1. Fetch ALL active categories in one flat O(1) query
    const { data: allCategories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) throw error
    if (!allCategories) return []

    // 2. Build Tree in O(n) using Map (DSA Optimization)
    // Avoids recursive DB calls (which would be O(depth * branching_factor))
    
    const categoryMap = new Map<string, Category>()
    const rootCategories: Category[] = []

    // Initialize Map
    allCategories.forEach((cat: any) => {
      categoryMap.set(cat.id, { ...cat, children: [] })
    })

    // Link Children to Parents
    allCategories.forEach((cat: any) => {
      const node = categoryMap.get(cat.id)!
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id)
        if (parent) {
          parent.children?.push(node)
        }
      } else {
        rootCategories.push(node)
      }
    })

    return rootCategories
  }

export async function getLinearCategories() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
    if (error) throw error
    return data
}

export async function createCategory(data: any) {
    const supabase = await createClient()
    const { error } = await supabase.from('categories').insert([data])
    if (error) throw error
    revalidatePath('/admin/categories')
    revalidatePath('/shop')
}

export async function updateCategory(id: string, data: any) {
    const supabase = await createClient()
    const { error } = await supabase.from('categories').update(data).eq('id', id)
    if (error) throw error
    revalidatePath('/admin/categories')
    revalidatePath('/shop')
}

export async function deleteCategory(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/admin/categories')
    revalidatePath('/shop')
}

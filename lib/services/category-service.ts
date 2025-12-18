'use server'

import { createClient, createStaticClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'
import type { Category } from '@/types/store-types'

export type { Category }

async function fetchCategoriesTree(): Promise<Category[]> {
    const supabase = createStaticClient()
    
    // 1. Fetch ALL active categories in one flat O(1) query
    const { data: allCategories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) throw error
    if (!allCategories) return []

    // 2. Build Tree in O(n) using Map (DSA Optimization)
    const categoryMap = new Map<string, Category>()
    const rootCategories: Category[] = []

    // Initialize Map
    allCategories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] })
    })

    // Link Children to Parents
    allCategories.forEach((cat) => {
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

export async function getCategoriesTree(): Promise<Category[]> {
    return unstable_cache(
        async () => fetchCategoriesTree(),
        ['categories-tree'],
        { tags: ['categories'], revalidate: 3600 } // Cache for 1 hour
    )()
}

export async function getLinearCategories(): Promise<Category[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
    if (error) throw error
    
    return (data || []).map((d) => ({
        ...d,
        children: []
    })) as Category[]
}

export async function getRootCategories(limit?: number): Promise<Tables<'categories'>[]> {
  const key = `root-categories-${limit || 'all'}`
  return unstable_cache(
      async () => {
          const supabase = createStaticClient()
          let query = supabase
            .from('categories')
            .select('*')
            .is('parent_id', null)
            .eq('is_active', true)
            .order('name')

          if (limit) {
            query = query.limit(limit)
          }

          const { data, error } = await query
          if (error) throw error
          return data || []
      },
      ['root-categories', key],
      { tags: ['categories'], revalidate: 3600 }
  )()
}

export async function createCategory(data: TablesInsert<'categories'>) {
    const supabase = await createClient()
    const { error } = await supabase.from('categories').insert(data)
    if (error) throw error
    // @ts-expect-error: revalidateTag expects 1 arg
    revalidateTag('categories')
    revalidatePath('/admin/categories')
    revalidatePath('/shop')
}

export async function updateCategory(id: string, data: TablesUpdate<'categories'>) {
    const supabase = await createClient()
    const { error } = await supabase.from('categories').update(data).eq('id', id)
    if (error) throw error
    // @ts-expect-error: revalidateTag expects 1 arg
    revalidateTag('categories')
    revalidatePath('/admin/categories')
    revalidatePath('/shop')
}

export async function deleteCategory(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    // @ts-expect-error: revalidateTag expects 1 arg
    revalidateTag('categories')
    revalidatePath('/admin/categories')
    revalidatePath('/shop')
}

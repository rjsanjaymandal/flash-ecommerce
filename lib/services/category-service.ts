'use server'

import { createClient, createStaticClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/utils'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'
import type { Category } from '@/types/store-types'

// export type { Category } // Remove re-export to avoid circular/bundling issues

/**
 * Robust Tree Builder
 * Handles orphan nodes (active categories with inactive parents) 
 * by treating them as roots.
 */
async function fetchCategoriesTree(): Promise<Category[]> {
    const supabase = createStaticClient()
    
    const { data: allCategories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) throw error
    if (!allCategories) return []

    const categoryMap = new Map<string, Category>()
    const rootCategories: Category[] = []

    allCategories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] })
    })

    allCategories.forEach((cat) => {
      const node = categoryMap.get(cat.id)!
      // If parent exists and is also in the map (meaning it is active), link it.
      if (cat.parent_id && categoryMap.has(cat.parent_id)) {
        categoryMap.get(cat.parent_id)!.children?.push(node)
      } else {
        // Otherwise, it's a root (or an orphan of an inactive parent)
        rootCategories.push(node)
      }
    })

    return rootCategories
}

export async function getCategoriesTree(): Promise<Category[]> {
    return unstable_cache(
        async () => fetchCategoriesTree(),
        ['categories-tree'],
        { tags: ['categories'], revalidate: 3600 } // 1 hour buffer
    )()
}

/**
 * Cached Linear Categories
 * Used in Admin and Shop views. 
 */
export async function getLinearCategories(activeOnly = false): Promise<Category[]> {
    return unstable_cache(
        async () => {
            const supabase = createStaticClient()
            let query = supabase.from('categories').select('*').order('name')
            if (activeOnly) {
                query = query.eq('is_active', true)
            }
            const { data, error } = await query
            if (error) throw error
            
            return (data || []).map((d) => ({
                ...d,
                children: []
            })) as Category[]
        },
        [`categories-linear-${activeOnly}`],
        { tags: ['categories'], revalidate: 3600 }
    )()
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
      { tags: ['categories'], revalidate: 2592000 }
  )()
}

/**
 * Ancestry Check
 * Ensures 'childId' is not an ancestor of 'parentId' to prevent cycles
 */
async function wouldCreateCycle(childId: string, newParentId: string | null): Promise<boolean> {
    if (!newParentId) return false
    if (childId === newParentId) return true

    const supabase = createStaticClient()
    const { data } = await supabase.from('categories').select('id, parent_id')
    if (!data) return false

    const map = new Map<string, string | null>()
    data.forEach(c => map.set(c.id, c.parent_id))

    let current: string | null = newParentId
    while (current) {
        if (current === childId) return true
        current = map.get(current) || null
    }

    return false
}

export async function createCategory(data: TablesInsert<'categories'>) {
    await requireAdmin()
    const supabase = await createClient()
    const { error } = await supabase.from('categories').insert(data)
    if (error) throw error
    
    // @ts-expect-error: Next.js 16 types incorrectly require a second 'profile' argument that is optional at runtime for tag-based invalidation
    revalidateTag('categories')
    revalidatePath('/admin/categories')
    revalidatePath('/shop')
}

export async function updateCategory(id: string, data: TablesUpdate<'categories'>) {
    await requireAdmin()
    const supabase = await createClient()

    // Robust circular dependency check
    if (data.parent_id !== undefined && await wouldCreateCycle(id, data.parent_id)) {
        throw new Error("Cannot set parent: This would create a circular dependency loop.")
    }

    const { error } = await supabase.from('categories').update(data).eq('id', id)
    if (error) throw error
    
    // @ts-expect-error: Next.js 16 types incorrectly require a second 'profile' argument that is optional at runtime for tag-based invalidation
    revalidateTag('categories')
    revalidatePath('/admin/categories')
    revalidatePath('/shop')
}

export async function deleteCategory(id: string) {
    await requireAdmin()
    const supabase = await createClient()

    // Check if it has children first
    const { count } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', id)
    
    if (count && count > 0) {
        throw new Error("Cannot delete a category that has subcategories. Please delete or move children first.")
    }

    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    
    // @ts-expect-error: Next.js 16 types incorrectly require a second 'profile' argument that is optional at runtime for tag-based invalidation
    revalidateTag('categories')
    revalidatePath('/admin/categories')
    revalidatePath('/shop')
}

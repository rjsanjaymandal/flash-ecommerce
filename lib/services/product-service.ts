'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ProductFilter = {
  category_id?: string
  is_active?: boolean
  search?: string
  sort?: 'price_asc' | 'price_desc' | 'newest'
  limit?: number
}

// Helper to get DB client
async function getDb() {
    return await createClient()
}

export type ProductFilter = {
  category_id?: string
  is_active?: boolean
  search?: string
  sort?: 'price_asc' | 'price_desc' | 'newest'
  limit?: number
  min_price?: number
  max_price?: number
  size?: string
}

export async function getProducts(filter: ProductFilter = {}) {
    const supabase = await getDb()
    
    // If filtering by size, we need an inner join on stock
    let selectString = '*, categories(name), product_stock(*)'
    if (filter.size) {
        selectString = '*, categories(name), product_stock!inner(*)'
    }

    let query = supabase
      .from('products')
      .select(selectString)
    
    if (filter.is_active !== undefined) {
      query = query.eq('is_active', filter.is_active)
    }

    if (filter.category_id) {
      query = query.eq('category_id', filter.category_id)
    }

    if (filter.min_price !== undefined) {
      query = query.gte('price', filter.min_price)
    }

    if (filter.max_price !== undefined) {
      query = query.lte('price', filter.max_price)
    }

    // Size filter (applied to the joined table via !inner)
    if (filter.size) {
        query = query.eq('product_stock.size', filter.size)
    }

    if (filter.search) {
      query = query.ilike('name', `%${filter.search}%`)
    }

    if (filter.limit) {
      query = query.limit(filter.limit)
    }

    // Sorting
    switch (filter.sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query
    if (error) throw error
    return data
}

export async function getProductBySlug(slug: string) {
    const supabase = await getDb()
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name), product_stock(*)')
      .eq('slug', slug)
      .single()
    
    if (error) return null
    return data
}

export async function createProduct(productData: any) {
    const supabase = await getDb()
    const { variants, ...prod } = productData
    
    const { data, error } = await supabase
      .from('products')
      .insert(prod)
      .select()
      .single()

    if (error) throw error

    if (variants && variants.length > 0) {
      const stockData = variants.map((v: any) => ({
        product_id: data.id,
        size: v.size,
        color: v.color,
        quantity: v.quantity
      }))

      const { error: stockError } = await supabase
        .from('product_stock')
        .insert(stockData)
      
      if (stockError) throw stockError
    }
    
    revalidatePath('/admin/products')
    revalidatePath('/shop')
    return data
}

export async function updateProduct(id: string, productData: any) {
    const supabase = await getDb()
    const { variants, ...prod } = productData

    const { error } = await supabase
        .from('products')
        .update(prod)
        .eq('id', id)
    
    if (error) throw error

    // Update Stock if variants provided (Full Replace Strategy)
    if (variants) {
        // Delete old
        await supabase.from('product_stock').delete().eq('product_id', id)
        
        // Insert new
        if (variants.length > 0) {
             const stockData = variants.map((v: any) => ({
                product_id: id,
                size: v.size,
                color: v.color,
                quantity: v.quantity
              }))
              const { error: stockError } = await supabase.from('product_stock').insert(stockData)
              if (stockError) throw stockError
        }
    }

    revalidatePath('/admin/products')
    revalidatePath('/shop')
}

export async function deleteProduct(id: string) {
    const supabase = await getDb()
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/admin/products')
    revalidatePath('/shop')
}

export async function getProductsByIds(ids: string[]) {
    if (!ids || ids.length === 0) return []
    const supabase = await getDb()
    
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name), product_stock(*)')
      .in('id', ids)
    
    if (error) throw error
    return data
}

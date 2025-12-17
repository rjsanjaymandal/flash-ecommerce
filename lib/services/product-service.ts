'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'



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
  page?: number
  min_price?: number
  max_price?: number
  size?: string
  color?: string
}

export type PaginatedResult<T> = {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export async function getProducts(filter: ProductFilter = {}): Promise<PaginatedResult<any>> {
    const supabase = await getDb()
    const page = filter.page || 1
    const limit = filter.limit || 10
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    // If filtering by size or color, we need an inner join on stock
    let selectString = '*, categories(name), product_stock(*), reviews(rating)'
    if (filter.size || filter.color) {
        selectString = '*, categories(name), product_stock!inner(*), reviews(rating)'
    }

    // We use count: 'exact' to get total rows matching filters
    let query = supabase
      .from('products')
      .select(selectString, { count: 'exact' })
    
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

    // Size and Color filters (applied to the joined table via !inner)
    if (filter.size) {
        query = query.eq('product_stock.size', filter.size)
    }

    if (filter.color) {
        query = query.eq('product_stock.color', filter.color)
    }

    if (filter.search) {
      // Search name OR id
      query = query.or(`name.ilike.%${filter.search}%,id::text.ilike.%${filter.search}%`)
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

    // Apply Pagination
    query = query.range(from, to)

    const { data, error, count } = await query
    
    if (error) throw error

    // Aggregate statistics
    const processedData = (data || []).map((p: any) => {
        const ratings = p.reviews?.map((r: any) => r.rating) || []
        const avg = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0
        return {
            ...p,
            average_rating: avg,
            review_count: ratings.length
        }
    })

    return {
        data: processedData,
        meta: {
            total: count || 0,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit)
        }
    }
}

export async function getProductBySlug(slug: string) {
    const supabase = await getDb()
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name), product_stock(*), reviews(rating)')
      .eq('slug', slug)
      .single()
    
    if (error) return null

    // Aggregate statistics
    const ratings = data.reviews?.map((r: any) => r.rating) || []
    const avg = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0
    
    return {
        ...data,
        average_rating: avg,
        review_count: ratings.length
    }
}

export async function createProduct(productData: any) {
    const supabase = await getDb()
    const { variants, ...prod } = productData
    
    const { data, error } = await (supabase.from('products') as any)
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

      const { error: stockError } = await (supabase.from('product_stock') as any)
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

    const { error } = await (supabase.from('products') as any)
        .update(prod)
        .eq('id', id)
    
    if (error) throw error

    // Update Stock if variants provided (Full Replace Strategy)
    if (variants) {
        // Delete old
        await (supabase.from('product_stock') as any).delete().eq('product_id', id)
        
        // Insert new
        if (variants.length > 0) {
             const stockData = variants.map((v: any) => ({
                product_id: id,
                size: v.size,
                color: v.color,
                quantity: v.quantity
              }))
              const { error: stockError } = await (supabase.from('product_stock') as any).insert(stockData)
              if (stockError) throw stockError
        }
    }

    revalidatePath('/admin/products')
    revalidatePath('/shop')
}

export async function deleteProduct(id: string) {
    const supabase = await getDb()
    const { error } = await (supabase.from('products') as any).delete().eq('id', id)
    if (error) throw error
    revalidatePath('/admin/products')
    revalidatePath('/shop')
}

export async function getProductsByIds(ids: string[]) {
    if (!ids || ids.length === 0) return []
    const supabase = await getDb()
    
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name), product_stock(*), reviews(rating)')
      .in('id', ids)
    
    if (error) throw error

    return (data || []).map((p: any) => {
        const ratings = p.reviews?.map((r: any) => r.rating) || []
        const avg = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0
        return {
            ...p,
            average_rating: avg,
            review_count: ratings.length
        }
    })
}

export async function getRelatedProducts(currentProductId: string, categoryId: string) {
    const supabase = await getDb()
    
    // Simple logic: Same category, not current product, limit 4
    let query = supabase
      .from('products')
      .select('*, reviews(rating)') // Fetch all fields for ProductCard + reviews
      .eq('is_active', true)
      .neq('id', currentProductId)
      .limit(4)

    if (categoryId) {
        query = query.eq('category_id', categoryId)
    }
    
    const { data } = await query
    
    return (data || []).map((p: any) => {
        const ratings = p.reviews?.map((r: any) => r.rating) || []
        const avg = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0
        return {
            ...p,
            average_rating: avg,
            review_count: ratings.length
        }
    })
}

export async function bulkDeleteProducts(ids: string[]) {
    if (!ids || ids.length === 0) return
    const supabase = await getDb()
    const { error } = await (supabase.from('products') as any).delete().in('id', ids)
    if (error) throw error
    revalidatePath('/admin/products')
    revalidatePath('/shop')
}

export async function bulkUpdateProductStatus(ids: string[], isActive: boolean) {
    if (!ids || ids.length === 0) return
    const supabase = await getDb()
    const { error } = await (supabase.from('products') as any)
        .update({ is_active: isActive })
        .in('id', ids)
    if (error) throw error
    revalidatePath('/admin/products')
    revalidatePath('/shop')
}

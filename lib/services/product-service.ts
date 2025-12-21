'use server'

import { createClient, createStaticClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/utils'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import type { Database, Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

export type Product = Tables<'products'> & {
    categories?: { name: string } | null
    product_stock?: Tables<'product_stock'>[]
    average_rating?: number
    review_count?: number
    images?: {
        thumbnail: string
        mobile: string
        desktop: string
    } | null
    preorder_count?: number
}

// Helper to get DB client
async function getDb() {
    return await createClient()
}

export type ProductFilter = {
  category_id?: string
  is_active?: boolean
  search?: string
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'trending' | 'waitlist_desc'
  limit?: number
  page?: number
  min_price?: number
  max_price?: number
  size?: string
  color?: string
  ignoreStockSort?: boolean
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

// Internal Fetcher for Cache
async function fetchProducts(filter: ProductFilter, supabaseClient?: any): Promise<PaginatedResult<Product>> {
    const supabase = supabaseClient || createStaticClient()
    const page = filter.page || 1
    const limit = filter.limit || 10
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    // Special handling for Waitlist Sort (Two-Step Fetch to avoid computed column dependency)
    if (filter.sort === 'waitlist_desc') {
         // 1. Fetch ALL products with their preorder counts (lightweight)
         const { data: allIds, error: idError } = await supabase
            .from('products')
            .select('id, preorders(count)')
            .eq('is_active', true) // Assume we only care about active products for waitlist demand? Or all? Let's respect filter.
        
         if (idError) throw idError

         // 2. Sort in Memory
         const sortedIds = (allIds || [])
            .map((p: any) => ({ 
                id: p.id, 
                count: p.preorders ? p.preorders[0]?.count : 0 
            }))
            .sort((a: any, b: any) => b.count - a.count)
        
        // 3. Paginate
        const total = sortedIds.length
        const sliced = sortedIds.slice(from, to)
        const targetIds = sliced.map((i: any) => i.id)

        // 4. Fetch Details
        const { data: details, error: detailError } = await supabase
            .from('products')
            .select('*, categories(name), product_stock(*), preorders(count)')
            .in('id', targetIds)
        
        if (detailError) throw detailError

        // Re-order details to match sortedIds (since .in() does not preserve order)
        const orderedData = targetIds
            .map((id: string) => details?.find((d: any) => d.id === id))
            .filter(Boolean) as Product[]
            
        const processedData = orderedData.map((p: any) => ({
             ...p,
             average_rating: Number(p.average_rating || 0),
             review_count: Number(p.review_count || 0),
             preorder_count: p.preorders ? p.preorders[0]?.count : 0
        }))

        return {
            data: processedData,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    }

    // Use pre-calculated fields for faster performance
    // Including preorders count for admin view (and potentially sorting/badges later)
    // Note: 'preorders(count)' requires a foreign key relationship which exists.
    let selectString = '*, categories(name), product_stock(*), preorders(count)'
    if (filter.size || filter.color) {
        selectString = '*, categories(name), product_stock!inner(*), preorders(count)'
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
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filter.search)
        if (isUuid) {
            query = query.eq('id', filter.search)
        } else {
            query = query.ilike('name', `%${filter.search}%`)
        }
    }

    // Sorting
    // Primary sort: In-stock items first
    // We try to order by the computed column 'in_stock'. 
    // If the function doesn't exist, we catch the error and retry without it.
    if (!filter.ignoreStockSort) {
        query = query.order('in_stock', { ascending: false })
    }

    switch (filter.sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'trending':
        // trending fallback is handled in the catch/error check
        query = query.order('sale_count' as any, { ascending: false })
        break
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Apply Pagination
    query = query.range(from, to)

    try {
        const { data, error, count } = await query
        
        if (error) {
            // Check for PostgREST undefined column error (42703) 
            // This happens if 'in_stock' function or 'sale_count' column is missing
            if (error.code === '42703') {
                console.warn('Sort column missing (likely in_stock or sale_count), retrying with simplified sort', error.message)
                
                // Determine what failed
                if (filter.sort === 'trending' && !filter.ignoreStockSort) {
                    // Try removing trending first, keeping stock
                     return fetchProducts({ ...filter, sort: 'newest' }, supabase)
                } else if (!filter.ignoreStockSort) {
                    // Start over without stock sort
                    return fetchProducts({ ...filter, ignoreStockSort: true })
                } else if (filter.sort === 'trending') {
                     // Last resort: remove trending
                     return fetchProducts({ ...filter, sort: 'newest', ignoreStockSort: true }, supabase)
                }
            }
            throw error
        }

        const processedData = (data || []).map((p: any) => ({
            ...p,
            average_rating: Number(p.average_rating || 0),
            review_count: Number(p.review_count || 0),
            preorder_count: p.preorders ? p.preorders[0]?.count : 0
        })) as Product[]

        return {
            data: processedData,
            meta: {
                total: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit)
            }
        }
    } catch (err: any) {
        if (err.code === '42703') {
             // Fallback for unexpected recursive fails
             if (!filter.ignoreStockSort) {
                return fetchProducts({ ...filter, ignoreStockSort: true }, supabase)
             }
        }
        throw err
    }
}

// Public Cached Methods
export async function getProducts(filter: ProductFilter = {}): Promise<PaginatedResult<Product>> {
    const key = JSON.stringify(filter)
    return unstable_cache(
        async () => fetchProducts(filter),
        ['products-list', key],
        { tags: ['products'], revalidate: 60 } // Cache for 60s
    )()
}


export async function getProductsSecure(filter: ProductFilter = {}, client: any): Promise<PaginatedResult<Product>> {
    return fetchProducts(filter, client)
}

async function fetchProductBySlug(slug: string): Promise<Product | null> {
    const supabase = createStaticClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name), product_stock(*)')
      .eq('slug', slug)
      .single()
    
    if (error) return null

    const p = data as any
    return {
        ...p,
        average_rating: Number(p.average_rating || 0),
        review_count: Number(p.review_count || 0)
    } as Product
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    return unstable_cache(
        async () => fetchProductBySlug(slug),
        ['product-slug', slug],
        { tags: [`product-${slug}`, 'products'], revalidate: 60 }
    )()
}

export async function createProduct(productData: TablesInsert<'products'> & { variants?: TablesInsert<'product_stock'>[] }) {
    await requireAdmin()
    const supabase = await getDb()
    const { variants, ...prod } = productData
    
    const { data, error } = await supabase
      .from('products')
      .insert(prod as any) // Type assertion until DB types are regenerated
      .select()
      .single()

    if (error) throw error

    if (variants && variants.length > 0) {
      const stockData = variants.map((v) => ({
        product_id: data.id,
        size: v.size,
        color: v.color,
        quantity: v.quantity
      }))

      const { error: stockError } = await supabase
        .from('product_stock')
        .insert(stockData as any)
      
      if (stockError) throw stockError
    }
    
    // @ts-expect-error: revalidateTag expects 1 arg
    revalidateTag('products')
    revalidatePath('/admin/products')
    revalidatePath('/shop')
    return data
}

export async function updateProduct(id: string, productData: TablesUpdate<'products'> & { variants?: TablesInsert<'product_stock'>[] }) {
    await requireAdmin()
    const supabase = await getDb()
    const { variants, ...prod } = productData

    // 1. Fetch existing product to compare data and get old slug
    const { data: existing, error: fetchError } = await supabase
        .from('products')
        .select('slug, name')
        .eq('id', id)
        .single()
    
    if (fetchError || !existing) {
        throw new Error("Product not found")
    }

    // 2. Check for slug collision if slug is changing
    if (prod.slug && prod.slug !== existing.slug) {
        // Validation: lowercase alphanumeric
        if (!/^[a-z0-9-]+$/.test(prod.slug)) {
            throw new Error("Slug must be lowercase, alphanumeric, and contain only dashes.")
        }

        const { data: collision } = await supabase
            .from('products')
            .select('id')
            .eq('slug', prod.slug)
            .neq('id', id) // Exclude self
            .single()
        
        if (collision) {
            throw new Error(`The slug "${prod.slug}" is already taken by another product.`)
        }
    }

    // 3. Perform Update
    const { error } = await supabase
        .from('products')
        .update(prod as any)
        .eq('id', id)
    
    if (error) {
        // Fallback catch for DB constraints
        if (error.code === '23505') throw new Error("This slug or name is already in use.")
        throw error
    }

    // 4. Update Stock (Full Replace Strategy)
    if (variants) {
        await supabase.from('product_stock').delete().eq('product_id', id)
        if (variants.length > 0) {
             const stockData = variants.map((v) => ({
                product_id: id,
                size: v.size,
                color: v.color,
                quantity: v.quantity
              }))
              const { error: stockError } = await supabase.from('product_stock').insert(stockData as any)
              if (stockError) throw stockError
        }
    }

    // 5. Revalidation with Robustness
    console.log(`Update successful for ${id}. Revalidating...`)

    try {
        // @ts-expect-error: revalidateTag expects 1 arg
        revalidateTag('products')
        
        // Revalidate NEW slug
        if (prod.slug) { 
            // @ts-expect-error: revalidateTag expects 1 arg
            revalidateTag(`product-${prod.slug}`)
        }

        // Revalidate OLD slug (if different) to clear stale cache
        if (existing.slug && existing.slug !== prod.slug) {
            // @ts-expect-error: revalidateTag expects 1 arg
            revalidateTag(`product-${existing.slug}`)
            console.log(`Cleared cache for old slug: ${existing.slug}`)
        }

        revalidatePath('/admin/products')
        revalidatePath('/shop')
        // Also revalidate the specific product page just in case
        revalidatePath(`/product/${prod.slug || existing.slug}`)

    } catch (e) {
        console.error('Revalidation failed:', e)
    }
}

export async function deleteProduct(id: string) {
    await requireAdmin()
    const supabase = await getDb()
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
    // @ts-expect-error: revalidateTag expects 1 arg
    revalidateTag('products')
    revalidatePath('/admin/products')
    revalidatePath('/shop')
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
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
        } as Product
    })
}

export async function getRelatedProducts(currentProductId: string, categoryId: string): Promise<Product[]> {
    const key = `related-${currentProductId}-${categoryId}`
    return unstable_cache(
        async () => {
            const supabase = createStaticClient()
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
                } as Product
            })
        },
        ['related-products', key],
        { tags: ['products'], revalidate: 60 }
    )()
}

export async function bulkDeleteProducts(ids: string[]) {
    await requireAdmin()
    if (!ids || ids.length === 0) return
    const supabase = await getDb()
    const { error } = await supabase.from('products').delete().in('id', ids)
    if (error) throw error
    // @ts-expect-error: revalidateTag expects 1 arg
    revalidateTag('products')
    revalidatePath('/admin/products')
    revalidatePath('/shop')
}

export async function bulkUpdateProductStatus(ids: string[], isActive: boolean) {
    await requireAdmin()
    if (!ids || ids.length === 0) return
    const supabase = await getDb()
    const { error } = await supabase
        .from('products')
        .update({ is_active: isActive })
        .in('id', ids)
    if (error) throw error
    // @ts-expect-error: revalidateTag expects 1 arg
    revalidateTag('products')
    revalidatePath('/admin/products')
    revalidatePath('/shop')
}

// decrementStock removed - unsafe public exposure. Use RPC 'decrement_stock' via Service Role instead.

export async function getWaitlistedProducts(userId: string): Promise<Product[]> {
    const supabase = await getDb()
    
    // 1. Get Preorders
    const { data: preorders, error } = await supabase
        .from('preorders' as any)
        .select('product_id')
        .eq('user_id', userId)
    
    if (error || !preorders || preorders.length === 0) return []

    const productIds = preorders.map((p: any) => p.product_id)

    // 2. Get Products (Reusing existing fetcher logic or direct call)
    const { data: products } = await supabase
        .from('products')
        .select('*, categories(name), product_stock(*)')
        .in('id', productIds)
        .eq('is_active', true)
    
    return (products || []).map((p: any) => ({
        ...p,
        average_rating: 0, 
        review_count: 0
    })) as Product[]
}

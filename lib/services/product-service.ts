'use server'

import { createClient, createStaticClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/utils'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { productSchema } from '@/lib/validations/product'
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
      case 'random' as any:
        // Proper random order in PostgREST is difficult, but we can use a stable random-like field 
        // OR just order by ID with varying directions. 
        // For now, newest is a safe fallback, or we can use a pseudo-random seed if implemented in PG.
        query = query.order('created_at', { ascending: Math.random() > 0.5 })
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
                
                // Determine what failed - avoiding infinite recursion by checking if already retrying
                if (!filter.ignoreStockSort) {
                    return fetchProducts({ ...filter, ignoreStockSort: true }, supabase)
                } else if (filter.sort === 'trending') {
                    // If even without stock sort it fails, it must be trending
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
        console.error('fetchProducts failed:', err)
        // If it's a known missing column error and we haven't already retried, try one last time with 'newest'
        if (err.code === '42703' && filter.sort !== 'newest') {
             return fetchProducts({ ...filter, sort: 'newest', ignoreStockSort: true }, supabase)
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
        { tags: ['products'], revalidate: 2592000 } // Cache for 30 days
    )()
}


export async function getProductsSecure(filter: ProductFilter = {}, client: any): Promise<PaginatedResult<Product>> {
    return fetchProducts(filter, client)
}

export async function getFeaturedProducts(): Promise<Product[]> {
    return unstable_cache(
        async () => {
             const supabase = createAdminClient()
             const { data } = await supabase
                .from('products')
                .select('id, name, price, main_image_url, slug, created_at, category_id, is_active, sale_count, categories(name), product_stock(*), reviews(rating)')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(8)
            
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
        ['featured-products'],
        { tags: ['featured-products'], revalidate: 2592000 } 
    )()
}

async function fetchProductBySlug(slug: string): Promise<Product | null> {
    const supabase = createStaticClient()
    // Check for UUID/ID access
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)
    
    if (isUuid) {
        const { data: idData } = await supabase.from('products').select('*, categories(name), product_stock(*)').eq('id', slug).single()
        if (idData) return formatProduct(idData)
    }

    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name), product_stock(*)')
      .eq('slug', slug)
      .single()
    
    if (error) return null

    return formatProduct(data)
}

function formatProduct(p: any): Product {
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
        { tags: [`product-${slug}`, 'products'], revalidate: 2592000 }
    )()
}

// Helper to clean up product data and sync options
function prepareProductData(data: any) {
  // STRICT WHITELIST of database columns
  const cleanData: any = {
    name: data.name,
    slug: data.slug,
    description: data.description || null,
    price: data.price ? Number(data.price) : 0,
    category_id: data.category_id || null, // Critical: Prevent "" for UUID
    main_image_url: data.main_image_url,
    gallery_image_urls: data.gallery_image_urls || [],
    expression_tags: data.expression_tags || [],
    is_active: data.is_active ?? true,
  }

  // Derive options from variants
  if (data.variants && Array.isArray(data.variants)) {
    const variants = data.variants
    cleanData.size_options = Array.from(new Set(variants.map((v: any) => v.size).filter(Boolean)))
    cleanData.color_options = Array.from(new Set(variants.map((v: any) => v.color).filter(Boolean)))
  }
  
  return cleanData
}

export async function createProduct(productData: any) {
    try {
        // 1. Core Security Check (Required even with Admin Client)
        await requireAdmin()

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return { success: false, error: "System Configuration Error: Service Role Key is missing." }
        }
        
        // 2. Server-side Validation
        const validated = productSchema.safeParse(productData)
        if (!validated.success) {
            return { success: false, error: `Invalid data: ${validated.error.issues[0].message}` }
        }

        // 3. Prep Data & Admin Client
        const insertData = prepareProductData(validated.data)
        const variants = validated.data.variants || []
        const supabase = createAdminClient() // Use Service Role for reliability
        
        // 4. Insert Product
        const { data: prodJson, error: prodErr } = await supabase
            .from('products')
            .insert(insertData)
            .select('id')
            .single()

        if (prodErr || !prodJson) {
            console.error('[createProduct] DB Error:', prodErr || 'No data returned')
            return { success: false, error: `Database Error: ${prodErr?.message || 'Empty response'}` }
        }

        const productId = prodJson.id

        // 5. Insert Variants (Stock)
        if (variants.length > 0) {
            const stockData = variants.map((v: any) => ({
                product_id: productId,
                size: v.size,
                color: v.color,
                quantity: Number(v.quantity) || 0
            }))

            const { error: stockErr } = await supabase
                .from('product_stock')
                .insert(stockData)

            if (stockErr) {
                console.error('[createProduct] Stock Sync Error:', stockErr)
                // Cleanup on failure
                await supabase.from('products').delete().eq('id', productId)
                return { success: false, error: `Stock Sync Failed: ${stockErr.message}` }
            }
        }

        // 6. Revalidation (Safe Closure)
        try {
            revalidatePath('/admin/products')
            revalidatePath('/shop')
            // @ts-expect-error: Next.js types incorrectly require a second 'profile' argument
            revalidateTag('products')
            // @ts-expect-error: Next.js types incorrectly require a second 'profile' argument
            revalidateTag('featured-products')
        } catch (revErr) {
            console.warn('[createProduct] Revalidation skipped:', revErr)
        }

        return { success: true, id: productId }
    } catch (err: any) {
        console.error('[createProduct] Action Crash:', err)
        return { success: false, error: `Action Crash: ${err.message || 'Unknown'}` }
    }
}

export async function updateProduct(id: string, productData: any) {
    try {
        // 1. Core Security Check
        await requireAdmin()

        // 2. Server-side Validation
        const validated = productSchema.safeParse(productData)
        if (!validated.success) {
            return { success: false, error: `Invalid data: ${validated.error.issues[0].message}` }
        }

        // 3. Prep Data & Admin Client
        const updateData = prepareProductData(validated.data)
        const variants = validated.data.variants
        const supabase = createAdminClient()

        // 4. Fetch existing for slug check
        const { data: existing, error: fetchErr } = await supabase
            .from('products')
            .select('slug')
            .eq('id', id)
            .single()
        
        if (fetchErr || !existing) return { success: false, error: "Product not found" }

        // 5. Perform Update
        const { error: updateErr } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)

        if (updateErr) {
             console.error('[updateProduct] DB Error:', updateErr)
             return { success: false, error: `Update Error [${updateErr.code}]: ${updateErr.message}` }
        }

        // 6. Sync Variants (Stock)
        if (variants && Array.isArray(variants)) {
            // Clear old
            await supabase.from('product_stock').delete().eq('product_id', id)
            
            // Insert new
            if (variants.length > 0) {
                const stockData = variants.map((v: any) => ({
                    product_id: id,
                    size: v.size,
                    color: v.color,
                    quantity: Number(v.quantity) || 0
                }))
                const { error: stockErr } = await supabase.from('product_stock').insert(stockData)
                if (stockErr) return { success: false, error: `Stock Sync Failed: ${stockErr.message}` }
            }
        }

        // 7. Revalidation
        try {
            revalidatePath('/admin/products')
            revalidatePath('/shop')
            revalidatePath(`/product/${updateData.slug || existing.slug}`)
            // @ts-expect-error: Next.js types incorrectly require a second 'profile' argument
            revalidateTag('products')
            // @ts-expect-error: Next.js types incorrectly require a second 'profile' argument
            revalidateTag('featured-products')
            // @ts-expect-error: Next.js types incorrectly require a second 'profile' argument
            if (updateData.slug) revalidateTag(`product-${updateData.slug}`)
            // @ts-expect-error: Next.js types incorrectly require a second 'profile' argument
            if (existing.slug && existing.slug !== updateData.slug) revalidateTag(`product-${existing.slug}`)
        } catch (revErr) {
            console.warn('[updateProduct] Revalidation skipped:', revErr)
        }

        return { success: true }
    } catch (err: any) {
        console.error('[updateProduct] Action Crash:', err)
        return { success: false, error: `Action Crash: ${err.message || 'Unknown'}` }
    }
}

export async function deleteProduct(id: string) {
    await requireAdmin()
    const supabase = createAdminClient()
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
    // @ts-expect-error: Next.js 16 types incorrectly require a second 'profile' argument that is optional at runtime for tag-based invalidation
    revalidateTag('products')
    // @ts-expect-error: Next.js 16 types incorrectly require a second 'profile' argument that is optional at runtime for tag-based invalidation
    revalidateTag('featured-products')
    revalidatePath('/admin/products')
    revalidatePath('/shop')
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
    if (!ids || ids.length === 0) return []
    const supabase = createAdminClient()
    
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

export async function getValidProducts(ids: string[]): Promise<Product[]> {
    if (!ids || ids.length === 0) return []
    const supabase = createAdminClient()
    
    // Only fetch ACTIVE products
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name), product_stock(*), reviews(rating)')
      .in('id', ids)
      .eq('is_active', true)
    
    if (error) {
        console.error('Error validating products:', error)
        return []
    }

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

export async function getRelatedProducts(product: Product): Promise<Product[]> {
    const key = `related-${product.id}`
    return unstable_cache(
        async () => {
            const supabase = createStaticClient()
            
            // Logic:
            // 1. Exclude current product
            // 2. Prioritize: Same Category OR Shared Tags
            // 3. Limit 8
            
            let query = supabase
                .from('products')
                .select('*, reviews(rating)')
                .eq('is_active', true)
                .neq('id', product.id)
                .limit(8)
            
            // Build OR filter: category_id.eq.X,expression_tags.ov.{tag1,tag2}
            const conditions = []
            
            if (product.category_id) {
                conditions.push(`category_id.eq.${product.category_id}`)
            }
            
            if (product.expression_tags && product.expression_tags.length > 0) {
                 // Postgres syntax for overlap: column.ov.{val1,val2}
                 // We need to format array as {val1,val2}
                 const tagString = `{${product.expression_tags.map(t => `"${t}"`).join(',')}}`
                 conditions.push(`expression_tags.ov.${tagString}`)
            }
            
            if (conditions.length > 0) {
                query = query.or(conditions.join(','))
            }
            
            // Optional: Order by something relevant? Random? 
            // For now, let's just stick to default or random if possible (PostgREST random is tricky without extensions)
            // We'll stick to DB default (likely insertion or ID) or add a sort if needed.
            
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
        { tags: ['products', 'related-products'], revalidate: 2592000 }
    )()
}

export async function bulkDeleteProducts(ids: string[]) {
    await requireAdmin()
    if (!ids || ids.length === 0) return
    const supabase = createAdminClient()
    const { error } = await supabase.from('products').delete().in('id', ids)
    if (error) throw error
    // @ts-expect-error: Next.js 16 types incorrectly require a second 'profile' argument that is optional at runtime for tag-based invalidation
    revalidateTag('products')
    revalidatePath('/admin/products')
    revalidatePath('/shop')
}

export async function bulkUpdateProductStatus(ids: string[], isActive: boolean) {
    await requireAdmin()
    if (!ids || ids.length === 0) return
    const supabase = createAdminClient()
    const { error } = await supabase
        .from('products')
        .update({ is_active: isActive })
        .in('id', ids)
    if (error) throw error
    // @ts-expect-error: Next.js 16 types incorrectly require a second 'profile' argument that is optional at runtime for tag-based invalidation
    revalidateTag('products')
    revalidatePath('/admin/products')
    revalidatePath('/shop')
}

// decrementStock removed - unsafe public exposure. Use RPC 'decrement_stock' via Service Role instead.

export async function getWaitlistedProducts(userId: string): Promise<Product[]> {
    const supabase = createAdminClient()
    
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

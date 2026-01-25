'use server'

import { createClient, createStaticClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/utils'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { productSchema, type ProductFormValues } from '@/lib/validations/product'
import type { Database, Tables, TablesInsert, TablesUpdate } from '@/types/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

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
    reviews?: { rating: number | null }[] | null
}



export type ProductSortOption = 'price_asc' | 'price_desc' | 'newest' | 'trending' | 'waitlist_desc' | 'random'

export type ProductFilter = {
  category_id?: string
  is_active?: boolean
  search?: string
  sort?: ProductSortOption
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
// Helper to apply filters consistently
// Helper to apply filters consistently
const applyProductFilters = (query: any, filter: ProductFilter) => {
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

    // Size and Color filters (require !inner join in select)
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
            // Smart Search: Name OR Description OR Tags
            // Using .or() with ilike for text fields and cs (contains) for array
            query = query.or(`name.ilike.%${filter.search}%,description.ilike.%${filter.search}%,expression_tags.cs.{${filter.search}}`)
        }
    }
    return query
}

async function fetchProducts(filter: ProductFilter, supabaseClient?: SupabaseClient<Database>): Promise<PaginatedResult<Product>> {
    const supabase = supabaseClient || createStaticClient()
    const page = filter.page || 1
    const limit = filter.limit || 10
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    // Resolve Category Slug to ID if necessary
    if (filter.category_id) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filter.category_id)
        if (!isUuid) {
            const { data: cat } = await supabase
                .from('categories')
                .select('id')
                .eq('slug', filter.category_id)
                .single()
            
            if (cat) {
                filter.category_id = cat.id
            } else {
                // Category slug not found -> ensure query returns nothing by using a never-matching UUID
                filter.category_id = '00000000-0000-0000-0000-000000000000'
            }
        }
    }

    // Special handling for Waitlist/Trending Sort (Two-Step Fetch)
    if (filter.sort === 'waitlist_desc' || filter.sort === 'trending') {
         // Determine select string to allow filtering
         let selectParams = 'id, created_at, preorders(count)'
         if (filter.size || filter.color) {
             selectParams = 'id, created_at, preorders(count), product_stock!inner(id)'
         }

         // 1. Fetch IDs matching ALL filters
         let query = supabase.from('products').select(selectParams)
         query = applyProductFilters(query, filter)
         
         const { data: allIds, error: idError } = await query
        
         if (idError) throw idError

         // 2. Sort in Memory
         // 2. Sort in Memory
         const sortedIds = (allIds || [])
            .map((p: any) => ({ 
                id: p.id, 
                count: p.preorders && Array.isArray(p.preorders) ? (p.preorders[0] as any)?.count || 0 : 0,
                created: new Date(p.created_at).getTime()
            }))
            .sort((a, b) => {
                // For Trending: Weigh Recency + Popularity?
                if (b.count !== a.count) return b.count - a.count
                return b.created - a.created
            })
        
        // 3. Paginate
        const total = sortedIds.length
        const sliced = sortedIds.slice(from, to)
        const targetIds = sliced.map((i) => i.id)

        // 4. Fetch Details
        const { data: details, error: detailError } = await supabase
            .from('products')
            .select('*, categories(name), product_stock(*), preorders(count)')
            .in('id', targetIds)
        
        if (detailError) throw detailError

        // Re-order details
        const orderedData = targetIds
            .map((id: string) => details?.find((d) => d.id === id))
            .filter(Boolean) as Product[]
            
        const processedData = (orderedData || []).map((p: any) => ({
             ...p,
             average_rating: Number(p.average_rating || 0),
             review_count: Number(p.review_count || 0),
             preorder_count: p.preorders && Array.isArray(p.preorders) ? (p.preorders[0] as any)?.count || 0 : 0
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

    // Standard Query Path (DB Sorting)
    let selectString = '*, categories(name), product_stock(*), preorders(count)'
    if (filter.size || filter.color) {
        selectString = '*, categories(name), product_stock!inner(*), preorders(count)'
    }

    let query = supabase
      .from('products')
      .select(selectString, { count: 'exact' })
    
    // Apply shared filters
    query = applyProductFilters(query, filter)

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
      case 'random' as ProductSortOption:
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
                }
            }
            throw error
        }

        const processedData = (data || []).map((p: any) => ({
            ...p,
            average_rating: Number(p.average_rating || 0),
            review_count: Number(p.review_count || 0),
            preorder_count: p.preorders && Array.isArray(p.preorders) ? (p.preorders[0] as any)?.count || 0 : 0
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
    } catch (err: unknown) {
        console.error('fetchProducts failed:', err)
        // If it's a known missing column error and we haven't already retried, try one last time with 'newest'
        if (typeof err === 'object' && err !== null && 'code' in err && (err as any).code === '42703' && filter.sort !== 'newest') {
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


export async function getProductsSecure(filter: ProductFilter = {}, client: SupabaseClient<Database>): Promise<PaginatedResult<Product>> {
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
function prepareProductData(data: ProductFormValues) {
  // STRICT WHITELIST of database columns
  const cleanData: TablesInsert<'products'> = {
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
    cleanData.size_options = Array.from(new Set(variants.map((v) => v.size).filter(Boolean)))
    cleanData.color_options = Array.from(new Set(variants.map((v) => v.color).filter(Boolean)))
  }
  
  return cleanData
}

export async function createProduct(productData: unknown) {
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
            const stockData = variants.map((v) => ({
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
    } catch (err: unknown) {
        console.error('[createProduct] Action Crash:', err)
        return { success: false, error: `Action Crash: ${(err as Error).message || 'Unknown'}` }
    }
}

export async function updateProduct(id: string, productData: unknown) {
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
                const stockData = variants.map((v) => ({
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
    } catch (err: unknown) {
        console.error('[updateProduct] Action Crash:', err)
        return { success: false, error: `Action Crash: ${(err as Error).message || 'Unknown'}` }
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

    // Define a join type locally or infer
    type ProductWithRatings = Product & { reviews: { rating: number | null }[] }

    return (data || []).map((p) => {
        const product = p as unknown as ProductWithRatings
        const ratings = product.reviews?.map((r) => r.rating).filter((r): r is number => r !== null) || []
        const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
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

    type ProductWithRatings = Product & { reviews: { rating: number | null }[] }

    return (data || []).map((p) => {
        const product = p as unknown as ProductWithRatings
        const ratings = product.reviews?.map((r) => r.rating).filter((r): r is number => r !== null) || []
        const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
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
            
            // AI-Style Recommendation Logic: "Complete the Look"
            // 1. Fetch Candidates: Items with overlapping tags OR same category
            // We fetch more items (12) to allow for in-memory scoring and re-ranking
            const limit = 12 
            
            const tags = product.expression_tags || []
            let candidates: Product[] = []

            if (tags.length > 0) {
                 // Try to find items with overlapping tags
                 const { data } = await supabase
                    .from('products')
                    .select('*, categories(name), product_stock(*), reviews(rating)')
                    .overlaps('expression_tags', tags)
                    .neq('id', product.id)
                    .eq('is_active', true)
                    .limit(limit)
                 
                 candidates = data || []
            }

            // If we don't have enough candidates, fill with category matches
            if (candidates.length < 4 && product.category_id) {
                const { data: filler } = await supabase
                    .from('products')
                    .select('*, categories(name), product_stock(*), reviews(rating)')
                    .eq('category_id', product.category_id)
                    .neq('id', product.id)
                    .eq('is_active', true)
                    .limit(limit - candidates.length)
                
                // Merge unique items
                const existingIds = new Set(candidates.map(c => c.id))
                ;(filler || []).forEach((item: any) => {
                    if (!existingIds.has(item.id)) {
                        candidates.push(item)
                    }
                })
            }

            // 2. Scoring Algorithm to Rank "Complete the Look"
            // Score = (Tag Overlap * 2) + (Cross-Category Bonus * 5)
            const scored = candidates.map((item) => {
                let score = 0
                
                // Tag overlap
                const itemTags = item.expression_tags || []
                const intersection = tags.filter((t: string) => itemTags.includes(t))
                score += intersection.length * 2

                // Cross-Category Bonus (Give variety)
                if (item.category_id !== product.category_id) {
                    score += 5
                }

                // Base score for simply existing (so we don't get 0s sorted randomly)
                score += 1

                return { item, score }
            })

            // Sort descending by score
            scored.sort((a, b) => b.score - a.score)

            // Take top 4 for the UI
            const finalProducts = scored.slice(0, 4).map((s) => s.item as Product)

            return finalProducts.map((p) => {
                const ratings = p.reviews?.map((r) => r.rating).filter((r): r is number => r !== null) || []
                const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
                return {
                    ...p,
                    average_rating: avg,
                    review_count: ratings.length
                } as Product
            })
        },
        ['related-products', key],
        { tags: ['products', 'related-products'], revalidate: 3600 } // 1 hour buffer
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
    // @ts-expect-error: Next.js 16 types incorrectly require a second 'profile' argument that is optional at runtime for tag-based invalidation
    revalidateTag('featured-products')
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
    // @ts-expect-error: Next.js 16 types incorrectly require a second 'profile' argument that is optional at runtime for tag-based invalidation
    revalidateTag('featured-products')
    revalidatePath('/admin/products')
    revalidatePath('/shop')
}

// decrementStock removed - unsafe public exposure. Use RPC 'decrement_stock' via Service Role instead.

export async function getWaitlistedProducts(userId: string): Promise<Product[]> {
    const supabase = createAdminClient()
    
    // 1. Get Preorders
    const { data: preorders, error } = await supabase
        .from('preorders')
        .select('product_id')
        .eq('user_id', userId)
    
    if (error || !preorders || preorders.length === 0) return []

    const productIds = preorders.map((p) => p.product_id)

    // 2. Get Products (Reusing existing fetcher logic or direct call)
    const { data: products } = await supabase
        .from('products')
        .select('*, categories(name), product_stock(*)')
        .in('id', productIds)
        .eq('is_active', true)
    
    return (products || []).map((p) => ({
        ...p,
        average_rating: 0, 
        review_count: 0
    })) as Product[]
}



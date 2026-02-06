'use server'

import { createClient, createStaticClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/utils'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { productSchema, type ProductFormValues } from '@/lib/validations/product'
import { logAdminAction } from '@/lib/admin-logger'
import type { Database, Tables, TablesInsert, TablesUpdate } from '@/types/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

export type Product = Tables<'products'> & {
    original_price?: number | null
    categories?: { name: string } | null
    product_stock?: Tables<'product_stock'>[]
    fit_options?: string[] | null
    average_rating?: number
    review_count?: number
    images?: {
        thumbnail: string
        mobile: string
        desktop: string
    } | null
    preorder_count?: number
    reviews?: { rating: number | null }[] | null
    total_stock?: number
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
  is_carousel_featured?: boolean
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
const applyProductFilters = (query: any, filter: ProductFilter) => {
    if (filter.is_active !== undefined) {
      if (filter.is_active) {
          query = query.eq('status', 'active')
      } else {
          // If asking for inactive, we might mean draft/archived, but usually filter is for 'active' only
          query = query.neq('status', 'active')
      }
    }

    if (filter.is_carousel_featured !== undefined) {
      query = query.eq('is_carousel_featured', filter.is_carousel_featured)
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

    // Size and Color filters (using .ilike for case-insensitive matching)
    if (filter.size) {
        query = query.ilike('product_stock.size', filter.size)
    }

    if (filter.color) {
        query = query.ilike('product_stock.color', filter.color)
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
    
    // Resolve Category Slug to ID
    if (filter.category_id && typeof filter.category_id === 'string' && filter.category_id.trim() !== '') {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filter.category_id)
        if (!isUuid) {
            const { data: cat } = await supabase.from('categories').select('id').eq('slug', filter.category_id).single()
            filter.category_id = cat ? cat.id : '00000000-0000-0000-0000-000000000000'
        }
    } else if (filter.category_id === '') {
        filter.category_id = undefined
    }

    // Base Query
    let query = supabase
        .from('products')
        .select('*, categories(name), product_stock(*), reviews(rating)', { count: 'exact' })
    
    // Apply Filters
    query = applyProductFilters(query, filter)

    // Apply Sorting
    // Native DB Sorting via 'total_stock' column (added in migration 20260202160000)
    
    // PRIMARY SORT: Availability (In Stock items first)
    // We assume 'total_stock > 0' implies available.
    // To sort "In Stock" first: Order by total_stock DESC is roughly correct for volume, 
    // but strictly we want (total_stock > 0) DESC. 
    // PostgreSQL boolean sort: true > false.
    // For now, simpler: user usually expects high stock or newness. 
    // Let's follow the previous logic: "In Stock First".
    // Since we can't easily do complex expression sorting in basic Supabase JS client without RPC,
    // we will rely on primary sort keys.
    
    if (!filter.sort || filter.sort === 'newest') {
        // "Smart Default": Active & In-Stock items appear top, then by date needed?
        // Actually, previous logic was: In Stock First (local sort), THEN Date.
        // We can approximate this by ordering by `total_stock` descending? No, that puts high stock first.
        // If we really need "In Stock vs Out of Stock" as primary, we might need a view again.
        // However, most admins prefer seeing NEWEST first.
        // Let's stick to the requested Sort Option.
        query = query.order('created_at', { ascending: false }).order('id', { ascending: true })
    } else {
        switch (filter.sort) {
            case 'price_asc':
                query = query.order('price', { ascending: true }).order('id', { ascending: true })
                break
            case 'price_desc':
                query = query.order('price', { ascending: false }).order('id', { ascending: true })
                break
            case 'trending':
                 // Fallback to sale_count if available or reviews?
                query = query.order('created_at', { ascending: false }).order('id', { ascending: true }) 
                break
            case 'waitlist_desc':
                 // Preorders is a separate table, difficult to sort by without join/view.
                 // For now, fallback to created_at
                 query = query.order('created_at', { ascending: false }).order('id', { ascending: true })
                 break

             default:
                query = query.order('created_at', { ascending: false })
        }
    }

    // Pagination
    query = query.range(from, to)

    const { data, count, error } = await query

    if (error) {
        console.error('fetchProducts error:', error)
        // For storefront reliability: Return empty data instead of crashing the whole page
        return {
            data: [],
            meta: {
                total: 0,
                page,
                limit,
                totalPages: 0
            }
        }
    }

    // Client-side mapping for computed fields that couldn't be done in SQL easily
    // (though 'average_rating' could be a DB view too)
    const processedData = (data || []).map(formatProduct)

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

// Public Cached Methods
export async function getProducts(filter: ProductFilter = {}): Promise<PaginatedResult<Product>> {
    const key = JSON.stringify(filter)
    // Lower cache time for random sort to 60s, otherwise 1 hour
    const revalidateTime = filter.sort === 'random' ? 60 : 3600
    
    return unstable_cache(
        async () => fetchProducts(filter),
        ['products-list-stock-v1', key], // Versioned key to bust old non-stock-sorted cache
        { tags: ['products'], revalidate: revalidateTime }
    )()
}


export async function getProductsSecure(filter: ProductFilter = {}, client: SupabaseClient<Database>): Promise<PaginatedResult<Product>> {
    return fetchProducts(filter, client)
}

export async function getFeaturedProducts(): Promise<Product[]> {
    return unstable_cache(
        async () => {
             const supabase = createStaticClient()
             const { data } = await supabase
                .from('products')
                .select('*, categories(name), product_stock(*), reviews(rating)')
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(8)
            
             return (data || []).map(formatProduct)
        },
        ['featured-products'],
        { tags: ['featured-products'], revalidate: 3600 } 
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
    const ratings = p.reviews?.map((r: any) => r.rating).filter((r: any): r is number => r !== null) || []
    const avg = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0
    
    return {
        ...p,
        average_rating: avg || Number(p.average_rating || 0),
        review_count: ratings.length || Number(p.review_count || 0),
        preorder_count: p.preorders && Array.isArray(p.preorders) ? (p.preorders[0] as any)?.count || 0 : 0
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
    original_price: data.original_price ? Number(data.original_price) : null,
    category_id: data.category_id || null, // Critical: Prevent "" for UUID
    main_image_url: data.main_image_url,
    gallery_image_urls: data.gallery_image_urls || [],
    expression_tags: data.expression_tags || [],
    is_active: data.is_active ?? true,
    is_carousel_featured: data.is_carousel_featured ?? false,
    status: data.status || "draft",
    cost_price: data.cost_price ? Number(data.cost_price) : 0,
    sku: data.sku || null,
    seo_title: data.seo_title || null,
    seo_description: data.seo_description || null,
  }

  // Derive options from variants
  if (data.variants && Array.isArray(data.variants)) {
    const variants = data.variants
    cleanData.size_options = Array.from(new Set(variants.map((v) => v.size).filter(Boolean)))
    cleanData.color_options = Array.from(new Set(variants.map((v) => v.color).filter(Boolean)))
    cleanData.fit_options = Array.from(new Set(variants.map((v) => v.fit).filter(Boolean)))
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
                fit: v.fit || "Regular",
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

        await logAdminAction('products', productId, 'CREATE', { name: validated.data.name })

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
                    fit: v.fit || "Regular",
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

        await logAdminAction('products', id, 'UPDATE', updateData)

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
    
    await logAdminAction('products', id, 'DELETE')
    
    // Defensive Revalidation
    try {
        // @ts-expect-error: Next.js 16 types incorrectly require a second 'profile' argument
        revalidateTag('products')
        // @ts-expect-error: Next.js 16 types incorrectly require a second 'profile' argument
        revalidateTag('featured-products')
        revalidatePath('/admin/products')
        revalidatePath('/shop')
    } catch (e) {
        console.warn('[deleteProduct] Revalidation failed:', e)
    }
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
    if (!ids || ids.length === 0) return []
    const supabase = createStaticClient()
    
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
    const supabase = createStaticClient()
    
    // Only fetch ACTIVE products
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name), product_stock(*), reviews(rating)')
      .in('id', ids)
      .eq('status', 'active')
    
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
                    .select(`
                        id, name, slug, price, original_price, main_image_url, 
                        gallery_image_urls, is_active, is_carousel_featured, category_id, 
                        expression_tags, created_at,
                        categories(name), product_stock(*), reviews(rating)
                    `)
                    .overlaps('expression_tags', tags)
                    .neq('id', product.id)
                    .eq('status', 'active')
                    .limit(limit)
                 
                 candidates = (data as unknown as Product[]) || []
            }

            // If we don't have enough candidates, fill with category matches
            if (candidates.length < 4 && product.category_id) {
                const { data: filler } = await supabase
                    .from('products')
                    .select(`
                        id, name, slug, price, original_price, main_image_url, 
                        gallery_image_urls, is_active, is_carousel_featured, category_id, 
                        expression_tags, created_at,
                        categories(name), product_stock(*), reviews(rating)
                    `)
                    .eq('category_id', product.category_id)
                    .neq('id', product.id)
                    .eq('status', 'active')
                    .limit(limit - candidates.length)
                
                // Merge unique items
                const existingIds = new Set(candidates.map(c => c.id))
                ;(filler || []).forEach((item: any) => {
                    if (!existingIds.has(item.id)) {
                        candidates.push(item as unknown as Product)
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
            // Take top 4 for the UI
            const finalProducts = scored.slice(0, 4).map((s) => s.item as unknown as Product)

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

export async function toggleProductCarousel(id: string, isFeatured: boolean) {
    await requireAdmin()
    const supabase = createAdminClient()
    const { error } = await supabase
        .from('products')
        .update({ is_carousel_featured: isFeatured })
        .eq('id', id)
    
    if (error) throw error

    // Revalidate paths and tags for the carousel
    try {
        revalidatePath('/')
        revalidatePath('/admin/products')
        // @ts-expect-error: Next.js types incorrectly require a second 'profile' argument
        revalidateTag('featured-products')
        // @ts-expect-error: Next.js types incorrectly require a second 'profile' argument
        revalidateTag('products')
    } catch (e) {
        console.warn('[toggleProductCarousel] Revalidation failed:', e)
    }
}

// decrementStock removed - unsafe public exposure. Use RPC 'decrement_stock' via Service Role instead.

export async function getWaitlistedProducts(userId: string): Promise<Product[]> {
    const supabase = await createClient()
    
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



'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function getWaitlistUsers(productId: string) {
    const supabase = await createClient()

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }
    
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Unauthorized' }

    const adminClient = createAdminClient()

    // Fetch Preorders + Profile Names
    const { data: preorders, error } = await adminClient
        .from('preorders' as any)
        .select(`
            created_at,
            user_id,
            profiles (
                name
            )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

    if (error) throw error
    if (!preorders) return { data: [] }

    // Enrich with Emails using Admin Client
    // Enrich with Emails using Admin Client
    // adminClient already initiated above
    
    // Process in parallel
    const enrichedData = await Promise.all(preorders.map(async (item: any) => {
        const { data: { user: authUser }, error: authError } = await adminClient.auth.admin.getUserById(item.user_id)
        return {
            ...item,
            email: authUser?.email || 'N/A'
        }
    }))

    return { data: enrichedData }
}

export async function getAllPreorders() {
    const supabase = await createClient()

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }
    
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Unauthorized' }

    const adminClient = createAdminClient()

    // Fetch All Preorders
    const { data: preorders, error } = await adminClient
        .from('preorders' as any)
        .select(`
            id,
            created_at,
            user_id,
            product_id,
            profiles (name),
            products (name, main_image_url, slug, product_stock(quantity))
        `)
        .order('created_at', { ascending: false })

    if (error) throw error
    if (!preorders) return { data: [] }

    // Enrich with Emails using Admin Client
    // Enrich with Emails using Admin Client
    // adminClient already initiated above
    
    // We can optimize by fetching unique user IDs first if many duplicates, but parallel map is fine for MVP scale
    const enrichedData = await Promise.all(preorders.map(async (item: any) => {
        const { data: { user: authUser } } = await adminClient.auth.admin.getUserById(item.user_id)
        return {
            ...item,
            email: authUser?.email || 'N/A',
            product_name: item.products?.name || 'Unknown Product',
            product_image: item.products?.main_image_url || '',
            product_slug: item.products?.slug,
            product_stock: item.products?.product_stock?.reduce((a: number, c: any) => a + (c.quantity || 0), 0) || 0,
            user_name: item.profiles?.name || 'Unknown User'
        }
    }))

    return { data: enrichedData }
}

export async function getWaitlistStats() {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    
    // Check auth briefly (optional for stats but good practice)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { count: 0, potentialRevenue: 0 }

    const { data: preorders, error } = await adminClient
        .from('preorders' as any)
        .select(`
            id,
            products (price)
        `)

    if (error) return { count: 0, potentialRevenue: 0 }
    
    // Calculate potential revenue (sum of prices of all waitlisted items)
    const potentialRevenue = (preorders || []).reduce((acc: number, curr: any) => {
        return acc + (curr.products?.price || 0)
    }, 0)

    return { count: preorders?.length || 0, potentialRevenue }
}

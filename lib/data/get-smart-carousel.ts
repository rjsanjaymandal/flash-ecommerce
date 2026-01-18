import { createAdminClient } from "@/lib/supabase/admin"

export async function getSmartCarouselData() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('[getSmartCarouselData] Missing environment variables (SUPABASE_SERVICE_ROLE_KEY)');
        return [];
    }
    const supabase = createAdminClient()
    
    // Select specific fields as requested + product_stock for filtering
    const { data } = await supabase
        .from('products')
        .select(`
            id, 
            name, 
            description, 
            price, 
            main_image_url, 
            slug, 
            created_at, 
            color_options,
            size_options,
            product_stock(quantity)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20) // Fetch buffer to account for out-of-stock items

    if (!data) return []

    // Client-side filtering for stock > 0
    const smartData = data
        .filter(p => {
            const totalStock = p.product_stock?.reduce((sum: number, s: any) => sum + s.quantity, 0) || 0
            return totalStock > 0
        })
        .slice(0, 5) // Limit to top 5

    return smartData
}

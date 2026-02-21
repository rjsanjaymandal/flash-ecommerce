import { createStaticClient } from "@/lib/supabase/server"

export async function getSmartCarouselData() {
    const supabase = createStaticClient()
    
    // Select specific fields as requested + product_stock for filtering
    const { data } = await supabase
        .from('products')
        .select(`
            id, 
            name, 
            description, 
            price, 
            original_price,
            main_image_url, 
            slug, 
            created_at, 
            color_options,
            size_options,
            product_stock(quantity)
        `)
        .eq('status', 'active')
        .eq('is_carousel_featured', true)
        .order('created_at', { ascending: false })
        .limit(40) // Increased buffer to ensure 15 in-stock items are available

    if (!data) return []

    // Client-side filtering for stock > 0
    const smartData = data
        .filter(p => {
            const totalStock = p.product_stock?.reduce((sum: number, s: any) => sum + s.quantity, 0) || 0
            return totalStock > 0
        })
        .slice(0, 15) // Increased limit to 15 products

    return smartData
}

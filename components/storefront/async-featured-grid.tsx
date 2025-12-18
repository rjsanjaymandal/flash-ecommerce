import { getProducts } from "@/lib/services/product-service"
import { FeaturedGrid } from "@/components/storefront/featured-grid"

export async function AsyncFeaturedGrid() {
    const { data: products } = await getProducts({
        is_active: true,
        limit: 8,
        sort: 'newest'
    })

    return (
        <FeaturedGrid 
            products={products || []} 
            title="NEW ARRIVALS" 
            subtitle="The latest drops and freshest fits, curated just for you."
            badge="Just In"
        />
    )
}

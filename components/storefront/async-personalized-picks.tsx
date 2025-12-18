import { getProducts } from "@/lib/services/product-service"
import { PersonalizedPicks } from "@/components/storefront/personalized-picks"

export async function AsyncPersonalizedPicks() {
    const { data: picks } = await getProducts({
        is_active: true,
        limit: 4,
        sort: 'random' as any
    })

    return <PersonalizedPicks products={picks || []} />
}

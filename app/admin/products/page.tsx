
import { getProducts, getAdminProducts } from '@/lib/services/product-service'
import { ProductsClient } from './products-client'

export const revalidate = 0 // Ensure fresh data on every request for admin
// Rebuild trigger: Force update for new preorder service logic

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string, q?: string, status?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const search = params.q || ''
  
  const { data: products, meta } = await getAdminProducts({
      page,
      search,
      limit: 10,
      sort: 'newest'
  })

  return <ProductsClient initialProducts={products} meta={meta} />
}


import { getProducts } from '@/lib/services/product-service'
import { ProductsClient } from './products-client'

export const revalidate = 0 // Ensure fresh data on every request for admin

export default async function ProductsPage() {
  const products = await getProducts()
  return <ProductsClient initialProducts={products} />
}

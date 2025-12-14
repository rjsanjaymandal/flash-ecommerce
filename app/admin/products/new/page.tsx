
import { getLinearCategories } from '@/lib/services/category-service'
import CreateProductPageClient from '../create-product-page'

export const revalidate = 0

export default async function NewProductPage() {
  const categories = await getLinearCategories()
  return <CreateProductPageClient categories={categories || []} />
}

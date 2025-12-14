
import { getProductBySlug } from '@/lib/services/product-service'
import { ProductDetailClient } from './product-detail'
import { notFound } from 'next/navigation'

export const revalidate = 60 // Revalidate every minute

export default async function ProductPage({ params }: { params: { slug: string } }) {
  // In Next.js 15, params might be a promise, but for now we treat it as standard. 
  // If this errors we will await it.
  const { slug } = await params 

  const product = await getProductBySlug(slug)
  console.log(`[ProductPage] Fetching: ${slug}`)
  if (product) {
      console.log(`[ProductPage] Found: ${product.name}, Stock:`, product.product_stock)
  } else {
      console.log(`[ProductPage] Not Found: ${slug}`)
  }

  if (!product) {
    notFound()
  }

  return <ProductDetailClient product={product} />
}

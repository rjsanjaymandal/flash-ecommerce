// Imports
import { getProductBySlug, getRelatedProducts } from '@/lib/services/product-service'
import { getReviews } from '@/app/actions/review-actions'
import { ProductDetailClient } from './product-detail'
import { ReviewSection } from '@/components/reviews/review-section'
import { RecentlyViewed } from '@/components/products/recently-viewed'
import { NewsletterSection } from '@/components/marketing/newsletter-section'
import { ProductCarousel } from '@/components/products/product-carousel'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { notFound } from 'next/navigation'

export const revalidate = 60 // Revalidate every minute

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = await params 

  // Parallel Fetching for performance
  const productData = getProductBySlug(slug)
  
  // We need product logic to get ID for reviews/related, so wait for product first
  const product = (await productData) as any

  if (!product) {
    notFound()
  }

  // Fetch Reviews and Related in parallel
  const [reviews, relatedProducts] = await Promise.all([
      getReviews(product.id),
      getRelatedProducts(product.id, product.category_id)
  ])

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.main_image_url,
    description: product.description,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Flash',
    },
    offers: {
      '@type': 'Offer',
      url: `https://flash-ecommerce.vercel.app/product/${slug}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: (product.product_stock?.some((s: any) => s.quantity > 0)) 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
    },
  }

  return (
      <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ProductDetailClient product={product} />
        
        <div className="container mx-auto px-4 lg:px-8 space-y-20 pb-20">
            {/* Reviews */}
            <ReviewSection productId={product.id} reviews={reviews as any[]} />

            {/* Related Products */}
            <ProductCarousel products={relatedProducts} />

            {/* Recently Viewed */}
            <RecentlyViewed currentProduct={product} />
        </div>
        
        <NewsletterSection />
      </>
  )
}

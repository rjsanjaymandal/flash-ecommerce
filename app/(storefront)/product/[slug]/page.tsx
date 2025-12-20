// Imports
import { getProductBySlug, getRelatedProducts } from '@/lib/services/product-service'
import { getReviews } from '@/app/actions/review-actions'
import { ProductDetailClient } from './product-detail'
import { ReviewSection } from '@/components/reviews/review-section'
import { RecentlyViewed } from '@/components/products/recently-viewed'
import { NewsletterSection } from '@/components/marketing/newsletter-section'
import { ProductCarousel } from '@/components/products/product-carousel'
import { ProductJsonLd } from '@/components/seo/product-json-ld'
import { notFound } from 'next/navigation'

export const revalidate = 60 // Revalidate every minute

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) return { title: 'Product Not Found' }

  const title = `${product.name} | Flash Brand`
  const description = (product.description || `Buy ${product.name} on Flash Store. Premium Streetwear 2025.`).slice(0, 160)
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.main_image_url ? [product.main_image_url] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.main_image_url ? [product.main_image_url] : [],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://flashhfashion.in'}/product/${product.slug}`,
    }
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
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

  // Calculate Review Stats
  const reviewCount = reviews.length
  const averageRating = reviewCount > 0
      ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewCount).toFixed(1)
      : '0.0'

  return (
      <>
        <ProductJsonLd product={{...product, stock: product.product_stock?.some((s: any) => s.quantity > 0) ? 1 : 0}} />
        <ProductDetailClient product={product} initialReviews={{ count: reviewCount, average: averageRating }} />
        
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

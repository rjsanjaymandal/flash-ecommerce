// Imports
import { getProductBySlug, getRelatedProducts } from '@/lib/services/product-service'
import { getReviews } from '@/app/actions/review-actions'
import { ProductDetailClient } from './product-detail'
import { ReviewSection } from '@/components/reviews/review-section'
import { RecentlyViewed } from '@/components/products/recently-viewed'
import { NewsletterSection } from '@/components/marketing/newsletter-section'
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

  return (
      <>
        <ProductDetailClient product={product} />
        
        <div className="container mx-auto px-4 lg:px-8 space-y-20 pb-20">
            {/* Reviews */}
            <ReviewSection productId={product.id} reviews={reviews as any[]} />

            {/* Related Products */}
            {relatedProducts && relatedProducts.length > 0 && (
                <div className="py-12 border-t border-border/60">
                    <h2 className="text-2xl font-light tracking-tight mb-8">You Might Also Like</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedProducts.map((p: any) => (
                            <Link key={p.id} href={`/product/${(p as any).slug || p.id}`} className="group block">
                                <div className="aspect-[3/4] bg-muted mb-4 rounded-md overflow-hidden relative">
                                    {p.main_image_url ? (
                                        <img src={p.main_image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-secondary">No Image</div>
                                    )}
                                </div>
                                <h3 className="font-medium truncate pr-4">{p.name}</h3>
                                <p className="text-muted-foreground text-sm">{formatCurrency(p.price)}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Recently Viewed */}
            <RecentlyViewed currentProduct={product} />
        </div>
        
        <NewsletterSection />
      </>
  )
}

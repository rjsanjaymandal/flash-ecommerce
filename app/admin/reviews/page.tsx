import { getReviews } from '@/lib/services/review-service'
import { ReviewsClient } from './reviews-client'

export const revalidate = 0

export default async function ReviewsPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string, q?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const search = params.q || ''
  
  const { data: reviews, meta } = await getReviews(page, 10, search)

  return <ReviewsClient initialReviews={reviews} meta={meta} />
}

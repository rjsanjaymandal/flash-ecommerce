import { getReviews } from '@/lib/services/review-service'
import { ReviewsClient } from './reviews-client'

export const metadata = {
  title: 'Admin | Reviews',
  description: 'Moderate customer reviews',
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const page = Number(resolvedParams.page) || 1
  const search = (resolvedParams.q as string) || ''

  // Fetch reviews
  const { data: reviews, meta } = await getReviews(search, page)

  return <ReviewsClient initialReviews={reviews} meta={meta} />
}

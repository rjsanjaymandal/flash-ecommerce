import { getAllPreorders, getWaitlistStats } from '@/app/actions/admin-preorder'
import { WaitlistClient } from './waitlist-client'

export const revalidate = 0

export default async function WaitlistPage() {
  const [{ data: preorders, error }, stats] = await Promise.all([
      getAllPreorders(),
      getWaitlistStats()
  ])

  if (error) {
      return <div>Error loading waitlist</div>
  }

  return <WaitlistClient initialPreorders={preorders || []} stats={stats} />
}

import { getAllPreorders } from '@/app/actions/admin-preorder'
import { WaitlistClient } from './waitlist-client'

export const revalidate = 0

export default async function WaitlistPage() {
  const { data: preorders, error } = await getAllPreorders()

  if (error) {
      return <div>Error loading waitlist</div>
  }

  return <WaitlistClient initialPreorders={preorders || []} />
}

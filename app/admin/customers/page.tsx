import { getCustomers } from '@/lib/services/customer-service'
import { CustomersClient } from './customers-client'

export const revalidate = 0

export default async function CustomersPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string, q?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const search = params.q || ''
  
  const { data: customers, meta } = await getCustomers(search, page, 10)

  return <CustomersClient initialCustomers={customers} meta={meta} />
}

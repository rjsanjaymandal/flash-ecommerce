'use server'

import { createClient } from '@/lib/supabase/server'

// Reuse paginated result type
import { PaginatedResult } from './product-service'

export async function getCustomers(search: string = '', page: number = 1, limit: number = 10): Promise<PaginatedResult<any>> {
  const supabase = await createClient()
  const from = (page - 1) * limit
  const to = from + limit - 1
  
  // 1. Fetch profiles with pagination first
  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search) {
     const cleanSearch = search.trim()
     query = query.or(`name.ilike.%${cleanSearch}%,email.ilike.%${cleanSearch}%`)
  }

  query = query.range(from, to)

  const { data: profiles, error, count } = await query
  if (error) throw error

  if (!profiles || profiles.length === 0) {
      return {
          data: [],
          meta: { total: 0, page, limit, totalPages: 0 }
      }
  }

  // 2. Fetch stats ONLY for these profiles to avoid massive join on all users
  const profileIds = profiles.map(p => p.id)
  
  // We can't easily do a "join" here for aggregation efficiently without a view or RPC.
  // Instead, we'll run parallel queries for these users.
  // Or, since we have the profiles, we can fetch their orders and cart items.
  
  const { data: interactions } = await supabase
    .from('profiles')
    .select('id, orders(id, total, status, created_at), cart_items(count), wishlist_items(count)')
    .in('id', profileIds)

  // 3. Merge data
  const enrichedCustomers = profiles.map(profile => {
      const interaction = interactions?.find(i => i.id === profile.id)
      const orders = interaction?.orders || []
      const totalSpent = orders
        .filter((o: any) => o.status === 'paid')
        .reduce((acc: number, curr: any) => acc + Number(curr.total), 0)
      
      const lastOrder = orders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

      return {
          ...profile,
          stats: {
              totalOrders: orders.length,
              totalSpent,
              lastOrderDate: lastOrder?.created_at,
              cartCount: interaction?.cart_items?.[0]?.count || 0,
              wishlistCount: interaction?.wishlist_items?.[0]?.count || 0
          }
      }
  })

  return {
      data: enrichedCustomers,
      meta: {
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit)
      }
  }
}

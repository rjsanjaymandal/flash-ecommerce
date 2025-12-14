'use server'

import { createClient } from '@/lib/supabase/server'

export async function getCustomers(search: string = '') {
  const supabase = await createClient()
  
  // Fetch profiles and link their orders to calculate stats
  let query = supabase
    .from('profiles')
    .select('*, orders(id, total, status, created_at)')
    .order('created_at', { ascending: false })

  if (search) {
    query = query.ilike('email', `%${search}%`) // Search by email for now, or name if preferred
  }

  const { data, error } = await query
  if (error) throw error

  // Enhance data with computed stats
  const customers = data.map((profile: any) => {
      const orders = profile.orders || []
      const totalSpent = orders
        .filter((o: any) => o.status === 'paid')
        .reduce((acc: number, curr: any) => acc + Number(curr.total), 0)
      
      const lastOrder = orders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

      return {
          ...profile,
          stats: {
              totalOrders: orders.length,
              totalSpent,
              lastOrderDate: lastOrder?.created_at
          }
      }
  })

  return customers
}

'use server'

import { createClient } from '@/lib/supabase/server'

export type OrderFilter = {
  status?: string
  limit?: number
  page?: number
}

// Converted to standalone async functions (Server Actions)
// This allows Client Components to import and call them directly without "fs/headers" errors.

export async function getOrders(filter: OrderFilter = {}) {
  const supabase = await createClient()
  let query = supabase
    .from('orders')
    .select('*, profiles(name, email)')
    .order('created_at', { ascending: false })

  if (filter.status) {
    query = query.eq('status', filter.status as any)
  }

  if (filter.limit) {
    query = query.limit(filter.limit)
  }

  const { data, error, count } = await query
  if (error) throw error
  // Serialize Supabase response (it's already JSON, but just to be safe with Dates if needed)
  return { data, count }
}

export async function getStats() {
  const supabase = await createClient()
  
  // Independent Promises for Fault Tolerance
  const totalOrdersPromise = supabase.from('orders').select('*', { count: 'exact', head: true })
  const totalRevenuePromise = supabase.from('orders').select('total').eq('status', 'paid')
  const totalProductsPromise = supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true)
  const totalCustomersPromise = supabase.from('profiles').select('*', { count: 'exact', head: true })
  
  const [ordersRes, revenueRes, productsRes, customersRes] = await Promise.allSettled([
      totalOrdersPromise,
      totalRevenuePromise,
      totalProductsPromise,
      totalCustomersPromise
  ])

  const stats = {
      totalOrders: ordersRes.status === 'fulfilled' ? ordersRes.value.count || 0 : 0,
      totalRevenue: revenueRes.status === 'fulfilled' && revenueRes.value.data 
          ? revenueRes.value.data.reduce((acc: number, curr: any) => acc + Number(curr.total), 0) 
          : 0,
      totalProducts: productsRes.status === 'fulfilled' ? productsRes.value.count || 0 : 0,
      totalCustomers: customersRes.status === 'fulfilled' ? customersRes.value.count || 0 : 0,
      // Pass arrays to avoid undefined errors
      recentOrders: [] 
  }

  return stats
}

export async function getMonthlyRevenue() {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('orders')
      .select('total, created_at')
      .eq('status', 'paid')
      .order('created_at', { ascending: true })

    if (error) throw error
    if (!data) return []

    const monthlyRevenue: Record<string, number> = {}
    
    data.forEach((order: any) => {
        const date = new Date(order.created_at)
        const month = date.toLocaleString('default', { month: 'short' }) // e.g., "Dec"
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + Number(order.total)
    })

    return Object.entries(monthlyRevenue).map(([name, total]) => ({ name, total }))
}

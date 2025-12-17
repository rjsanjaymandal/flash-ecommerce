'use server'

import { createClient } from '@/lib/supabase/server'

import { PaginatedResult } from './product-service'

export type OrderFilter = {
  status?: string
  limit?: number
  page?: number
  search?: string
}

export async function getOrders(filter: OrderFilter = {}): Promise<PaginatedResult<any>> {
  const supabase = await createClient()
  const page = filter.page || 1
  const limit = filter.limit || 10
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('orders')
    .select('*, profiles(name)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (filter.status && filter.status !== 'all') {
    query = query.eq('status', filter.status as any)
  }

  // NOTE: Supabase doesn't support ILIKE across foreign keys easily in one query without complex RPC or embedding.
  // We will filter by Order ID first. For Profile Name/Email, it's safer to rely on ID search or proper relation filter if enabled.
  if (filter.search) {
      if (filter.search.includes('-')) {
          // Likely UUID
          query = query.eq('id', filter.search)
      } else {
         // Fallback to searching order string or partial ID
         query = query.ilike('id', `%${filter.search}%`)
      }
  }

  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error

  return { 
      data: data || [], 
      meta: {
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit)
      }
  }
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

export async function updateOrderStatus(orderId: string, newStatus: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus as any })
        .eq('id', orderId)
    
    if (error) throw error
    return { success: true }
}

export async function getSalesByCategory() {
    const supabase = await createClient()
    
    // Join orders -> order_items -> products -> categories
    // We need to filter for 'paid' orders to be accurate for revenue
    const { data, error } = await supabase
        .from('order_items')
        .select(`
            quantity,
            unit_price,
            orders!inner(status),
            products(categories(name))
        `)
        .eq('orders.status', 'paid')

    if (error) {
        console.error('Error fetching category sales:', error)
        return []
    }

    const categoryRevenue: Record<string, number> = {}

    data.forEach((item: any) => {
        const categoryName = item.products?.categories?.name || 'Uncategorized'
        const revenue = (item.quantity || 0) * (item.unit_price || 0)
        categoryRevenue[categoryName] = (categoryRevenue[categoryName] || 0) + revenue
    })

    // Format for Recharts: [{ name: 'Category', value: 1234 }]
    return Object.entries(categoryRevenue)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value) // Highest revenue first
}

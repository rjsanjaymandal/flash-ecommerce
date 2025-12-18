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
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filter.search)
      if (isUuid) {
          query = query.eq('id', filter.search)
      } else {
          query = query.ilike('shipping_name', `%${filter.search}%`)
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
  
  const now = new Date()
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()

  // 1. Fetch current totals
  const totalOrdersPromise = supabase.from('orders').select('*', { count: 'exact', head: true })
  const totalRevenuePromise = supabase.from('orders').select('total').eq('status', 'paid')
  const totalProductsPromise = supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true)
  const totalCustomersPromise = supabase.from('profiles').select('*', { count: 'exact', head: true })

  // 2. Fetch last month's comparisons
  const lastMonthOrdersPromise = supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', firstDayLastMonth).lte('created_at', lastDayLastMonth)
  const lastMonthRevenuePromise = supabase.from('orders').select('total').eq('status', 'paid').gte('created_at', firstDayLastMonth).lte('created_at', lastDayLastMonth)

  const [ordersRes, revenueRes, productsRes, customersRes, lastOrdersRes, lastRevRes] = await Promise.allSettled([
      totalOrdersPromise,
      totalRevenuePromise,
      totalProductsPromise,
      totalCustomersPromise,
      lastMonthOrdersPromise,
      lastMonthRevenuePromise
  ])

  const totalRevenue = revenueRes.status === 'fulfilled' && revenueRes.value.data 
      ? revenueRes.value.data.reduce((acc: number, curr: any) => acc + Number(curr.total), 0) 
      : 0

  const lastMonthRevenue = lastRevRes.status === 'fulfilled' && lastRevRes.value.data
      ? lastRevRes.value.data.reduce((acc: number, curr: any) => acc + Number(curr.total), 0)
      : 0

  const stats = {
      totalOrders: ordersRes.status === 'fulfilled' ? ordersRes.value.count || 0 : 0,
      totalRevenue: totalRevenue,
      totalProducts: productsRes.status === 'fulfilled' ? productsRes.value.count || 0 : 0,
      totalCustomers: customersRes.status === 'fulfilled' ? customersRes.value.count || 0 : 0,
      
      revenueGrowth: lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0,
      orderGrowth: lastOrdersRes.status === 'fulfilled' && (lastOrdersRes.value.count || 0) > 0 
          ? (((ordersRes.status === 'fulfilled' ? (ordersRes.value.count || 0) : 0) - lastOrdersRes.value.count!) / lastOrdersRes.value.count!) * 100 
          : 0,
      averageOrderValue: (ordersRes.status === 'fulfilled' && ordersRes.value.count! > 0) ? (totalRevenue / ordersRes.value.count!) : 0,
      recentOrders: [] 
  }

  return stats
}

export async function getTopProducts(limit: number = 5) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('sale_count', { ascending: false })
        .limit(limit)

    if (error) throw error
    return data || []
}

export async function getRecentActivity(limit = 10) {
    const supabase = await createClient()

    try {
        const [ordersRes, reviewsRes, subscribersRes] = await Promise.all([
            supabase.from('orders').select('id, created_at, total, shipping_name').order('created_at', { ascending: false }).limit(limit),
            supabase.from('reviews').select('id, created_at, user_name, rating').order('created_at', { ascending: false }).limit(limit),
            supabase.from('newsletter_subscribers').select('id, created_at, email').order('created_at', { ascending: false }).limit(limit)
        ])

        const events: any[] = []

        if (ordersRes.data) {
            ordersRes.data.forEach(o => events.push({
                id: o.id,
                type: 'order',
                title: `New Order for ₹${o.total}`,
                description: `By ${o.shipping_name || 'Guest'}`,
                time: o.created_at
            }))
        }

        if (reviewsRes.data) {
            reviewsRes.data.forEach(r => events.push({
                id: r.id,
                type: 'review',
                title: `New ${r.rating}-Star Review`,
                description: `By ${r.user_name || 'Anonymous'}`,
                time: r.created_at
            }))
        }

        if (subscribersRes.data) {
            subscribersRes.data.forEach(s => events.push({
                id: s.id,
                type: 'newsletter',
                title: `New Subscriber`,
                description: s.email,
                time: s.created_at
            }))
        }

        return events.sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, limit)
    } catch (err) {
        console.error('Activity Feed Error:', err)
        return []
    }
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
    // We use explicit joins to avoid relationship name ambiguity
    const { data, error } = await supabase
        .from('order_items')
        .select(`
            quantity,
            unit_price,
            order:orders!inner(status),
            product:products!inner(category:categories!inner(name))
        `)
        .eq('order.status', 'paid')

    if (error) {
        console.error('Error fetching category sales:', error)
        return []
    }

    const categoryRevenue: Record<string, number> = {}

    data.forEach((item: any) => {
        const categoryName = item.product?.category?.name || 'Uncategorized'
        const revenue = (item.quantity || 0) * (item.unit_price || 0)
        categoryRevenue[categoryName] = (categoryRevenue[categoryName] || 0) + revenue
    })

    // Format for Recharts: [{ name: 'Category', value: 1234 }]
    return Object.entries(categoryRevenue)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value) // Highest revenue first
}

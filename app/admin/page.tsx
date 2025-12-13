'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Package, ShoppingBag, Users, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

function DashboardCard({ title, value, icon: Icon, description, className }: any) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const supabase = createClient()

  // 1. Fetch Stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Parallel requests for speed
      const [
        { count: orderCount, error: orderError },
        { data: paidOrders, error: revError },
        { count: productCount, error: prodError },
        { count: lowStockCount, error: stockError },
        { data: recentOrders, error: recentError }
      ] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total').eq('status', 'paid') as any, // Only counting PAID revenue
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('product_stock').select('*', { count: 'exact', head: true }).lt('quantity', 10), // Low stock threshold
        supabase.from('orders').select('*, profiles(name)').order('created_at', { ascending: false }).limit(5)
      ])

      if (orderError || revError || prodError || stockError || recentError) throw new Error('Failed to fetch stats')

      const totalRevenue = paidOrders?.reduce((acc: number, order: any) => acc + Number(order.total), 0) || 0

      return {
        totalOrders: orderCount || 0,
        totalRevenue,
        totalProducts: productCount || 0,
        lowStockCount: lowStockCount || 0,
        recentOrders: recentOrders || []
      }
    }
  })

  if (isLoading) return <div className="p-8">Loading dashboard analytics...</div>

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
            title="Total Revenue" 
            value={formatCurrency(stats?.totalRevenue || 0)}
            icon={DollarSign}
            description="Lifetime paid orders"
        />
        <DashboardCard 
            title="Total Orders" 
            value={stats?.totalOrders}
            icon={ShoppingBag}
            description="All orders placed"
        />
         <DashboardCard 
            title="Active Products" 
            value={stats?.totalProducts}
            icon={Package}
            description="In your catalog"
        />
        <DashboardCard 
            title="Low Stock Alerts" 
            value={stats?.lowStockCount}
            icon={AlertTriangle}
            description="Variants with < 10 items"
            className={(stats?.lowStockCount || 0) > 0 ? "border-destructive/50 bg-destructive/5" : ""}
        />
      </div>

      {/* Recent Sales Table */}
      <div className="rounded-xl border border-border bg-card">
        <div className="p-6">
            <h3 className="text-lg font-medium">Recent Sales</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                        <th className="px-6 py-3 font-medium">Order ID</th>
                        <th className="px-6 py-3 font-medium">Customer</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium text-right">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {stats?.recentOrders.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No orders yet.</td></tr>
                    ) : (
                        stats?.recentOrders.map((order: any) => (
                            <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                                <td className="px-6 py-4">
                                    <div className="font-medium">{order.profiles?.name || 'Guest'}</div>
                                    <div className="text-xs text-muted-foreground">{order.profiles?.email || 'No email'}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                        ${order.status === 'paid' ? 'bg-green-100 text-green-800' : 
                                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-gray-100 text-gray-800'}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-medium">
                                    {formatCurrency(order.total)}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  )
}

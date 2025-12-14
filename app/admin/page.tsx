'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DollarSign, Package, ShoppingBag, Users, Activity, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function DashboardCard({ title, value, icon: Icon, description, trend, className }: any) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && (
            <div className="flex items-center gap-1 mt-2 text-xs text-green-600 font-medium">
                <TrendingUp className="h-3 w-3" />
                {trend}
            </div>
        )}
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
        { data: recentOrders, error: recentError },
        { count: customerCount }
      ] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total, created_at').eq('status', 'paid') as any, // Only counting PAID revenue
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('product_stock').select('*', { count: 'exact', head: true }).lt('quantity', 10), // Low stock threshold
        supabase.from('orders').select('*, profiles(name, email)').order('created_at', { ascending: false }).limit(5),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ])

      if (orderError || revError || prodError || stockError || recentError) throw new Error('Failed to fetch stats')

      const totalRevenue = paidOrders?.reduce((acc: number, order: any) => acc + Number(order.total), 0) || 0

      // Calculate monthly revenue for chart
      const monthlyRevenue = paidOrders?.reduce((acc: any, order: any) => {
        const month = new Date(order.created_at).toLocaleString('default', { month: 'short' })
        acc[month] = (acc[month] || 0) + Number(order.total)
        return acc
      }, {})

      const chartData = Object.entries(monthlyRevenue || {}).map(([name, total]) => ({
        name,
        total: Number(total)
      })).slice(-6) // Last 6 months

      return {
        totalOrders: orderCount || 0,
        totalRevenue,
        totalProducts: productCount || 0,
        lowStockCount: lowStockCount || 0,
        recentOrders: recentOrders || [],
        customerCount: customerCount || 0,
        chartData
      }
    }
  })

  if (isLoading) return <div className="p-8 flex items-center justify-center h-96">Loading dashboard analytics...</div>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          {/* CalendarDateRangePicker if needed */}
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
            title="Total Revenue" 
            value={formatCurrency(stats?.totalRevenue || 0)}
            icon={DollarSign}
            description="Lifetime paid orders"
            trend="+20.1% from last month"
        />
        <DashboardCard 
            title="Total Orders" 
            value={stats?.totalOrders}
            icon={ShoppingBag}
            description="All orders placed"
            trend="+15% from last month"
        />
         <DashboardCard 
            title="Active Products" 
            value={stats?.totalProducts}
            icon={Package}
            description="In your catalog"
        />
        <DashboardCard 
            title="Active Customers" 
            value={stats?.customerCount}
            icon={Users}
            description="Registered users"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Monthly revenue breakdown.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={stats?.chartData}>
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px' }}
                        />
                        <Bar 
                            dataKey="total" 
                            fill="currentColor" 
                            radius={[4, 4, 0, 0]} 
                            className="fill-primary" 
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                    You made {stats?.recentOrders.length} sales recently.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {stats?.recentOrders.map((order: any) => (
                        <div key={order.id} className="flex items-center">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src="/avatars/01.png" alt="Avatar" />
                                <AvatarFallback>{order.profiles?.name?.[0] || 'G'}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{order.profiles?.name || 'Guest User'}</p>
                                <p className="text-xs text-muted-foreground">
                                    {order.profiles?.email || 'no-email'}
                                </p>
                            </div>
                            <div className="ml-auto font-medium">+{formatCurrency(order.total)}</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}

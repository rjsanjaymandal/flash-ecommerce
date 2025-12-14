'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DollarSign, Package, ShoppingBag, Users, Activity, TrendingUp, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getStats, getMonthlyRevenue, getOrders } from '@/lib/services/order-service' // Service Integration - Server Actions

// Separate components for fault isolation could be done, but for now we centralize robust fetching.

function DashboardCard({ title, value, icon: Icon, description, trend, className, loading, error }: any) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
             <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        ) : error ? (
             <div className="text-red-500 text-xs flex items-center"><AlertTriangle className="h-3 w-3 mr-1"/> Failed</div>
        ) : (
            <>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
                {trend && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-green-600 font-medium">
                        <TrendingUp className="h-3 w-3" />
                        {trend}
                    </div>
                )}
            </>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  
  // 1. Fetch Stats (Fault Tolerant via Service)
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
        // We use the service which implements Promise.allSettled internally for key metrics
        const baseStats = await getStats()
        const chartData = await getMonthlyRevenue()
        const { data: recentOrders } = await getOrders({ limit: 5 })

        return {
            ...baseStats,
            chartData,
            recentOrders: recentOrders || []
        }
    }
  })

  // Note: Even if useQuery fails hard (network down), we show a generic error state. 
  // But our Service layer tries to ensure 'stats' object is populated with 0s on partial db failures.

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
            title="Total Revenue" 
            value={formatCurrency(stats?.totalRevenue || 0)}
            icon={DollarSign}
            description="Lifetime paid orders"
            loading={isLoading}
            error={!!error}
        />
        <DashboardCard 
            title="Total Orders" 
            value={stats?.totalOrders}
            icon={ShoppingBag}
            description="All orders placed"
            loading={isLoading}
            error={!!error}
        />
         <DashboardCard 
            title="Total Products" 
            value={stats?.totalProducts}
            icon={Package}
            description="Active in catalog"
            loading={isLoading}
            error={!!error}
        />
        <DashboardCard 
            title="Customers" 
            value={stats?.totalCustomers}
            icon={Users}
            description="Registered users"
            loading={isLoading}
            error={!!error}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Monthly revenue breakdown.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                {isLoading ? (
                    <div className="h-[350px] w-full flex items-center justify-center bg-muted/10">Loading chart...</div>
                ) : (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={stats?.chartData || []}>
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
                )}
            </CardContent>
        </Card>
        
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                    Latest transactions from your store.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {isLoading ? (
                         <div className="space-y-4">
                            {[1,2,3].map(i => <div key={i} className="h-12 w-full bg-muted animate-pulse rounded-lg" />)}
                         </div>
                    ) : stats?.recentOrders.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No recent orders.</p>
                    ) : (
                        stats?.recentOrders.map((order: any) => (
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
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}

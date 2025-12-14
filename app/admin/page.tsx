'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DollarSign, Package, ShoppingBag, Users, Activity, TrendingUp, AlertTriangle, Calendar } from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getStats, getMonthlyRevenue, getOrders } from '@/lib/services/order-service' 

function DashboardCard({ title, value, icon: Icon, description, trend, className, loading, error, iconClassName, trendValue }: any) {
  return (
    <Card className={cn("border-none shadow-sm bg-card/50 backdrop-blur-sm transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("p-2 rounded-xl bg-background border shadow-xs", iconClassName)}>
            <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
             <div className="space-y-2">
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                <div className="h-3 w-16 bg-muted animate-pulse rounded" />
             </div>
        ) : error ? (
             <div className="text-red-500 text-xs flex items-center bg-red-500/10 p-2 rounded-md w-fit"><AlertTriangle className="h-3 w-3 mr-1"/> Failed to load</div>
        ) : (
            <div>
                <div className="text-3xl font-black tracking-tight">{value}</div>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">{description}</p>
                    {trend && (
                        <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            <TrendingUp className="h-3 w-3" />
                            {trendValue || '+12.5%'}
                        </div>
                    )}
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  
  // 1. Fetch Stats 
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
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

  const today = new Date()
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-3xl font-black tracking-tight relative">
                Dashboard
                <span className="absolute -top-1 -right-3 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            </h2>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> {dateString}
            </p>
        </div>
        <div className="flex items-center gap-2">
            {/* Can add date range picker here later */}
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
            title="Total Revenue" 
            value={formatCurrency(stats?.totalRevenue || 0)}
            icon={DollarSign}
            description="Lifetime paid volume"
            loading={isLoading}
            error={!!error}
            iconClassName="text-emerald-500 bg-emerald-500/10 border-emerald-200/50"
            trend={true}
            trendValue="+20.1%" // Mock for now
        />
        <DashboardCard 
            title="Orders" 
            value={stats?.totalOrders}
            icon={ShoppingBag}
            description="Total transactions"
            loading={isLoading}
            error={!!error}
            iconClassName="text-blue-500 bg-blue-500/10 border-blue-200/50"
            trend={true}
            trendValue="+15%"
        />
         <DashboardCard 
            title="Products" 
            value={stats?.totalProducts}
            icon={Package}
            description="Active inventory"
            loading={isLoading}
            error={!!error}
            iconClassName="text-purple-500 bg-purple-500/10 border-purple-200/50"
        />
        <DashboardCard 
            title="Customers" 
            value={stats?.totalCustomers}
            icon={Users}
            description="Registered user base"
            loading={isLoading}
            error={!!error}
            iconClassName="text-orange-500 bg-orange-500/10 border-orange-200/50"
            trend={true}
             trendValue="+4"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly performance visualizer.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                {isLoading ? (
                    <div className="h-[350px] w-full flex items-center justify-center bg-muted/10 rounded-xl">
                        <Activity className="h-8 w-8 text-muted-foreground animate-pulse" />
                    </div>
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
                                cursor={{ fill: 'rgba(var(--primary), 0.1)' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar 
                                dataKey="total" 
                                fill="currentColor" 
                                radius={[6, 6, 0, 0]} 
                                className="fill-primary" 
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
        
        <Card className="col-span-3 border-none shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                    Latest transactions from your store.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-8 pr-2 max-h-[350px] overflow-y-auto">
                    {isLoading ? (
                         <div className="space-y-4">
                            {[1,2,3].map(i => <div key={i} className="h-16 w-full bg-muted animate-pulse rounded-xl" />)}
                         </div>
                    ) : stats?.recentOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                             <ShoppingBag className="h-8 w-8 mb-2 opacity-50" />
                             <p>No sales yet.</p>
                        </div>
                    ) : (
                        stats?.recentOrders.map((order: any) => (
                            <div key={order.id} className="flex items-center group p-2 rounded-xl hover:bg-muted/50 transition-colors">
                                <Avatar className="h-10 w-10 border-2 border-background shadow-xs">
                                    <AvatarImage src={`https://avatar.vercel.sh/${order.profiles?.email || 'guest'}`} alt="Avatar" />
                                    <AvatarFallback>{order.profiles?.name?.[0] || 'G'}</AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-bold leading-none">{order.profiles?.name || 'Guest User'}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {order.profiles?.email || 'no-email'}
                                    </p>
                                </div>
                                <div className="ml-auto font-black text-sm bg-background/80 py-1 px-3 rounded-full border shadow-xs">
                                    {formatCurrency(order.total)}
                                </div>
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

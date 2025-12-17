'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DollarSign, Package, ShoppingBag, Users, Activity, TrendingUp, AlertTriangle, Calendar, PieChart as PieChartIcon } from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function DashboardCard({ title, value, icon: Icon, description, trend, className, iconClassName, trendValue }: any) {
  return (
    <Card className={cn("border-none shadow-sm bg-card/50 backdrop-blur-sm transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("p-2 rounded-xl bg-background border shadow-xs", iconClassName)}>
            <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}

export function DashboardClient({ stats, chartData, categoryData, recentOrders }: { stats: any, chartData: any[], categoryData: any[], recentOrders: any[] }) {
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
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
            title="Total Revenue" 
            value={formatCurrency(stats?.totalRevenue || 0)}
            icon={DollarSign}
            description="Lifetime paid volume"
            iconClassName="text-emerald-500 bg-emerald-500/10 border-emerald-200/50"
            trend={true}
            trendValue="+20.1%" 
        />
        <DashboardCard 
            title="Orders" 
            value={stats?.totalOrders}
            icon={ShoppingBag}
            description="Total transactions"
            iconClassName="text-blue-500 bg-blue-500/10 border-blue-200/50"
            trend={true}
            trendValue="+15%"
        />
         <DashboardCard 
            title="Products" 
            value={stats?.totalProducts}
            icon={Package}
            description="Active inventory"
            iconClassName="text-purple-500 bg-purple-500/10 border-purple-200/50"
        />
        <DashboardCard 
            title="Customers" 
            value={stats?.totalCustomers}
            icon={Users}
            description="Registered user base"
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
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
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
                            cursor={{ stroke: '#4f46e5', strokeWidth: 1 }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area
                            type="monotone" 
                            dataKey="total" 
                            stroke="#4f46e5" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorTotal)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        
        <Card className="col-span-3 border-none shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>
                    Revenue distribution across top categories.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#4f46e5', '#8b5cf6', '#ec4899', '#0ea5e9', '#f59e0b', '#10b981'][index % 6]} strokeWidth={0} />
                            ))}
                        </Pie>
                        <Tooltip 
                             formatter={(value: number) => formatCurrency(value)}
                             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                 </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                    Latest transactions from your store.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-8 pr-2 max-h-[350px] overflow-y-auto">
                    {recentOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                             <ShoppingBag className="h-8 w-8 mb-2 opacity-50" />
                             <p>No sales yet.</p>
                        </div>
                    ) : (
                        recentOrders.map((order: any) => (
                            <div key={order.id} className="flex items-center group p-2 rounded-xl hover:bg-muted/50 transition-colors">
                                <Avatar className="h-10 w-10 border-2 border-background shadow-xs">
                                    <AvatarImage src={`https://avatar.vercel.sh/${order.user_id || 'guest'}`} alt="Avatar" />
                                    <AvatarFallback>{order.profiles?.name?.[0] || 'G'}</AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-bold leading-none">{order.profiles?.name || order.shipping_name || 'Guest User'}</p>
                                    <p className="text-xs text-muted-foreground">
                                        ID: {order.id.slice(0, 8)}...
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

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, ShoppingCart, Users, ArrowUpRight, Activity, MessageSquare, Mail, Zap } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RevenueChart } from "@/components/admin/analytics/revenue-chart"
import { CategoryPieChart } from "@/components/admin/analytics/category-pie"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface DashboardClientProps {
  stats: any
  recentOrders: any[]
  chartData: any[]
  categoryData: any[]
  activity?: any[]
}

export function DashboardClient({ stats, recentOrders, chartData, categoryData, activity = [] }: DashboardClientProps) {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
            <h2 className="text-3xl font-black tracking-tight uppercase italic flex items-center gap-3">
                <Zap className="h-8 w-8 text-primary fill-primary" />
                COMMAND <span className="text-muted-foreground font-light">CENTER</span>
            </h2>
            <p className="text-muted-foreground text-sm">Real-time store performance & intelligence.</p>
        </div>
        <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
                 <Link href="/admin/orders">View All Orders</Link>
             </Button>
             <Button size="sm">Refresh Data</Button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 hover:border-primary/20 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Revenue</CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black italic">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className={cn(
                "text-[10px] font-black uppercase tracking-tighter mt-1",
                stats.revenueGrowth >= 0 ? "text-emerald-500" : "text-rose-500"
            )}>
                {stats.revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.revenueGrowth).toFixed(1)}% vs last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-2 hover:border-primary/20 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Orders</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black italic">{stats.totalOrders}</div>
            <p className={cn(
                "text-[10px] font-black uppercase tracking-tighter mt-1",
                stats.orderGrowth >= 0 ? "text-emerald-500" : "text-rose-500"
            )}>
                {stats.orderGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.orderGrowth).toFixed(1)}% vs last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/20 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Products</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Package className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black italic">{stats.totalProducts}</div>
            <p className="text-[10px] font-black uppercase tracking-tighter mt-1 text-muted-foreground">
                In Active Catalog
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/20 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Customers</CardTitle>
            <div className="h-8 w-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-violet-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black italic">{stats.totalCustomers}</div>
            <p className="text-[10px] font-black uppercase tracking-tighter mt-1 text-muted-foreground">
                Total Registered Users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-2">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-tighter italic">Revenue Over Time</CardTitle>
            <CardDescription>Monthly performance analytics for 2025.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <RevenueChart data={chartData} />
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="col-span-3 border-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-lg font-black uppercase tracking-tighter italic">Intelligence Feed</CardTitle>
                <CardDescription>Real-time store events.</CardDescription>
            </div>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
                {activity.length === 0 ? (
                    <p className="text-center text-muted-foreground py-10">No recent activity</p>
                ) : (
                    activity.map((item: any) => (
                        <div key={item.id} className="flex gap-4 group">
                            <div className={cn(
                                "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border-2 transition-all group-hover:scale-110",
                                item.type === 'order' && "bg-emerald-50 border-emerald-100 text-emerald-600",
                                item.type === 'review' && "bg-amber-50 border-amber-100 text-amber-600",
                                item.type === 'newsletter' && "bg-blue-50 border-blue-100 text-blue-600"
                            )}>
                                {item.type === 'order' && <ShoppingCart className="h-5 w-5" />}
                                {item.type === 'review' && <MessageSquare className="h-5 w-5" />}
                                {item.type === 'newsletter' && <Mail className="h-5 w-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black italic uppercase leading-none truncate">{item.title}</p>
                                <p className="text-xs text-muted-foreground truncate font-medium mt-1">{item.description}</p>
                                <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-widest mt-1">
                                    {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid for Table and Cateogry */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 pb-8">
        {/* Recent Orders Table */}
        <Card className="lg:col-span-5 border-2">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-black uppercase tracking-tighter italic">Recent Sales</CardTitle>
                <Button asChild size="sm" variant="ghost" className="font-black uppercase tracking-widest text-[10px]">
                    <Link href="/admin/orders" className="flex items-center gap-1">
                        Full History <ArrowUpRight className="h-3 w-3" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest">Order</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest">Customer</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                            <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentOrders.map((order) => (
                            <TableRow key={order.id} className="hover:bg-muted/20 transition-colors">
                                <TableCell className="font-mono text-xs text-primary">
                                    #{order.id.slice(0, 8).toUpperCase()}
                                </TableCell>
                                <TableCell className="font-medium text-sm">
                                    {order.profiles?.name || order.shipping_name || 'Guest'}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn(
                                        "uppercase text-[10px] font-black px-2 py-0",
                                        order.status === 'paid' && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                                        order.status === 'pending' && "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                    )}>
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-black italic">₹{order.total}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        {/* Category Pie */}
        <Card className="lg:col-span-2 border-2">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-tighter italic">Vibe Share</CardTitle>
            <CardDescription>Performance by category.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <CategoryPieChart data={categoryData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

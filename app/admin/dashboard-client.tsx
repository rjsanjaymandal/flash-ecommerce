'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, ShoppingCart, Users, ArrowUpRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RevenueChart } from "@/components/admin/analytics/revenue-chart"
import { CategoryPieChart } from "@/components/admin/analytics/category-pie"
import { Badge } from "@/components/ui/badge"

interface DashboardClientProps {
  stats: any
  recentOrders: any[]
  chartData: any[]
  categoryData: any[]
}

export function DashboardClient({ stats, recentOrders, chartData, categoryData }: DashboardClientProps) {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">+19 New Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+201 since last hour</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
                Monthly revenue for the current year.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <RevenueChart data={chartData} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>
              Distribution across product categories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={categoryData} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <div className="grid gap-4 md:grid-cols-1">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                  <div className="space-y-1">
                     <CardTitle>Recent Orders</CardTitle>
                     <CardDescription>You made {stats.totalOrders} sales this month.</CardDescription>
                  </div>
                  <Button asChild size="sm" variant="outline" className="gap-1">
                      <Link href="/admin/orders">
                        View All <ArrowUpRight className="h-4 w-4" />
                      </Link>
                  </Button>
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Order</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentOrders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">
                                    <Link href={`/admin/orders/${order.id}`} className="hover:underline text-primary">
                                        #{order.id.slice(0, 8)}
                                    </Link>
                                </TableCell>
                                <TableCell>{order.profiles?.name || 'Guest User'}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="uppercase text-xs">{order.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">${order.total}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
              </CardContent>
          </Card>
      </div>
    </div>
  )
}

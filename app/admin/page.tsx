'use client'

import { Users, DollarSign, ShoppingBag, Activity } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
function StatCard({ title, value, icon: Icon, description }: any) {
    return (
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{title}</h3>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="pt-2">
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </div>
    )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
      revenue: 0,
      activeOrders: 0,
      products: 0,
      customers: 0,
      recentOrders: [] as any[]
  })
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
        // Parallel fetch for speed
        const [
            { count: productCount },
            { count: customerCount },
            { data: orders }
        ] = await Promise.all([
            supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
            supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(10)
        ])
        
        // Calculate revenue and active orders from 'orders' fetch (or separate aggregation query)
        // Since we only fetched 10 recent, we can't calc total revenue accurately without a massive read or RPC.
        // For this MVP, we will sum the recent 10 or just use a placeholder for "Total Revenue" if avoiding RPC.
        // Let's do a simple count for active orders.
        
        const { count: activeOrdersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).neq('status', 'delivered').neq('status', 'cancelled')

        setStats({
            revenue: 0, // Needs RPC for total sum efficiency, leaving 0 or implementing client side calc if dataset small.
            activeOrders: activeOrdersCount || 0,
            products: productCount || 0,
            customers: customerCount || 0,
            recentOrders: orders || []
        })
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your store's performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
            title="Total Revenue" 
            value="N/A" 
            icon={DollarSign} 
            description="Requires RPC" 
        />
        <StatCard 
            title="Active Orders" 
            value={stats.activeOrders} 
            icon={ShoppingBag} 
            description="Pending processing" 
        />
         <StatCard 
            title="Active Products" 
            value={stats.products} 
            icon={Activity} 
            description="Live on store" 
        />
        <StatCard 
            title="Total Customers" 
            value={stats.customers} 
            icon={Users} 
            description="Registered users" 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Recent Sales</h3>
            <div className="mt-8 flex items-center justify-center h-40 bg-muted/20 rounded-lg text-muted-foreground text-sm">
                Chart Placeholder
            </div>
        </div>
        <div className="col-span-3 rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Recent Orders</h3>
             <div className="space-y-4">
                {stats.recentOrders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between">
                         <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">Order #{order.id.slice(0,6)}</p>
                            <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                         </div>
                         <div className="font-medium">${order.total}</div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  )
}

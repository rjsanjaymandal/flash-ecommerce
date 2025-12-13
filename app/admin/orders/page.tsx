'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select(`
            *,
            profiles:user_id (name, id)
        `)
        .order('created_at', { ascending: false })
      
      if (data) setOrders(data)
      setIsLoading(false)
    }
    fetchOrders()
  }, [])

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'paid': return 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20'
          case 'shipped': return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
          case 'delivered': return 'bg-green-500/10 text-green-600 border-green-500/20'
          case 'cancelled': return 'bg-red-500/10 text-red-600 border-red-500/20'
          default: return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
      }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : orders.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">No orders found.</TableCell></TableRow>
            ) : (
                orders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                        <TableCell>{order.shipping_name || (order.profiles as any)?.name || 'Guest'}</TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>${order.total}</TableCell>
                        <TableCell>
                            <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", getStatusColor(order.status))}>
                                {order.status}
                            </span>
                        </TableCell>
                        <TableCell className="text-right">
                             <Button variant="ghost" size="icon" asChild>
                                <Link href={`/admin/orders/${order.id}`}>
                                    <Eye className="h-4 w-4" />
                                </Link>
                             </Button>
                        </TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

'use client'

import { useAuth } from "@/context/auth-context"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Loader2, Package } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AccountPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    const fetchOrders = async () => {
        const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        
        setOrders(data || [])
        setLoading(false)
    }

    fetchOrders()
  }, [user])

  if (authLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>

  if (!user) {
      return (
          <div className="h-screen flex flex-col items-center justify-center gap-4">
              <h1 className="text-2xl font-bold">Please Login</h1>
              <Button asChild><Link href="/login">Login</Link></Button>
          </div>
      )
  }

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
        <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                {user.email?.[0].toUpperCase()}
            </div>
            <div>
                <h1 className="text-3xl font-bold">My Account</h1>
                <p className="text-muted-foreground">{user.email}</p>
            </div>
        </div>

        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <h2 className="text-xl font-bold">Order History</h2>
            </div>
            
            {loading ? (
                <div>Loading orders...</div>
            ) : orders.length === 0 ? (
                <div className="text-muted-foreground">No orders found.</div>
            ) : (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            order.status === 'Delivered' ? 'bg-green-500/10 text-green-500' :
                                            order.status === 'Shipped' ? 'bg-blue-500/10 text-blue-500' :
                                            'bg-yellow-500/10 text-yellow-500'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-bold">${order.total_amount}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    </div>
  )
}

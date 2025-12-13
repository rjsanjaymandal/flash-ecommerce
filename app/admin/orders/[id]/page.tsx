'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card' // We need to create Card properly or use divs
import { ChevronLeft } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Need Select component, or use native select for speed

// Standard Select is better, but requires complex primitives from radix.
// I'll use a native <select> for "Speed" unless I want to implement the full shadcn Select now.
// I'll stick to a styled native select for this prototype iteration to avoid 5 more files.

export default function OrderDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return

      const { data: orderData } = await supabase
        .from('orders')
        .select('*, profiles:user_id(*)')
        .eq('id', id)
        .single()
      
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id)
      
      if (orderData) setOrder(orderData)
      if (itemsData) setItems(itemsData)
      setIsLoading(false)
    }
    fetchOrder()
  }, [id])

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return
    setIsUpdating(true)
    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id)
    
    if (!error) {
        setOrder({ ...order, status: newStatus })
    }
    setIsUpdating(false)
  }

  if (isLoading) return <div>Loading...</div>
  if (!order) return <div>Order not found</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Order #{order.id}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content: Items */}
        <div className="md:col-span-2 space-y-6">
             <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-semibold mb-4">Order Items</h2>
                <div className="space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 bg-muted rounded-md overflow-hidden">
                                     {/* Image placeholders would go here */}
                                     <div className="h-full w-full bg-secondary/30 flex items-center justify-center text-xs text-muted-foreground">IMG</div>
                                </div>
                                <div>
                                    <p className="font-medium">{item.name_snapshot || 'Product'}</p>
                                    <p className="text-sm text-muted-foreground">Size: {item.size} • Color: {item.color}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">${item.unit_price}</p>
                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 border-t border-border pt-4 text-right space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${order.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>${order.shipping_fee}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2">
                        <span>Total</span>
                        <span>${order.total}</span>
                    </div>
                </div>
             </div>
        </div>

        {/* Sidebar: Customer & Status */}
        <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-semibold mb-4">Status</h2>
                <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={order.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isUpdating}
                >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-semibold mb-4">Customer</h2>
                <div className="space-y-1 text-sm">
                    <p className="font-medium">{order.shipping_name}</p>
                    <p className="text-muted-foreground">{order.profiles?.email || 'No email'}</p>
                    <p className="text-muted-foreground">{order.phone}</p>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-semibold mb-4">Shipping Address</h2>
                <div className="space-y-1 text-sm text-muted-foreground">
                    <p>{order.address_line1}</p>
                    {order.address_line2 && <p>{order.address_line2}</p>}
                    <p>{order.city}, {order.state} {order.pincode}</p>
                    <p>{order.country}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

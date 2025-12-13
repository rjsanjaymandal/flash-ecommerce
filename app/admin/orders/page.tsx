'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const STATUS_OPTIONS = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']

export default function OrdersPage() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const { data: orders, isLoading } = useQuery<any[]>({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, profiles(name)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    }
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
        const { error } = await (supabase.from('orders') as any).update({ status }).eq('id', id)
        if (error) throw error
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] }) // Update dashboard too
    },
    onError: (err) => {
        alert('Failed to update status: ' + err.message)
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading orders...</TableCell></TableRow>
            ) : orders?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">No orders found.</TableCell></TableRow>
            ) : (
                orders?.map((order) => (
                <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                    <TableCell>
                        <div className="font-medium">{order.profiles?.name || 'Guest'}</div>
                        <div className="text-xs text-muted-foreground">{order.profiles?.email}</div>
                    </TableCell>
                    <TableCell>{formatCurrency(order.total)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                        {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                        <select 
                            className={`h-8 w-32 rounded-md border text-xs font-medium px-2
                                ${order.status === 'paid' ? 'bg-green-50 border-green-200 text-green-700' : 
                                  order.status === 'shipped' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                  'bg-background border-input'}`}
                            value={order.status}
                            onChange={(e) => updateStatusMutation.mutate({ id: order.id, status: e.target.value })}
                            disabled={updateStatusMutation.isPending}
                        >
                            {STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                        </select>
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

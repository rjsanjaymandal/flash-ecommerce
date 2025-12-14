'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { Loader2, Package, Eye, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function OrdersPage() {
  const supabase = createClient()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const { data: orders = [], isLoading } = useQuery<any[]>({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, profiles(name, email)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    }
  })

  // Filter Logic
  const filteredOrders = orders?.filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(search.toLowerCase()) || 
        order.profiles?.name?.toLowerCase().includes(search.toLowerCase()) ||
        order.profiles?.email?.toLowerCase().includes(search.toLowerCase())
      
      const matchesStatus = activeTab === 'all' || order.status === activeTab
      
      return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
      switch (status) {
          case 'pending': return 'secondary' // Grey/Standard
          case 'paid': return 'default' // Primary/Black
          case 'processing': return 'default' // Primary
          case 'shipped': return 'outline' // Outline/Blue-ish in some themes
          case 'delivered': return 'success' as any // Custom success variant if exists, else outline
          case 'cancelled': return 'destructive'
          default: return 'secondary'
      }
  }

  // Helper to ensure 'success' variant doesn't crash if missingtypes, use outline + className
  const StatusBadge = ({ status }: { status: string }) => {
      let variant: any = "secondary"
      let className = ""

      if (status === 'paid') variant = "default"
      if (status === 'shipped') { variant = "outline"; className="text-blue-600 border-blue-200 bg-blue-50" }
      if (status === 'delivered') { variant = "outline"; className="text-green-600 border-green-200 bg-green-50" }
      if (status === 'cancelled') variant = "destructive"
      
      return <Badge variant={variant} className={className}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
           <p className="text-muted-foreground">Manage and track customer orders.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between rounded-lg border p-4 bg-card shadow-sm">
         <div className="relative flex-1 max-w-sm">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input 
                 placeholder="Search Order ID, Name..." 
                 className="pl-9" 
                 value={search} 
                 onChange={(e) => setSearch(e.target.value)}
             />
         </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={6} className="text-center py-16 text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin mb-2"/>Loading...</TableCell></TableRow>
                    ) : filteredOrders?.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center py-16 text-muted-foreground">No orders found.</TableCell></TableRow>
                    ) : (
                        filteredOrders?.map((order) => (
                        <TableRow key={order.id} className="group hover:bg-muted/30 transition-colors">
                            <TableCell className="font-mono text-xs font-medium">#{order.id.slice(0, 8)}</TableCell>
                            <TableCell>
                                <div className="font-medium text-sm">{order.profiles?.name || 'Guest'}</div>
                                <div className="text-xs text-muted-foreground">{order.profiles?.email}</div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-medium text-sm">{formatCurrency(order.total)}</TableCell>
                            <TableCell>
                                <StatusBadge status={order.status} />
                            </TableCell>
                            <TableCell className="text-right">
                                <Button size="sm" variant="outline" asChild>
                                    <Link href={`/admin/orders/${order.id}`}>
                                        View Details
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                        ))
                    )}
                </TableBody>
                </Table>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

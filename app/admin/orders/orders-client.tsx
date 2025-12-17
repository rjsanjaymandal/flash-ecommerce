'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { Search, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { Pagination } from '@/components/shared/pagination'
import { useRouter, useSearchParams } from 'next/navigation'

export function OrdersClient({ initialOrders, meta, status }: { initialOrders: any[], meta: any, status: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [search, setSearch] = useState(searchParams.get('q') || '')
    const [activeTab, setActiveTab] = useState(status || 'all')

    // Debounce Search
    useEffect(() => {
        const handler = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString())
            if (search) {
                params.set('q', search)
                params.set('page', '1')
            } else {
                params.delete('q')
            }
            router.replace(`?${params.toString()}`)
        }, 500)
        return () => clearTimeout(handler)
    }, [search, router, searchParams])

    // Handle Tab Change
    const handleTabChange = (val: string) => {
        setActiveTab(val)
        const params = new URLSearchParams(searchParams.toString())
        params.set('status', val)
        params.set('page', '1') // Reset page on filter change
        router.push(`?${params.toString()}`)
    }

    const StatusBadge = ({ status }: { status: string }) => {
        let variant: any = "secondary"
        let className = ""

        if (status === 'paid') variant = "default"
        if (status === 'shipped') { variant = "outline"; className = "text-blue-600 border-blue-200 bg-blue-50" }
        if (status === 'delivered') { variant = "outline"; className = "text-green-600 border-green-200 bg-green-50" }
        if (status === 'cancelled') variant = "destructive"

        return <Badge variant={variant} className={className}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
    }

    return (
        <div className="space-y-6 animate-in fade-in">
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
                        placeholder="Search Order ID..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="space-y-4">
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
                                {initialOrders.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-16 text-muted-foreground">No orders found.</TableCell></TableRow>
                                ) : (
                                    initialOrders.map((order) => (
                                        <TableRow key={order.id} className="group hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-mono text-xs font-medium">#{order.id.slice(0, 8)}</TableCell>
                                            <TableCell>
                                                <div className="font-medium text-sm">
                                                    {order.profiles?.name || order.shipping_name || 'Guest'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">{order.user_id ? 'Registered' : 'Guest'}</div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(order.created_at).toLocaleDateString('en-US')}
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
                    
                    <div className="border-t p-4 bg-gray-50/50">
                         <Pagination currentPage={meta.page} totalPages={meta.totalPages} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

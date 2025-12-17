'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, cn } from '@/lib/utils'
import { Plus, Search, Filter, ArrowUpDown, FileSpreadsheet, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { updateOrderStatus } from '@/lib/services/order-service'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs' // Unused
import { DataTablePagination } from '@/components/ui/data-table-pagination'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export function OrdersClient({ initialOrders, meta, status }: { initialOrders: any[], meta: any, status: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [search, setSearch] = useState(searchParams.get('q') || '')
    const currentStatus = searchParams.get('status')

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

    // Removed handleTabChange as Tabs component is replaced by custom buttons

    // Removed StatusBadge component as it's replaced by inline logic and DropdownMenu

    // Status Badge Helper
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'secondary'
            case 'paid': return 'default'
            case 'shipped': return 'secondary' // Indigo/Blue usually
            case 'delivered': return 'outline' // Green usually, customized below
            case 'cancelled': return 'destructive'
            default: return 'outline'
        }
    }

    // Quick Status Update
    const handleStatusUpdate = async (id: string, newStatus: string) => {
        toast.promise(updateOrderStatus(id, newStatus), {
            loading: 'Updating status...',
            success: () => {
                router.refresh()
                return `Status updated to ${newStatus}`
            },
            error: 'Failed to update status'
        })
    }

    // Export to CSV
    const handleExport = async () => {
        // Dynamic import to avoid server-side issues if any, or just standard window usage
        const headers = ['Order ID', 'Customer', 'Status', 'Total', 'Date']
        const csvContent = [
            headers.join(','),
            ...initialOrders.map(order => [
                order.id,
                `"${order.profiles?.name || order.shipping_name || 'Guest'}"`,
                order.status,
                order.total,
                new Date(order.created_at).toLocaleDateString('en-US')
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`) // Updated filename
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Orders</h2>
                    <p className="text-sm text-muted-foreground">Manage and track customer orders.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleExport} className="h-9 gap-2 shadow-sm text-sm font-medium">
                        <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
                        Export CSV
                    </Button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 p-1">
                {/* Status Tabs */}
                <div className="flex bg-muted/20 p-1 rounded-lg border w-fit overflow-x-auto">
                    {['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'].map((tab) => ( // Added 'cancelled' to tabs
                        <button
                            key={tab}
                            onClick={() => {
                                const params = new URLSearchParams(searchParams.toString())
                                if (tab === 'all') params.delete('status')
                                else params.set('status', tab)
                                params.set('page', '1')
                                router.replace(`?${params.toString()}`)
                            }}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                (currentStatus === tab || (tab === 'all' && !currentStatus))
                                    ? "bg-white text-foreground shadow-sm ring-1 ring-border"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="relative flex-1 max-w-sm ml-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search Order ID..."
                        className="pl-9 h-9 bg-background focus-visible:ring-offset-0 focus-visible:ring-1 border-input"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/5 hover:bg-muted/5 border-b">
                            <TableHead className="py-3 pl-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order ID</TableHead>
                            <TableHead className="py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</TableHead>
                            <TableHead className="py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</TableHead>
                            <TableHead className="py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</TableHead>
                            <TableHead className="py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                            <TableHead className="text-right py-3 pr-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialOrders.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-24 text-muted-foreground">No orders found.</TableCell></TableRow>
                        ) : (
                            initialOrders.map((order: any) => (
                                <TableRow key={order.id} className="group hover:bg-muted/50 transition-colors border-b last:border-0 text-sm">
                                    <TableCell className="font-mono text-xs pl-4 text-muted-foreground">#{order.id.slice(0, 8)}</TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">{order.profiles?.name || order.shipping_name || 'Guest'}</span>
                                            {/* <span className="text-xs text-muted-foreground">{order.profiles?.email || 'No email'}</span> */}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <div className="cursor-pointer hover:opacity-80 transition-opacity inline-flex">
                                                    <Badge variant={getStatusColor(order.status)} className={cn(
                                                        "rounded-md px-2 py-0.5 font-medium text-[10px] uppercase tracking-wider border",
                                                        order.status === 'paid' && "bg-emerald-50 text-emerald-700 border-emerald-200", // Paid = Green
                                                        order.status === 'pending' && "bg-yellow-50 text-yellow-700 border-yellow-200", // Pending = Yellow
                                                        order.status === 'shipped' && "bg-indigo-50 text-indigo-700 border-indigo-200", // Shipped = Indigo
                                                        order.status === 'delivered' && "bg-slate-100 text-slate-700 border-slate-200", // Delivered = Slate (Completed)
                                                        order.status === 'cancelled' && "bg-red-50 text-red-700 border-red-200", // Cancelled = Red
                                                    )}>
                                                        {order.status}
                                                        <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
                                                    </Badge>
                                                </div>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start">
                                                <DropdownMenuLabel className="text-xs">Update Status</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {['pending', 'paid', 'shipped', 'delivered', 'cancelled'].map((s) => (
                                                    <DropdownMenuItem
                                                        key={s}
                                                        onClick={() => handleStatusUpdate(order.id, s)}
                                                        className={cn("text-xs cursor-pointer", order.status === s && "bg-accent")}
                                                    >
                                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                    <TableCell className="text-right pr-4">
                                        <Button variant="ghost" size="sm" asChild className="h-8 text-xs font-medium text-muted-foreground hover:text-primary">
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

                {/* Pagination Controls */}
                <div className="border-t p-3 bg-muted/5">
                    <DataTablePagination totalItems={meta.total} itemsPerPage={meta.limit} />
                </div>
            </div>
        </div>
    )
}

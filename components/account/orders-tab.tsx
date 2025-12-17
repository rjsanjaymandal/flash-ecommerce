'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, ExternalLink } from "lucide-react"

export function OrdersTab({ orders }: { orders: any[] }) {
    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed bg-muted/20">
                <div className="h-12 w-12 bg-background rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-1">No Orders Yet</h3>
                <p className="text-muted-foreground max-w-sm mb-4 text-sm">
                    You haven't placed any orders yet. Start shopping to fill your closet!
                </p>
            </div>
        )
    }

    return (
        <div className="border rounded-xl overflow-hidden animate-in slide-in-from-bottom-2 duration-500 overflow-x-auto">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="w-[100px]">Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-muted/5">
                            <TableCell className="font-mono text-xs font-bold text-primary">#{order.id.slice(0, 8)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                                 <Badge variant="secondary" className={`uppercase text-[10px] font-bold tracking-wider ${
                                    order.status === 'Delivered' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-500' :
                                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-500' :
                                    order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-500' :
                                    'bg-zinc-100 text-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-500'
                                }`}>
                                    {order.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-bold text-sm">${order.total_amount}</TableCell>
                            <TableCell>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

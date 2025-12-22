'use client'

import { useState, useEffect, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Trash2, Search, ArrowUpDown, Clock, ExternalLink, Mail, Users, DollarSign, ShoppingBag, TrendingUp, Bell } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn, formatCurrency } from '@/lib/utils'
import { notifyWaitlistUser, notifyAllWaitlist } from '@/app/actions/notify'

export function WaitlistClient({ initialPreorders, stats }: { initialPreorders: any[], stats: { count: number, potentialRevenue: number } }) {
    const [search, setSearch] = useState('')
    const [preorders, setPreorders] = useState(initialPreorders)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [isNotifying, setIsNotifying] = useState<string | null>(null)
    const [isNotifyingAll, setIsNotifyingAll] = useState<string | null>(null)
    const [isMounted, setIsMounted] = useState(false)
    const [origin, setOrigin] = useState('')
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        setIsMounted(true)
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin)
        }
    }, [])

    useEffect(() => {
        setPreorders(initialPreorders)
    }, [initialPreorders])

    // Group preorders by product
    const productGroups = useMemo(() => {
        return preorders.reduce((acc: any, preorder) => {
            const pid = preorder.product_id
            if (!acc[pid]) {
                acc[pid] = {
                    id: pid,
                    name: preorder.product_name,
                    image: preorder.product_image,
                    slug: preorder.product_slug,
                    stock: preorder.product_stock, // Assumes stock is on the preorder object joined
                    count: 0,
                    pending: 0
                }
            }
            acc[pid].count++
            if (!preorder.notified_at) acc[pid].pending++
            return acc
        }, {})
    }, [preorders])

    const products = Object.values(productGroups) as any[]

    const filtered = preorders.filter(p => 
        p.product_name.toLowerCase().includes(search.toLowerCase()) || 
        p.user_name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase())
    )

    const handleExportCSV = () => {
        const headers = ["Date", "Product", "Stock", "Customer Name", "Customer Email"]
        const csvContent = [
            headers.join(","),
            ...filtered.map(p => [
                new Date(p.created_at).toLocaleDateString(),
                `"${p.product_name.replace(/"/g, '""')}"`,
                p.product_stock,
                `"${p.user_name.replace(/"/g, '""')}"`,
                p.email
            ].join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `waitlist_export_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleDelete = async (id: string) => {
        setIsDeleting(id)
        try {
            // Dynamically import to avoid server-action serialization issues if any
            const { deletePreorder } = await import('@/app/actions/admin-preorder')
            const result = await deletePreorder(id)
            
            if (result.error) throw new Error(result.error)
            
            setPreorders(preorders.filter(p => p.id !== id))
            toast.success("Removed from waitlist")
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Failed to delete")
        } finally {
            setIsDeleting(null)
        }
    }

    const handleNotify = async (id: string) => {
        setIsNotifying(id)
        try {
            const result = await notifyWaitlistUser(id)
            if (result.error) {
                toast.error(result.error)
            } else if (result.simulated) {
                 toast.success("Simulation: Notification logged")
            } else {
                toast.success("Email sent successfully")
                router.refresh()
            }
        } catch (error) {
            toast.error("Failed to notify")
        } finally {
            setIsNotifying(null)
        }
    }

    const handleNotifyAll = async (productId: string) => {
        setIsNotifyingAll(productId)
        try {
            // Dynamically import to avoid server-action serialization issues if any
            const { notifyAllWaitlist } = await import('@/app/actions/notify')
            const result = await notifyAllWaitlist(productId)
            
            if (result.error && typeof result.error === 'string') throw new Error(result.error)
            
            // @ts-ignore
            if (result.stats) {
                // @ts-ignore
                const { processed, skipped, failed } = result.stats
                toast.success(`Batch Complete: Notified ${processed}, Skipped ${skipped}, Failed ${failed}`)
            } else {
                 toast.info(result.message || "Process completed")
            }
            
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Failed to batch notify")
        } finally {
            setIsNotifyingAll(null)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Waitlist Requests</h2>
                    <p className="text-sm text-muted-foreground">Manage customer interest in out-of-stock products.</p>
                </div>
                {isMounted && (
                    <Button onClick={handleExportCSV} variant="outline" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Export CSV
                    </Button>
                )}
            </div>

            {/* Analytics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Waitlist</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.count}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-green-500 font-medium">+12%</span> from last week
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Potential Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.potentialRevenue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Unrealized demand value
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{new Set(preorders.map(p => p.product_id)).size}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Products with demand
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Waitlist by Product Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold tracking-tight">Waitlist by Product</h3>
                <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/5 hover:bg-muted/5 border-b">
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-center">Waitlist Count</TableHead>
                                <TableHead className="text-center">Stock Status</TableHead>
                                <TableHead className="text-right pr-4">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No waitlisted products.</TableCell></TableRow>
                            ) : (
                                products.map(product => {
                                    const isBackInStock = product.stock > 0
                                    return (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                {product.image ? (
                                                    <img src={product.image} alt="" className="h-10 w-10 rounded-md object-cover border" />
                                                ) : (
                                                    <div className="h-10 w-10 bg-muted rounded-md border" />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Link href={`/product/${product.slug}`} className="font-medium hover:underline">
                                                    {product.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-center font-medium">
                                                {product.count} <span className="text-muted-foreground text-xs font-normal">({product.pending} pending)</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {isBackInStock ? (
                                                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                                        In Stock ({product.stock})
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">Out of Stock</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-4">
                                                <Button 
                                                    size="sm" 
                                                    disabled={!isBackInStock || product.pending === 0 || !!isNotifyingAll}
                                                    onClick={() => handleNotifyAll(product.id)}
                                                    className={cn("gap-2", isBackInStock ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "")}
                                                >
                                                    {isNotifyingAll === product.id ? (
                                                        <>
                                                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                            Sending...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Bell className="h-3 w-3" />
                                                            Notify All ({product.pending})
                                                        </>
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                     <h3 className="text-lg font-semibold tracking-tight">All Requests</h3>
                     <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search requests..." 
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
                                <TableHead className="w-[100px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                                <TableHead className="text-right pr-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No preorders found.</TableCell></TableRow>
                            ) : (
                                filtered.map((item) => {
                                    const isBackInStock = item.product_stock > 0
                                    return (
                                    <TableRow key={item.id} className={cn("hover:bg-muted/50 border-b last:border-0 text-sm", isBackInStock && "bg-emerald-50/50 hover:bg-emerald-50")}>
                                        <TableCell className="text-muted-foreground font-medium text-xs">
                                            <div className="flex items-center gap-1" suppressHydrationWarning>
                                                <Clock className="h-3 w-3 opacity-50" />
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {item.product_image ? (
                                                    <img src={item.product_image} alt="" className="h-9 w-9 rounded-md object-cover border" />
                                                ) : (
                                                    <div className="h-9 w-9 bg-muted rounded-md border" />
                                                )}
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{item.product_name}</span>
                                                        {isBackInStock && (
                                                            <Badge variant="outline" className="text-[10px] h-4 px-1 bg-emerald-100 text-emerald-700 border-emerald-200">
                                                                In Stock ({item.product_stock})
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {item.product_slug && (
                                                        <Link href={`/product/${item.product_slug}`} target="_blank" className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5">
                                                            View Product <ExternalLink className="h-2.5 w-2.5" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground flex items-center gap-2">
                                                    {item.user_name}
                                                    {item.user_name === 'Guest' && (
                                                        <Badge variant="secondary" className="text-[10px] h-4 px-1">Guest</Badge>
                                                    )}
                                                </span>
                                                <div className="flex items-center gap-1 group/email cursor-pointer" onClick={() => item.email && (window.location.href = `mailto:${item.email}`)}>
                                                    <span className="text-xs text-muted-foreground group-hover/email:text-primary transition-colors">
                                                        {item.email || <span className="italic opacity-60">Anonymous Guest (No Email)</span>}
                                                    </span>
                                                    {item.email && <Mail className="h-3 w-3 opacity-0 group-hover/email:opacity-100 transition-opacity text-muted-foreground" />}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {item.notified_at ? (
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                                                    Notified {new Date(item.notified_at).toLocaleDateString()}
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="text-[10px] text-muted-foreground">Pending</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right pr-4">
                                            <div className="flex justify-end gap-1">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className={cn("h-8 w-8", item.notified_at ? "text-blue-500" : "text-muted-foreground hover:text-primary hover:bg-primary/10")}
                                                    onClick={() => handleNotify(item.id)}
                                                    disabled={!!isNotifying || !!item.notified_at || !item.email}
                                                    title={!item.email ? "Cannot notify anonymous guest" : item.notified_at ? "Already Notified" : "Send Notification Email"}
                                                >
                                                    {isNotifying === item.id ? (
                                                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                                    ) : (
                                                        <Bell className={cn("h-4 w-4", !item.email && "opacity-30")} />
                                                    )}
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                    asChild
                                                >
                                                    <a href={item.email ? `mailto:${item.email}?subject=Great News! ${item.product_name} is back in stock&body=Hi ${item.user_name},%0D%0A%0D%0AYou joined the waitlist for ${item.product_name}. Great news - it's back in stock!%0D%0A%0D%0AGrab yours here: ${origin}/product/${item.product_slug}` : '#'}>
                                                        <Mail className={cn("h-4 w-4", !item.email && "opacity-30")} />
                                                    </a>
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(item.id)}
                                                    disabled={isDeleting === item.id}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    )})
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}

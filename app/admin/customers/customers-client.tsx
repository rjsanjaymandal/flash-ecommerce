'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Search, Filter, MoreHorizontal, Loader2, Mail, User, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { formatCurrency, cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DataTablePagination } from '@/components/ui/data-table-pagination'
import { useRouter, useSearchParams } from 'next/navigation'

export function CustomersClient({ initialCustomers, meta }: { initialCustomers: any[], meta: any }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [search, setSearch] = useState(searchParams.get('q') || '')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

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

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tight">Customers</h2>
                    <p className="text-muted-foreground">View and manage your user base.</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Mail className="h-4 w-4" />
                    Email List
                </Button>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-card p-4 border shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search customers by name or email..."
                        className="pl-9 h-10 bg-background/50 focus-visible:ring-1 border-input/60"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="gap-2 h-10">
                    <Filter className="h-4 w-4" />
                    Filters
                </Button>
            </div>

            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="w-[250px]">Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Orders</TableHead>
                            <TableHead>Cart</TableHead>
                            <TableHead>Wishlist</TableHead>
                            <TableHead>Total Spent</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialCustomers.length === 0 ? (
                            <TableRow><TableCell colSpan={8} className="text-center py-24 text-muted-foreground">No customers found.</TableCell></TableRow>
                        ) : (
                            initialCustomers.map((customer: any) => (
                                <TableRow key={customer.id} className="group hover:bg-muted/30 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border shadow-xs">
                                                <AvatarImage src={`https://avatar.vercel.sh/${customer.id}`} alt="Avatar" />
                                                <AvatarFallback>{customer.name?.[0] || '?'}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-semibold text-sm">
                                                    {customer.name || 'Anonymous'}
                                                </div>
                                                <div className="text-xs text-muted-foreground w-24 truncate" title={customer.id}>
                                                    ID: {customer.id.slice(0, 8)}...
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {/* Simple logic: if they have orders, they are 'Active' */}
                                        <Badge variant={customer.stats.totalOrders > 0 ? 'default' : 'secondary'} className={cn("font-normal rounded-md", customer.stats.totalOrders > 0 ? "bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200" : "")}>
                                            {customer.stats.totalOrders > 0 ? 'Active' : 'New'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                            {customer.stats.totalOrders}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn("inline-flex items-center px-2 py-1 rounded-md text-xs font-medium", customer.stats.cartCount > 0 ? "bg-blue-50 text-blue-700" : "text-muted-foreground")}>
                                            {customer.stats.cartCount} items
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn("inline-flex items-center px-2 py-1 rounded-md text-xs font-medium", customer.stats.wishlistCount > 0 ? "bg-pink-50 text-pink-700" : "text-muted-foreground")}>
                                            {customer.stats.wishlistCount} items
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-bold text-base">
                                        {formatCurrency(customer.stats.totalSpent)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {mounted ? new Date(customer.created_at).toLocaleDateString('en-US') : null}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {mounted ? (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background">
                                                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem className="cursor-pointer" asChild>
                                                        <Link href={`/admin/customers/${customer.id}`}>
                                                            <User className="mr-2 h-4 w-4" /> View Profile
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <Mail className="mr-2 h-4 w-4" /> Send Email
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        ) : (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                 <div className="border-t p-4 bg-gray-50/50">
                     <DataTablePagination totalItems={meta.total} itemsPerPage={meta.limit} />
                </div>
            </div>
        </div>
    )
}

'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Trash2, Search, ArrowUpDown, Clock, ExternalLink, Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export function WaitlistClient({ initialPreorders }: { initialPreorders: any[] }) {
    const [search, setSearch] = useState('')
    const [preorders, setPreorders] = useState(initialPreorders)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
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
            const { error } = await supabase.from('preorders' as any).delete().eq('id', id)
            if (error) throw error
            setPreorders(preorders.filter(p => p.id !== id))
            toast.success("Removed from waitlist")
            router.refresh()
        } catch (error) {
            toast.error("Failed to delete")
        } finally {
            setIsDeleting(null)
        }
    }

    return (
        <div className="space-y-6">
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

            <div className="flex items-center gap-3 p-1">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search waitlist..." 
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
                            <TableHead className="text-right pr-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground">No preorders found.</TableCell></TableRow>
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
                                            <span className="font-medium text-foreground">{item.user_name}</span>
                                            <div className="flex items-center gap-1 group/email cursor-pointer" onClick={() => window.location.href = `mailto:${item.email}`}>
                                                <span className="text-xs text-muted-foreground group-hover/email:text-primary transition-colors">{item.email}</span>
                                                <Mail className="h-3 w-3 opacity-0 group-hover/email:opacity-100 transition-opacity text-muted-foreground" />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-4">
                                        <div className="flex justify-end gap-1">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                asChild
                                            >
                                                <a href={`mailto:${item.email}?subject=Great News! ${item.product_name} is back in stock&body=Hi ${item.user_name},%0D%0A%0D%0AYou joined the waitlist for ${item.product_name}. Great news - it's back in stock!%0D%0A%0D%0AGrab yours here: ${origin}/product/${item.product_slug}`}>
                                                    <Mail className="h-4 w-4" />
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
    )
}

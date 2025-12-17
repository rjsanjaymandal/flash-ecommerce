'use client'

import { useState, useEffect } from 'react'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Search, Filter, MoreHorizontal, ArrowUpDown, Loader2, Package } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteProduct } from '@/lib/services/product-service'
import { formatCurrency, cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

import { DataTablePagination } from '@/components/ui/data-table-pagination'
import { useSearchParams } from 'next/navigation'


export function ProductsClient({ initialProducts, meta }: { initialProducts: any[], meta: { total: number, page: number, limit: number, totalPages: number } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '') 
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (search) {
            params.set('q', search)
            params.set('page', '1') // Reset to page 1 on search
        } else {
            params.delete('q')
        }
        router.replace(`?${params.toString()}`)
    }, 500)
    return () => clearTimeout(handler)
  }, [search, router, searchParams])

  const deleteMutation = useMutation({
      mutationFn: async (id: string) => {
          await deleteProduct(id)
      },
      onSuccess: () => {
          setDeleteId(null)
          toast.success('Product deleted')
          router.refresh() // Refresh Server Component data
      },
      onError: (err: any) => {
          toast.error('Deletion failed: ' + err.message)
      }
  })

  // Helper to calculate total stock
  const getStockStatus = (stock: any[]) => {
      const total = stock?.reduce((acc, curr) => acc + (curr.quantity || 0), 0) || 0
      if (total === 0) return { label: 'Out of Stock', variant: 'destructive' as const, count: 0 }
      if (total < 10) return { label: 'Low Stock', variant: 'secondary' as const, count: total, className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" }
      return { label: 'In Stock', variant: 'outline' as const, count: total, className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
        <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Products</h2>
            <p className="text-sm text-muted-foreground">Manage your clothing inventory and stock levels.</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 rounded-lg h-9 text-sm font-medium">
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3 p-1">
        <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search products..." 
                className="pl-9 h-9 bg-background focus-visible:ring-offset-0 focus-visible:ring-1 border-input" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        <Button variant="outline" className="gap-2 h-9 text-xs font-medium text-muted-foreground hover:text-foreground">
            <Filter className="h-3.5 w-3.5" />
            Filters
        </Button>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/5 hover:bg-muted/5 border-b">
              <TableHead className="w-[80px] py-3 pl-4">Image</TableHead>
              <TableHead className="py-3">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Name <ArrowUpDown className="h-3 w-3" />
                  </div>
              </TableHead>
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</TableHead>
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stock</TableHead>
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price</TableHead>
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="text-right py-3 pr-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialProducts.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-24 text-muted-foreground">No products found.</TableCell></TableRow>
            ) : (
                initialProducts.map((product: any) => {
                    const stockStatus = getStockStatus(product.product_stock)
                    return (
                    <TableRow key={product.id} className="group hover:bg-muted/50 transition-colors border-b last:border-0 text-sm">
                        <TableCell className="p-4 align-middle">
                            {product.main_image_url ? (
                                <img src={product.main_image_url} alt="" className="h-10 w-10 rounded-md object-cover border shadow-sm" />
                            ) : (
                                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground text-xs border"><Package className="h-4 w-4 opacity-50"/></div>
                            )}
                        </TableCell>
                        <TableCell className="font-medium align-middle">
                            <div className="font-medium text-foreground">{product.name}</div>
                        </TableCell>
                        <TableCell className="align-middle">
                            <Badge variant="secondary" className="font-medium rounded-md text-xs bg-slate-100 text-slate-700 hover:bg-slate-200">{product.categories?.name || 'Uncategorized'}</Badge>
                        </TableCell>
                        <TableCell className="align-middle">
                            <div className="flex items-center gap-2">
                                <Badge variant={stockStatus.variant} className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold border", stockStatus.className)}>
                                    {stockStatus.label}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{stockStatus.count}</span>
                            </div>
                        </TableCell>
                        <TableCell className="font-medium align-middle text-foreground">{formatCurrency(product.price)}</TableCell>
                        <TableCell className="align-middle">
                            <div className="flex items-center gap-1.5">
                                <div className={cn("h-1.5 w-1.5 rounded-full ring-2 ring-offset-1 ring-offset-card", product.is_active ? "bg-emerald-500 ring-emerald-100" : "bg-slate-300 ring-slate-100")} />
                                <span className="text-xs text-muted-foreground font-medium">{product.is_active ? 'Active' : 'Draft'}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right align-middle pr-4">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" asChild>
                                    <Link href={`/admin/products/${product.id}`}>
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                                            <MoreHorizontal className="h-3.5 w-3.5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-32">
                                        <DropdownMenuItem 
                                            className="text-destructive focus:text-destructive cursor-pointer text-xs"
                                            onClick={() => setDeleteId(product.id)}
                                        >
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </TableCell>
                    </TableRow>
                )})
            )}
          </TableBody>
        </Table>
        
        {/* Pagination Controls */}
        <div className="border-t p-3 bg-muted/5">
            <DataTablePagination totalItems={meta.total} itemsPerPage={meta.limit} />
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete "{initialProducts.find((p: any) => p.id === deleteId)?.name}".
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                    onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deleteMutation.isPending}
                >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

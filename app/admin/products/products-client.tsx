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

import { Pagination } from '@/components/shared/pagination'
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
      if (total < 10) return { label: 'Low Stock', variant: 'secondary' as const, count: total, className: "bg-yellow-500/15 text-yellow-600 hover:bg-yellow-500/25" }
      return { label: 'In Stock', variant: 'outline' as const, count: total, className: "bg-green-500/15 text-green-600 hover:bg-green-500/25 border-green-200" }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h2 className="text-3xl font-black tracking-tight">Products</h2>
            <p className="text-muted-foreground">Manage your clothing inventory and stock.</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4 rounded-xl bg-card p-4 border shadow-sm">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search products..." 
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
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>
                  <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                    Name <ArrowUpDown className="h-3 w-3" />
                  </div>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialProducts.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-24 text-muted-foreground">No products found.</TableCell></TableRow>
            ) : (
                initialProducts.map((product: any) => {
                    const stockStatus = getStockStatus(product.product_stock)
                    return (
                    <TableRow key={product.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell className="p-4">
                            {product.main_image_url ? (
                                <img src={product.main_image_url} alt="" className="h-12 w-12 rounded-lg object-cover border bg-muted shadow-sm" />
                            ) : (
                                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs border"><Package className="h-4 w-4 opacity-50"/></div>
                            )}
                        </TableCell>
                        <TableCell className="font-medium">
                            <div className="text-base font-semibold text-foreground">{product.name}</div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="secondary" className="font-normal rounded-md">{product.categories?.name || 'Uncategorized'}</Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col gap-1">
                                <Badge variant={stockStatus.variant} className={cn("w-fit font-medium rounded-md", stockStatus.className)}>
                                    {stockStatus.label}
                                </Badge>
                                <span className="text-xs text-muted-foreground ml-1">{stockStatus.count} units</span>
                            </div>
                        </TableCell>
                        <TableCell className="font-bold text-base">{formatCurrency(product.price)}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <div className={cn("h-2 w-2 rounded-full", product.is_active ? "bg-green-500" : "bg-gray-300")} />
                                <span className="text-sm text-muted-foreground">{product.is_active ? 'Active' : 'Draft'}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/admin/products/${product.id}`}>
                                        <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                    </Link>
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background">
                                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem 
                                            className="text-destructive focus:text-destructive cursor-pointer focus:bg-destructive/10"
                                            onClick={() => setDeleteId(product.id)}
                                        >
                                            Delete Product
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
        <div className="border-t p-4 bg-gray-50/50">
            <Pagination currentPage={meta.page} totalPages={meta.totalPages} />
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
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

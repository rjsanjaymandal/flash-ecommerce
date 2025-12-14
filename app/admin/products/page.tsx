'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Search, Filter, MoreHorizontal, ArrowUpDown, Loader2, Package } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  const supabase = createClient()
  const queryClient = useQueryClient()

  // SWR/Query for fetching
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products', search], 
    queryFn: async () => {
        let query = supabase
          .from('products')
          .select(`*, categories(name), product_stock(count)`)
          .order('created_at', { ascending: false })
        
        if (search) {
          query = query.ilike('name', `%${search}%`)
        }
  
        const { data, error } = await query
        if (error) throw error
        return data
    },
    staleTime: 1000 * 60 // Cache for 1 minute
  })



// ... inside the component
  const deleteMutation = useMutation({
      mutationFn: async (id: string) => {
          await deleteProduct(id)
      },
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['admin-products'] })
          setDeleteId(null)
          toast.success('Product deleted')
      },
      onError: (err: any) => {
          toast.error('Deletion failed: ' + err.message)
      }
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Products</h2>
            <p className="text-muted-foreground">Manage your clothing inventory and stock.</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4 rounded-lg bg-card p-4 border shadow-sm">
        <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search products..." 
                className="pl-9 bg-background focus-visible:ring-1" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        <Button variant="outline" className="gap-2">
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
                  <div className="flex items-center gap-2 cursor-pointer hover:text-primary">
                    Name <ArrowUpDown className="h-3 w-3" />
                  </div>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-16 text-muted-foreground"><Loader2 className="animate-spin inline mr-2"/> Loading products...</TableCell></TableRow>
            ) : products.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-16 text-muted-foreground">No products found.</TableCell></TableRow>
            ) : (
                products.map((product: any) => (
                    <TableRow key={product.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell>
                            {product.main_image_url ? (
                                <img src={product.main_image_url} alt="" className="h-12 w-12 rounded-lg object-cover border bg-muted" />
                            ) : (
                                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs border"><Package className="h-4 w-4 opacity-50"/></div>
                            )}
                        </TableCell>
                        <TableCell className="font-medium">
                            <div className="text-base font-semibold">{product.name}</div>
                            <div className="text-xs text-muted-foreground hidden lg:block truncate max-w-[200px]">{product.description?.substring(0, 50)}...</div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="secondary" className="font-normal">{product.categories?.name || 'Uncategorized'}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">${product.price}</TableCell>
                        <TableCell>
                            <Badge variant={product.is_active ? "default" : "secondary"}>
                                {product.is_active ? 'Active' : 'Draft'}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/admin/products/${product.id}`} className="flex w-full items-center cursor-pointer">
                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        className="text-destructive focus:text-destructive cursor-pointer"
                                        onClick={() => setDeleteId(product.id)}
                                    >
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete "{products.find((p: any) => p.id === deleteId)?.name}".
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

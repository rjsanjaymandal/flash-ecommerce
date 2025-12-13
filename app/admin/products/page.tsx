'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchProducts = async () => {
      let query = supabase
        .from('products')
        .select(`*, categories(name)`)
        .order('created_at', { ascending: false })
      
      if (search) {
        query = query.ilike('name', `%${search}%`)
      }

      const { data } = await query
      if (data) setProducts(data)
      setIsLoading(false)
    }
    fetchProducts()
  }, [search])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input 
            placeholder="Search products..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : products.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">No products found.</TableCell></TableRow>
            ) : (
                products.map((product) => (
                    <TableRow key={product.id} className={!product.is_active ? 'opacity-50' : ''}>
                        <TableCell className="font-medium flex items-center gap-2">
                            {product.main_image_url && (
                                <img src={product.main_image_url} alt="" className="h-8 w-8 rounded object-cover bg-muted" />
                            )}
                            {product.name}
                        </TableCell>
                        <TableCell>{product.categories?.name || 'Uncategorized'}</TableCell>
                        <TableCell>${product.price}</TableCell>
                        <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${product.is_active ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'}`}>
                                {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </TableCell>
                        <TableCell className="text-right">
                             <Button variant="ghost" size="icon" asChild>
                                <Link href={`/admin/products/${product.id}`}>
                                    <Pencil className="h-4 w-4" />
                                </Link>
                             </Button>
                        </TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

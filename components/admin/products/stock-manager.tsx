'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Trash2, Save } from 'lucide-react'

export default function StockManager({ productId }: { productId: string }) {
  const [stock, setStock] = useState<any[]>([])
  const [newStock, setNewStock] = useState({ size: '', color: '', quantity: '0' })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchStock = async () => {
    const { data } = await supabase
      .from('product_stock')
      .select('*')
      .eq('product_id', productId)
      .order('size')
    
    if (data) setStock(data)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchStock()
  }, [productId])

  const handleAddStock = async () => {
    if (!newStock.size || !newStock.color) return

    const { error } = await supabase
      .from('product_stock')
      .insert([{
        product_id: productId,
        size: newStock.size,
        color: newStock.color,
        quantity: parseInt(newStock.quantity)
      }] as any)
    
    if (error) {
        alert('Error adding stock: ' + error.message)
    } else {
        setNewStock({ size: '', color: '', quantity: '0' })
        fetchStock()
    }
  }

  const handleUpdateQuantity = async (id: string, qty: number) => {
    const { error } = await supabase
      .from('product_stock')
      .update({ quantity: qty } as any)
      .eq('id', id)
    
    if (!error) {
        setStock(stock.map(s => s.id === id ? { ...s, quantity: qty } : s))
    }
  }

  const handleDelete = async (id: string) => {
      if(!confirm("Remove this stock record?")) return
      const { error } = await supabase
      .from('product_stock')
      .delete()
      .eq('id', id)
      
      if (!error) fetchStock()
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-medium">Stock Management</h3>
      
      <div className="flex gap-2 items-end">
        <div className="space-y-1">
            <label className="text-xs font-medium">Size</label>
            <Input 
                value={newStock.size} 
                onChange={e => setNewStock({ ...newStock, size: e.target.value })} 
                placeholder="e.g. M" 
                className="w-24"
            />
        </div>
        <div className="space-y-1">
            <label className="text-xs font-medium">Color</label>
            <Input 
                value={newStock.color} 
                onChange={e => setNewStock({ ...newStock, color: e.target.value })} 
                placeholder="e.g. Black" 
                className="w-32"
            />
        </div>
        <div className="space-y-1">
            <label className="text-xs font-medium">Qty</label>
            <Input 
                type="number"
                value={newStock.quantity} 
                onChange={e => setNewStock({ ...newStock, quantity: e.target.value })} 
                placeholder="0" 
                className="w-20"
            />
        </div>
        <Button onClick={handleAddStock} size="icon">
            <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-md border border-border">
          <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead>Size</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {stock.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No stock records.</TableCell></TableRow>
                  ) : (
                      stock.map(item => (
                          <TableRow key={item.id}>
                              <TableCell>{item.size}</TableCell>
                              <TableCell>{item.color}</TableCell>
                              <TableCell>
                                  <Input 
                                    type="number" 
                                    value={item.quantity} 
                                    onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                                    className="w-20 h-8"
                                  />
                              </TableCell>
                              <TableCell className="text-right">
                                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item.id)}>
                                      <Trash2 className="h-4 w-4" />
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

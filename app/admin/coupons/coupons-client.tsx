'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { formatCurrency, cn } from '@/lib/utils'
import { createCoupon, deleteCoupon, toggleCouponStatus } from '@/lib/services/coupon-service'

import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DataTablePagination } from '@/components/ui/data-table-pagination'
import { 
  Plus, Search, MoreHorizontal, Ticket, Trash2, Power, Copy, Loader2 
} from 'lucide-react'

export function CouponsClient({ initialCoupons, meta }: { initialCoupons: any[], meta: { total: number, page: number, limit: number, totalPages: number } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '') 
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Create Form State
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    min_order_amount: '',
    max_uses: '',
    expires_at: ''
  })

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

  const createMutation = useMutation({
    mutationFn: async () => {
      await createCoupon({
        ...formData,
        code: formData.code.toUpperCase(),
        value: Number(formData.value),
        min_order_amount: formData.min_order_amount ? Number(formData.min_order_amount) : null,
        max_uses: formData.max_uses ? Number(formData.max_uses) : null,
        expires_at: formData.expires_at || null,
        active: true
      })
    },
    onSuccess: () => {
      setCreateOpen(false)
      setFormData({ code: '', discount_type: 'percentage', value: '', min_order_amount: '', max_uses: '', expires_at: '' })
      toast.success('Coupon created successfully')
      router.refresh()
    },
    onError: (error: any) => {
      toast.error('Failed to create coupon: ' + error.message)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      toast.success('Coupon deleted')
      router.refresh()
    },
    onError: (err: any) => toast.error('Delete failed: ' + err.message)
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string, active: boolean }) => toggleCouponStatus(id, active),
    onSuccess: () => {
      toast.success('Status updated')
      router.refresh()
    },
    onError: (err: any) => toast.error('Update failed: ' + err.message)
  })

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copied to clipboard')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.code || !formData.value) return toast.error('Code and Value are required')
    createMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
        <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Coupons</h2>
            <p className="text-sm text-muted-foreground">Manage discount codes and promotions.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
              <DialogDescription>Add a new discount code for your customers.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code</Label>
                  <Input 
                    id="code" 
                    placeholder="SUMMER25" 
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Discount Type</Label>
                  <Select 
                    value={formData.discount_type} 
                    onValueChange={(v: 'percentage' | 'fixed') => setFormData({...formData, discount_type: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input 
                    id="value" 
                    type="number" 
                    placeholder={formData.discount_type === 'percentage' ? "20" : "500"} 
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_order">Min Order Amount</Label>
                  <Input 
                    id="min_order" 
                    type="number" 
                    placeholder="0" 
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({...formData, min_order_amount: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_uses">Max Uses (Optional)</Label>
                  <Input 
                    id="max_uses" 
                    type="number" 
                    placeholder="Unlimited" 
                    value={formData.max_uses}
                    onChange={(e) => setFormData({...formData, max_uses: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires">Expires At (Optional)</Label>
                  <Input 
                    id="expires" 
                    type="datetime-local" 
                    value={formData.expires_at}
                    onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Coupon
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-3 p-1">
        <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search coupons..." 
                className="pl-9 h-9" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <Table>
            <TableHeader>
                <TableRow className="bg-muted/50">
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {initialCoupons.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No coupons found.</TableCell></TableRow>
                ) : (
                    initialCoupons.map((coupon) => (
                        <TableRow key={coupon.id} className="group">
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="bg-primary/10 text-primary p-1.5 rounded-md">
                                        <Ticket className="h-4 w-4" />
                                    </div>
                                    <span className="font-mono text-base">{coupon.code}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => copyCode(coupon.code)}>
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="font-medium">
                                    {coupon.discount_type === 'percentage' ? `${coupon.value}% OFF` : `${formatCurrency(coupon.value)} OFF`}
                                </Badge>
                                {coupon.min_order_amount > 0 && (
                                    <div className="text-xs text-muted-foreground mt-1">Min: {formatCurrency(coupon.min_order_amount)}</div>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="text-sm">
                                    {coupon.used_count} / {coupon.max_uses ? coupon.max_uses : '∞'} used
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={coupon.active ? 'default' : 'secondary'} className={cn("capitalize", !coupon.active && "bg-muted text-muted-foreground")}>
                                    {coupon.active ? 'Active' : 'Inactive'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => toggleStatusMutation.mutate({ id: coupon.id, active: !coupon.active })}>
                                            <Power className="mr-2 h-4 w-4" />
                                            {coupon.active ? 'Deactivate' : 'Activate'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => deleteMutation.mutate(coupon.id)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
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
        <div className="border-t p-3 bg-muted/5">
            <DataTablePagination totalItems={meta.total} itemsPerPage={meta.limit} />
        </div>
      </div>
    </div>
  )
}

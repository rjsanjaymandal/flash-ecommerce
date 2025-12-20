'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Filter, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

interface ProductFiltersProps {
    categories: { id: string, name: string }[]
}

export function ProductFilters({ categories }: ProductFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // Local state for filters
    const [status, setStatus] = useState(searchParams.get('status') || 'all')
    const [categoryId, setCategoryId] = useState(searchParams.get('category') || 'all')
    const [stock, setStock] = useState(searchParams.get('stock') || 'all')
    const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '')
    const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '')
    const [open, setOpen] = useState(false)

    // Sync with URL on open
    useEffect(() => {
        if (open) {
            setStatus(searchParams.get('status') || 'all')
            setCategoryId(searchParams.get('category') || 'all')
            setStock(searchParams.get('stock') || 'all')
            setMinPrice(searchParams.get('min_price') || '')
            setMaxPrice(searchParams.get('max_price') || '')
        }
    }, [open, searchParams])

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString())
        
        if (status && status !== 'all') params.set('status', status)
        else params.delete('status')

        if (categoryId && categoryId !== 'all') params.set('category', categoryId)
        else params.delete('category')

        if (stock && stock !== 'all') params.set('stock', stock)
        else params.delete('stock')

        if (minPrice) params.set('min_price', minPrice)
        else params.delete('min_price')

        if (maxPrice) params.set('max_price', maxPrice)
        else params.delete('max_price')

        params.set('page', '1') // Reset page
        
        router.push(`?${params.toString()}`)
        setOpen(false)
    }

    const clearFilters = () => {
        setStatus('all')
        setCategoryId('all')
        setStock('all')
        setMinPrice('')
        setMaxPrice('')
        router.push('?')
        setOpen(false)
    }
    
    const activeFiltersCount = [
        status !== 'all', 
        categoryId !== 'all', 
        stock !== 'all', 
        minPrice !== '', 
        maxPrice !== ''
    ].filter(Boolean).length

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2 relative">
                    <Filter className="h-4 w-4" />
                    Filters
                    {activeFiltersCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                            {activeFiltersCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Filter Products</SheetTitle>
                    <SheetDescription>
                        Narrow down your inventory list.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-6 py-6">
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent className="z-9999">
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent className="z-9999">
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Stock Level</Label>
                        <Select value={stock} onValueChange={setStock}>
                             <SelectTrigger>
                                <SelectValue placeholder="Any Stock" />
                            </SelectTrigger>
                            <SelectContent className="z-9999">
                                <SelectItem value="all">Any Stock</SelectItem>
                                <SelectItem value="low">Low Stock (&lt; 10)</SelectItem>
                                <SelectItem value="out">Out of Stock</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Price Range</Label>
                        <div className="flex items-center gap-2">
                            <Input 
                                type="number" 
                                placeholder="Min" 
                                value={minPrice} 
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                            <span className="text-muted-foreground">-</span>
                            <Input 
                                type="number" 
                                placeholder="Max" 
                                value={maxPrice} 
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <SheetFooter className="flex-col gap-2 sm:gap-0">
                    <div className="flex w-full gap-2">
                         <Button variant="outline" className="flex-1" onClick={clearFilters}>
                            Clear
                        </Button>
                        <Button className="flex-1" onClick={applyFilters}>
                            Apply Filters
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

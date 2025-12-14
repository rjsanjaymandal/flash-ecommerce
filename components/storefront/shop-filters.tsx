'use client'

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { X, Filter } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Oversized']

interface ShopFiltersProps {
  categories: any[]
}

export function ShopFilters({ categories }: ShopFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const [priceRange, setPriceRange] = useState([0, 500])
    const [selectedSize, setSelectedSize] = useState<string | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [isOpen, setIsOpen] = useState(false) // Mobile sheet state

    // Sync from URL on mount
    useEffect(() => {
        const cat = searchParams.get('category')
        const size = searchParams.get('size')
        const min = searchParams.get('min_price')
        const max = searchParams.get('max_price')

        if (cat) setSelectedCategory(cat)
        if (size) setSelectedSize(size)
        if (min || max) setPriceRange([Number(min) || 0, Number(max) || 500])
    }, [searchParams])

    const applyFilters = (newParams: any) => {
        const params = new URLSearchParams(searchParams.toString())
        
        // Update Params
        if (newParams.category !== undefined) {
             if (newParams.category) params.set('category', newParams.category)
             else params.delete('category')
        }
        if (newParams.size !== undefined) {
            if (newParams.size) params.set('size', newParams.size)
            else params.delete('size')
        }
        if (newParams.price !== undefined) {
            params.set('min_price', newParams.price[0].toString())
            params.set('max_price', newParams.price[1].toString())
        }
        
        // Reset page if needed (though we use scroll restoration)
        router.push(`/shop?${params.toString()}`, { scroll: false })
    }

    const clearFilters = () => {
        setPriceRange([0, 500])
        setSelectedSize(null)
        setSelectedCategory(null)
        router.push('/shop')
    }

    const FilterContent = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Filters</h3>
                {(selectedCategory || selectedSize || priceRange[0] > 0 || priceRange[1] < 500) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive h-auto p-0 hover:bg-transparent hover:underline">
                        Reset
                    </Button>
                )}
            </div>

            {/* Categories */}
            <div className="space-y-3">
                <h4 className="font-medium text-sm">Category</h4>
                <div className="grid gap-2">
                    <Button 
                        variant={!selectedCategory ? "secondary" : "ghost"} 
                        className={cn("justify-start h-9 px-2", !selectedCategory && "bg-primary/10 text-primary font-bold")}
                        onClick={() => {
                            setSelectedCategory(null)
                            applyFilters({ category: null })
                        }}
                    >
                        All Products
                    </Button>
                    {categories.map(c => (
                        <Button
                            key={c.id}
                            variant={selectedCategory === c.id ? "secondary" : "ghost"}
                            className={cn("justify-start h-9 px-2", selectedCategory === c.id && "bg-primary/10 text-primary font-bold")}
                            onClick={() => {
                                setSelectedCategory(c.id)
                                applyFilters({ category: c.id })
                            }}
                        >
                            {c.name}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Price */}
            <div className="space-y-4">
                <h4 className="font-medium text-sm">Price Range (₹{priceRange[0]} - ₹{priceRange[1]})</h4>
                <Slider 
                    defaultValue={[0, 500]} 
                    max={500} 
                    step={10} 
                    value={priceRange}
                    onValueChange={(val) => setPriceRange(val)}
                    onValueCommit={(val) => applyFilters({ price: val })}
                    className="py-4"
                />
            </div>

             {/* Sizes */}
             <div className="space-y-3">
                <h4 className="font-medium text-sm">Size</h4>
                <div className="flex flex-wrap gap-2">
                    {SIZES.map(s => (
                        <button
                            key={s}
                            onClick={() => {
                                const newVal = selectedSize === s ? null : s
                                setSelectedSize(newVal)
                                applyFilters({ size: newVal })
                            }}
                            className={cn(
                                "px-3 py-1 rounded-md text-sm border transition-all",
                                selectedSize === s 
                                    ? "bg-primary text-primary-foreground border-primary" 
                                    : "bg-background border-input hover:border-foreground/50"
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>
             </div>
        </div>
    )

    return (
        <>
            {/* Desktop View */}
            <div className="hidden md:block w-64 shrink-0 space-y-8 pr-6 border-r border-border h-fit sticky top-24">
                <FilterContent />
            </div>

            {/* Mobile View */}
            <div className="md:hidden w-full mb-6">
                 <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                            <span className="flex items-center gap-2"><Filter className="h-4 w-4"/> Filters</span>
                            {(selectedCategory || selectedSize) && <span className="bg-primary h-2 w-2 rounded-full" />}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>Filters</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6">
                            <FilterContent />
                        </div>
                    </SheetContent>
                 </Sheet>
            </div>
        </>
    )
}

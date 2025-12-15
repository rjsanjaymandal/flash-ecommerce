'use client'

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { Filter, X } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Oversized']

interface ShopFiltersProps {
  categories: any[]
}

export function ShopFilters({ categories }: ShopFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // Local state for UI
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
        else setSelectedCategory(null) // Ensure reset if url clears

        if (size) setSelectedSize(size)
        else setSelectedSize(null)

        if (min || max) setPriceRange([Number(min) || 0, Number(max) || 500])
        else setPriceRange([0, 500])
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

    const hasActiveFilters = selectedCategory || selectedSize || priceRange[0] > 0 || priceRange[1] < 500

    const FilterContent = () => (
        <div className="space-y-6">
            
            {/* Active Filters Summary */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mb-4">
                     {selectedCategory && (
                        <Badge variant="secondary" className="px-3 py-1 rounded-full gap-1 cursor-pointer hover:bg-zinc-200" onClick={() => applyFilters({ category: null })}>
                            Category <X className="h-3 w-3" />
                        </Badge>
                     )}
                     {selectedSize && (
                        <Badge variant="secondary" className="px-3 py-1 rounded-full gap-1 cursor-pointer hover:bg-zinc-200" onClick={() => applyFilters({ size: null })}>
                            Size: {selectedSize} <X className="h-3 w-3" />
                        </Badge>
                     )}
                     {(priceRange[0] > 0 || priceRange[1] < 500) && (
                        <Badge variant="secondary" className="px-3 py-1 rounded-full gap-1 cursor-pointer hover:bg-zinc-200" onClick={() => { setPriceRange([0, 500]); applyFilters({ price: [0, 500] }) }}>
                            Price: {priceRange[0]}-{priceRange[1]} <X className="h-3 w-3" />
                        </Badge>
                     )}
                     <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-6 px-2 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50">
                        Clear All
                     </Button>
                </div>
            )}

            <Accordion type="multiple" defaultValue={["category", "price", "size"]} className="w-full">
                
                {/* Categories */}
                <AccordionItem value="category" className="border-none">
                    <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground py-3">
                        Category
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="grid gap-1">
                            <Button 
                                variant={!selectedCategory ? "secondary" : "ghost"} 
                                className={cn("justify-start h-9 px-4 rounded-full text-sm font-normal", !selectedCategory && "bg-black text-white font-bold hover:bg-zinc-800")}
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
                                    className={cn("justify-start h-9 px-4 rounded-full text-sm font-normal", selectedCategory === c.id && "bg-black text-white font-bold hover:bg-zinc-800")}
                                    onClick={() => {
                                        setSelectedCategory(c.id)
                                        applyFilters({ category: c.id })
                                    }}
                                >
                                    {c.name}
                                </Button>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Price */}
                <AccordionItem value="price" className="border-none">
                    <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground py-3">
                        Price
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 px-1">
                        <div className="space-y-4">
                            <Slider 
                                defaultValue={[0, 500]} 
                                max={500} 
                                step={10} 
                                value={priceRange}
                                onValueChange={(val) => setPriceRange(val)}
                                onValueCommit={(val) => applyFilters({ price: val })}
                                className="py-2"
                            />
                            <div className="flex items-center justify-between text-sm font-medium">
                                <span>₹{priceRange[0]}</span>
                                <span>₹{priceRange[1]}</span>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Sizes */}
                <AccordionItem value="size" className="border-none">
                     <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground py-3">
                        Size
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
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
                                        "px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200",
                                        selectedSize === s 
                                            ? "bg-black text-white border-black shadow-md scale-105" 
                                            : "bg-white border-zinc-200 text-zinc-600 hover:border-black hover:text-black"
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )

    return (
        <>
            {/* Desktop View: Sticky Sidebar */}
            <div className="hidden md:block w-64 shrink-0 pr-6 border-r border-border h-[calc(100vh-100px)] sticky top-24 overflow-y-auto scrollbar-none">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl tracking-tight">Filters</h3>
                </div>
                <FilterContent />
            </div>

            {/* Mobile View: Sheet */}
            <div className="md:hidden w-full mb-6">
                 <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full justify-between h-12 border-primary/20 bg-background/50 backdrop-blur-sm">
                            <span className="flex items-center gap-2 font-medium"><Filter className="h-4 w-4"/> Filter & Sort</span>
                            {hasActiveFilters && <Badge variant="default" className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 h-auto">Active</Badge>}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[320px] overflow-y-auto">
                        <SheetHeader className="border-b pb-4 mb-4">
                            <SheetTitle className="text-xl font-bold">Filter Products</SheetTitle>
                        </SheetHeader>
                        <FilterContent />
                        <div className="mt-8 pt-4 border-t sticky bottom-0 bg-background pb-4">
                             <Button className="w-full" size="lg" onClick={() => setIsOpen(false)}>
                                Show Results
                             </Button>
                        </div>
                    </SheetContent>
                 </Sheet>
            </div>
        </>
    )
}

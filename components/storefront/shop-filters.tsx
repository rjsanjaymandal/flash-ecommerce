'use client'

import { useQueryState, parseAsInteger } from 'nuqs'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from '@/components/ui/checkbox'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { Filter, X } from 'lucide-react'

// Constants
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"]
const COLORS = [
    { name: "Black", value: "black", class: "bg-black" },
    { name: "White", value: "white", class: "bg-white border-2 border-gray-200" },
    { name: "Blue", value: "blue", class: "bg-blue-500" },
    { name: "Red", value: "red", class: "bg-red-500" },
    { name: "Green", value: "green", class: "bg-green-500" },
    { name: "Beige", value: "beige", class: "bg-[#F5F5DC] border border-gray-200" },
]

export function ShopFilters({ categories }: { categories: any[] }) {
    return (
        <>
            {/* Mobile Trigger */}
            <div className="md:hidden w-full mb-6">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full rounded-full border-dashed">
                             <Filter className="mr-2 h-4 w-4" />
                             Filters & Sort
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] overflow-y-auto">
                        <SheetHeader className="mb-6 text-left">
                            <SheetTitle>Filters</SheetTitle>
                        </SheetHeader>
                        <FilterContent categories={categories} />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 flex-none space-y-8 animate-in sticky top-24 h-[calc(100vh-100px)] overflow-y-auto pr-4 scrollbar-thin">
                <div className="flex items-center justify-between pb-2 border-b">
                    <h3 className="font-bold text-lg">Filters</h3>
                </div>
                <FilterContent categories={categories} />
            </aside>
        </>
    )
}

function FilterContent({ categories }: { categories: any[] }) {
    // State
    const [minPrice, setMinPrice] = useQueryState('min_price', parseAsInteger)
    const [maxPrice, setMaxPrice] = useQueryState('max_price', parseAsInteger)
    const [size, setSize] = useQueryState('size')
    const [color, setColor] = useQueryState('color')
    const [category, setCategory] = useQueryState('category')

    // Local state for slider performance
    const [priceRange, setPriceRange] = useState([0, 20000])

    // Sync local slider with URL on mount/update
    useEffect(() => {
        setPriceRange([minPrice || 0, maxPrice || 20000])
    }, [minPrice, maxPrice])

    const handlePriceChange = (value: number[]) => {
        setPriceRange(value)
    }

    const handlePriceCommit = (value: number[]) => {
        setMinPrice(value[0] || null)
        setMaxPrice(value[1] || null)
    }

    const clearFilters = () => {
        setMinPrice(null)
        setMaxPrice(null)
        setSize(null)
        setColor(null)
        setCategory(null)
    }

    const hasFilters = minPrice || maxPrice || size || color || category

    return (
        <div className="space-y-6">
            {hasFilters && (
                 <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full h-auto py-2 text-muted-foreground hover:text-red-500 text-xs uppercase tracking-wider font-bold border border-dashed hover:border-red-500 hover:bg-red-50">
                    Clear All Filters
                </Button>
            )}
            
            <Accordion type="multiple" defaultValue={["categories", "price", "size", "color"]} className="w-full">
                {/* Categories */}
                <AccordionItem value="categories" className="border-none">
                    <AccordionTrigger className="py-3 text-sm font-bold hover:no-underline">Category</AccordionTrigger>
                    <AccordionContent>
                         <div className="flex flex-col gap-2">
                            <button 
                                onClick={() => setCategory(null)}
                                className={cn(
                                    "text-left text-sm py-1 transition-colors hover:text-primary pl-2 border-l-2",
                                    !category ? "font-bold text-primary border-primary" : "text-muted-foreground border-transparent"
                                )}
                            >
                                All Products
                            </button>
                            {categories.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => setCategory(c.id)}
                                    className={cn(
                                        "text-left text-sm py-1 transition-colors hover:text-primary pl-2 border-l-2",
                                        category === c.id ? "font-bold text-primary border-primary" : "text-muted-foreground border-transparent"
                                    )}
                                >
                                    {c.name}
                                </button>
                            ))}
                         </div>
                    </AccordionContent>
                </AccordionItem>

                 {/* Price */}
                 <AccordionItem value="price" className="border-none">
                    <AccordionTrigger className="py-3 text-sm font-bold hover:no-underline">Price Range</AccordionTrigger>
                    <AccordionContent>
                        <div className="pt-4 px-2 space-y-4">
                            <Slider
                                defaultValue={[0, 20000]}
                                max={20000}
                                step={100}
                                value={priceRange}
                                onValueChange={handlePriceChange}
                                onValueCommit={handlePriceCommit}
                                className="my-4"
                            />
                            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                                <span>₹{priceRange[0]}</span>
                                <span>₹{priceRange[1]}+</span>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Size */}
                <AccordionItem value="size" className="border-none">
                    <AccordionTrigger className="py-3 text-sm font-bold hover:no-underline">Size</AccordionTrigger>
                    <AccordionContent>
                        <div className="grid grid-cols-3 gap-2">
                            {SIZES.map((s) => (
                                <Button
                                    key={s}
                                    variant={size === s ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSize(size === s ? null : s)}
                                    className={cn(
                                        "h-9 w-full rounded-md text-xs", 
                                        size === s && "font-bold shadow-md"
                                    )}
                                >
                                    {s}
                                </Button>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Color */}
                <AccordionItem value="color" className="border-none">
                    <AccordionTrigger className="py-3 text-sm font-bold hover:no-underline">Color</AccordionTrigger>
                    <AccordionContent>
                         <div className="flex flex-wrap gap-3">
                            {COLORS.map((c) => (
                                <button
                                    key={c.value}
                                    onClick={() => setColor(color === c.value ? null : c.value)}
                                    className={cn(
                                        "h-8 w-8 rounded-full transition-all ring-offset-2 ring-offset-background",
                                        c.class,
                                        color === c.value ? "ring-2 ring-primary scale-110 shadow-md" : "hover:scale-110 border"
                                    )}
                                    title={c.name}
                                />
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}

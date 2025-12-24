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
    { name: "Black", value: "black", class: "bg-black border border-white/10" },
    { name: "White", value: "white", class: "bg-background border-2 border-border" },
    { name: "Blue", value: "blue", class: "bg-blue-500 border-none" },
    { name: "Red", value: "red", class: "bg-red-500 border-none" },
    { name: "Green", value: "green", class: "bg-green-500 border-none" },
    { name: "Beige", value: "beige", class: "bg-[#F5F5DC] border border-border" },
]

export function ShopFilters({ categories }: { categories: Category[] }) {
    return (
        <>
            {/* Mobile: Floating Filter Action Button */}
            <div className="md:hidden fixed bottom-24 right-6 z-40">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button className="h-14 w-14 rounded-full gradient-primary shadow-2xl shadow-primary/40 flex items-center justify-center p-0 group overflow-hidden">
                             <Filter className="h-6 w-6 text-primary-foreground group-hover:scale-110 transition-transform" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[80vh] rounded-t-[3rem] border-border/10 bg-background/95 backdrop-blur-3xl overflow-y-auto px-8 pb-12">
                        <SheetHeader className="mb-8 pt-4">
                            <div className="flex flex-col gap-2">
                                <span className="text-primary font-black tracking-[0.4em] uppercase text-[10px]">Selections</span>
                                <SheetTitle className="text-4xl font-black italic tracking-tighter uppercase text-foreground">RE<span className="text-gradient">FINE</span> VIBE</SheetTitle>
                            </div>
                        </SheetHeader>
                        <FilterContent categories={categories} />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-72 shrink-0 animate-in sticky top-24 h-fit rounded-3xl border border-border/60 bg-card/80 p-6 backdrop-blur-md">
                <div className="flex flex-col gap-2 mb-8">
                    <span className="text-primary font-black tracking-[0.4em] uppercase text-[10px]">Filter By</span>
                    <h3 className="font-black text-3xl italic tracking-tighter uppercase">Category</h3>
                </div>
                <FilterContent categories={categories} />
            </aside>
        </>
    )
}

function FilterContent({ categories }: { categories: Category[] }) {
    // State
    const [minPrice, setMinPrice] = useQueryState('min_price', parseAsInteger)
    const [maxPrice, setMaxPrice] = useQueryState('max_price', parseAsInteger)
    const [size, setSize] = useQueryState('size')
    const [color, setColor] = useQueryState('color')
    const [category, setCategory] = useQueryState('category')

    // Local state for slider performance
    const [priceRange, setPriceRange] = useState([0, 20000])
    const [mounted, setMounted] = useState(false)

    // Sync local slider with URL on mount/update
    useEffect(() => {
        setPriceRange([minPrice || 0, maxPrice || 20000])
    }, [minPrice, maxPrice])

    useEffect(() => {
        setMounted(true)
    }, [])

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

    const textClass = "text-foreground"
    const mutedClass = "text-muted-foreground"

    return (
        <div className="space-y-8 pb-12">
            {hasFilters && mounted && (
                 <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearFilters} 
                    className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all bg-transparent text-primary border-primary/20 hover:bg-primary/5 hover:text-primary hover:border-primary/50 shadow-sm"
                >
                    Reset Selections
                </Button>
            )}
            
            <Accordion type="multiple" defaultValue={["categories", "price", "size", "color"]} className="w-full space-y-4">
                {/* Categories */}
                <AccordionItem value="categories" className="border-none">
                    <AccordionTrigger className={cn("py-4 text-[10px] uppercase font-black tracking-[0.3em] hover:no-underline", textClass)}>
                        Drop Collection
                    </AccordionTrigger>
                    <AccordionContent>
                         <div className="flex flex-col gap-3 pt-2">
                            <button 
                                onClick={() => setCategory(null)}
                                className={cn(
                                    "text-left text-sm py-2 px-4 rounded-xl transition-all font-black uppercase tracking-tighter italic",
                                    !category 
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
                                        : cn("hover:bg-muted text-muted-foreground hover:text-foreground")
                                )}
                            >
                                All Drops
                            </button>
                            {categories.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => setCategory(c.id)}
                                    className={cn(
                                        "text-left text-sm py-2 px-4 rounded-xl transition-all font-black uppercase tracking-tighter italic",
                                        category === c.id 
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
                                            : cn("hover:bg-muted text-muted-foreground hover:text-foreground")
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
                    <AccordionTrigger className={cn("py-4 text-[10px] uppercase font-black tracking-[0.3em] hover:no-underline", textClass)}>
                        Price Range
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="pt-6 px-2 space-y-6">
                            <Slider
                                defaultValue={[0, 20000]}
                                max={20000}
                                step={500}
                                value={priceRange}
                                onValueChange={handlePriceChange}
                                onValueCommit={handlePriceCommit}
                                className="my-4"
                            />
                            <div className={cn("flex items-center justify-between text-[10px] font-black uppercase tracking-widest", mutedClass)}>
                                <span className="bg-primary/10 px-3 py-1 rounded-full">₹{priceRange[0]}</span>
                                <span className="bg-primary/10 px-3 py-1 rounded-full">₹{priceRange[1]}+</span>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Size */}
                <AccordionItem value="size" className="border-none">
                    <AccordionTrigger className={cn("py-4 text-[10px] uppercase font-black tracking-[0.3em] hover:no-underline", textClass)}>
                        Select Size
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="grid grid-cols-3 gap-3 pt-2">
                            {SIZES.map((s) => (
                                <Button
                                    key={s}
                                    variant={size === s ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSize(size === s ? null : s)}
                                    className={cn(
                                        "h-12 w-full rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all", 
                                        size === s 
                                            ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-105 border-primary" 
                                            : cn("border-border hover:border-primary/50 hover:bg-muted text-muted-foreground hover:text-foreground", mutedClass)
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
                    <AccordionTrigger className={cn("py-4 text-[10px] uppercase font-black tracking-[0.3em] hover:no-underline", textClass)}>
                        Select Hue
                    </AccordionTrigger>
                    <AccordionContent>
                         <div className="flex flex-wrap gap-4 pt-4">
                            {COLORS.map((c) => (
                                <button
                                    key={c.value}
                                    onClick={() => setColor(color === c.value ? null : c.value)}
                                    className={cn(
                                        "h-10 w-10 rounded-2xl transition-all ring-offset-2 ring-offset-background relative overflow-hidden",
                                        c.class,
                                        color === c.value 
                                            ? "ring-2 ring-primary scale-125 shadow-2xl z-10" 
                                            : "hover:scale-110 border-white/5 shadow-lg"
                                    )}
                                    title={c.name}
                                >
                                     {color === c.value && <div className="absolute inset-0 flex items-center justify-center bg-black/20"><div className="h-1 w-1 rounded-full bg-white shadow-[0_0_10px_white]" /></div>}
                                </button>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}

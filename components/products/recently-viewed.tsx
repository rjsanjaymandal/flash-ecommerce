'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { formatCurrency } from "@/lib/utils"
import { useRecentStore } from '@/lib/store/use-recent-store'

export function RecentlyViewed({ currentProduct }: { currentProduct?: any }) {
    const { items, addItem } = useRecentStore()
    const [mounted, setMounted] = useState(false)

    // Hydration fix
    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (currentProduct) {
            addItem({
                id: currentProduct.id,
                name: currentProduct.name,
                price: currentProduct.price,
                image: currentProduct.main_image_url,
                slug: currentProduct.slug || currentProduct.id
            })
        }
    }, [currentProduct, addItem])

    if (!mounted || items.length === 0) return null
    
    // Filter out current product from display list
    const displayItems = items.filter(i => i.id !== currentProduct?.id)

    if (displayItems.length === 0) return null

    return (
        <div className="space-y-6 py-12 border-t border-border/60">
            <h2 className="text-2xl font-light tracking-tight">Recently Viewed</h2>
             <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
                {displayItems.map((item) => (
                    <Link 
                        key={item.id} 
                        href={`/product/${item.slug}`} 
                        className="min-w-[160px] w-[160px] snap-start group"
                    >
                        <div className="aspect-[3/4] bg-muted mb-3 rounded-md overflow-hidden relative">
                            {item.image ? (
                                <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-secondary">No Image</div>
                            )}
                        </div>
                        <h3 className="font-medium text-sm truncate pr-2">{item.name}</h3>
                        <p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p>
                    </Link>
                ))}
            </div>
        </div>
    )
}

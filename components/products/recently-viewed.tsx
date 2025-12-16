'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { formatCurrency } from "@/lib/utils"

export function RecentlyViewed({ currentProduct }: { currentProduct?: any }) {
    const [history, setHistory] = useState<any[]>([])
    const pathname = usePathname()

    useEffect(() => {
        // Load history
        const stored = localStorage.getItem('recently-viewed')
        let items = stored ? JSON.parse(stored) : []

        // Add current if exists
        if (currentProduct) {
            // Remove duplicates
            items = items.filter((i: any) => i.id !== currentProduct.id)
            // Add to front
            items.unshift({
                id: currentProduct.id,
                name: currentProduct.name,
                price: currentProduct.price,
                image: currentProduct.main_image_url
            })
            // Limit to 10
            items = items.slice(0, 10)
            localStorage.setItem('recently-viewed', JSON.stringify(items))
        }

        setHistory(items)
    }, [currentProduct?.id]) // Run when product ID changes

    if (history.length === 0) return null
    
    // Don't show if only the current product is in history
    if (currentProduct && history.length === 1 && history[0].id === currentProduct.id) return null

    return (
        <div className="space-y-6 py-12 border-t border-border/60">
            <h2 className="text-2xl font-light tracking-tight">Recently Viewed</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {history.map((item) => (
                    item.id !== currentProduct?.id && (
                        <Link 
                            key={item.id} 
                            href={`/product/${item.id}`} // Adjust if slug used but storing ID for simplicity
                            className="min-w-[160px] w-[160px] snap-start group"
                        >
                            <div className="aspect-[3/4] bg-muted mb-3 rounded-md overflow-hidden relative">
                                {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />}
                            </div>
                            <h3 className="font-medium text-sm truncate">{item.name}</h3>
                            <p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p>
                        </Link>
                    )
                ))}
            </div>
        </div>
    )
}

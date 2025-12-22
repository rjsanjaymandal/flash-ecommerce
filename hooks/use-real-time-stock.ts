'use client'

import { useState, useEffect } from 'react'

export type StockItem = {
    size: string
    color: string
    quantity: number
}

export function useRealTimeStock(productId: string, initialStock: StockItem[] = []) {
    const [stock, setStock] = useState<StockItem[]>(initialStock)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true

        async function fetchStock() {
            try {
                const res = await fetch(`/api/stock/${productId}`)
                if (!res.ok) throw new Error('Failed to fetch stock')
                const data = await res.json()
                
                if (mounted) {
                    setStock(data)
                    setLoading(false)
                }
            } catch (error) {
                console.error("Stock check failed, using initial/cached data", error)
                if (mounted) setLoading(false)
            }
        }

        fetchStock()

        return () => {
            mounted = false
        }
    }, [productId])

    return { stock, loading }
}

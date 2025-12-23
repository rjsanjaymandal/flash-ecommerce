import { useEffect } from 'react'
import { useStockStore, StockItem } from '@/store/use-stock-store'

export type { StockItem }

export function useRealTimeStock(productId: string, initialStock: StockItem[] = []) {
    const { stocks, setProductStock } = useStockStore()
    
    // 1. Initialize store with initial data on mount (if not already present)
    useEffect(() => {
        if (initialStock.length > 0 && !stocks[productId]) {
            setProductStock(productId, initialStock)
        }
    }, [productId, initialStock, setProductStock, stocks])

    // 2. Select from store
    const stock = stocks[productId] || initialStock
    const loading = false // Instant access now

    return { stock, loading }
}

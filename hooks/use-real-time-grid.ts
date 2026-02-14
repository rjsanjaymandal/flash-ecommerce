import { useEffect, useState, useMemo } from 'react'
import { useStockStore, StockItem } from '@/store/use-stock-store'
import { createClient } from '@/lib/supabase/client'

/**
 * Unified Real-Time Grid Hook
 * Manages a single WebSocket channel for multiple products in a grid.
 * Prevents connection explosion when viewing many products at once.
 */
export function useRealTimeGrid(productIds: string[], initialStocks: Record<string, StockItem[]>) {
    const { stocks, setProductStock, updateStock } = useStockStore()
    const supabase = createClient()
    
    // 1. Bulk Initialize store
    useEffect(() => {
        productIds.forEach(id => {
            if (initialStocks[id] && !stocks[id]) {
                setProductStock(id, initialStocks[id])
            }
        })
    }, [productIds, initialStocks, setProductStock, stocks])

    // 2. Multi-Product Subscription
    useEffect(() => {
        if (productIds.length === 0) return

        // Use a generic channel name for the grid session
        // In a real high-scale app, you might want to slice these into batches if > 100
        const channelName = `grid:${productIds.slice(0, 3).join('-')}-${productIds.length}`
        const channel = supabase.channel(channelName)

        // Subscribe to updates for ALL products in the list
        // Postgres filter supports 'in' for multiple values
        const productFilter = `product_id=in.(${productIds.join(',')})`

        channel
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'product_stock',
                    filter: productFilter,
                },
                (payload) => {
                    const newItem = payload.new as StockItem
                    if (newItem) {
                        updateStock(newItem.product_id, newItem.size, newItem.color, newItem.fit, newItem.quantity)
                    }
                }
            )
            .subscribe()

        return () => {
             supabase.removeChannel(channel)
        }
    }, [productIds, supabase, updateStock])

    return { stocks }
}

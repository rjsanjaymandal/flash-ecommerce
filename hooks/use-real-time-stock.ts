import { useEffect, useState } from 'react'
import { useStockStore, StockItem } from '@/store/use-stock-store'
import { createClient } from '@/lib/supabase/client'

export type { StockItem }

export function useRealTimeHype(productId: string, initialStock: StockItem[] = []) {
    const { stocks, setProductStock, updateStock } = useStockStore()
    const [viewerCount, setViewerCount] = useState(1) // Always at least 1 (me)
    const supabase = createClient()
    
    // 1. Initialize store with initial data on mount
    useEffect(() => {
        if (initialStock.length > 0 && !stocks[productId]) {
            setProductStock(productId, initialStock)
        }
    }, [productId, initialStock, setProductStock, stocks])

    // 2. Real-Time Subscription (Presence + Stock)
    useEffect(() => {
        if (!productId) return

        // Unique channel per product
        const channel = supabase.channel(`product:${productId}`)

        channel
            // A. Presence (Live Viewers)
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState()
                // Simple count of unique presence IDs (tab/device)
                const count = Object.keys(state).length
                setViewerCount(Math.max(1, count))
            })
            // B. Postgres Changes (Live Stock)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'product_stock',
                    filter: `product_id=eq.${productId}`,
                },
                (payload) => {
                    const newItem = payload.new as StockItem
                    if (newItem) {
                        updateStock(newItem.product_id, newItem.size, newItem.color, newItem.quantity)
                    }
                }
            )
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    // Track presence (Identify as anonymous viewer)
                    await channel.track({
                         viewed_at: new Date().toISOString(),
                         // We could track random user ID here if we wanted strict uniqueness
                         id: Math.random().toString(36).substring(7) 
                    })
                }
            })

        return () => {
             supabase.removeChannel(channel)
        }
    }, [productId, supabase, updateStock])

    // 3. Select from store
    const stock = stocks[productId] || initialStock
    const loading = false 

    return { stock, loading, viewerCount }
}

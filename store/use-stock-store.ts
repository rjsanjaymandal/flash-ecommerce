import { create } from 'zustand'

export type StockItem = {
  product_id: string
  size: string
  color: string
  quantity: number
}

interface StockStore {
  // Map of productId -> Array of StockItems
  stocks: Record<string, StockItem[]>
  
  // Update a single stock entry
  updateStock: (productId: string, size: string, color: string, quantity: number) => void
  
  // Set initial stock for a product (useful for hydration/initial load)
  setProductStock: (productId: string, items: StockItem[]) => void
}

export const useStockStore = create<StockStore>((set) => ({
  stocks: {},
  
  updateStock: (productId, size, color, quantity) => set((state) => {
    const currentProductStock = state.stocks[productId] || []
    
    // Check if entry exists
    const existingIndex = currentProductStock.findIndex(
      (item) => item.size === size && item.color === color
    )
    
    let newProductStock = [...currentProductStock]
    
    if (existingIndex >= 0) {
        // Update existing
        newProductStock[existingIndex] = { ...newProductStock[existingIndex], quantity }
    } else {
        // Add new
        newProductStock.push({ product_id: productId, size, color, quantity })
    }
    
    return {
        stocks: {
            ...state.stocks,
            [productId]: newProductStock
        }
    }
  }),

  setProductStock: (productId, items) => set((state) => ({
      stocks: {
          ...state.stocks,
          [productId]: items
      }
  }))
}))

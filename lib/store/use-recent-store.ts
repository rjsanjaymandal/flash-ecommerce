import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RecentProduct {
  id: string
  name: string
  price: number
  image: string
  slug: string
  product_stock?: any[]
  [key: string]: any
}

interface RecentStore {
  items: RecentProduct[]
  lastValidated: number
  addItem: (item: RecentProduct) => void
  setItems: (items: RecentProduct[]) => void
  setLastValidated: (time: number) => void
  clear: () => void
}

export const useRecentStore = create<RecentStore>()(
  persist(
    (set) => ({
      items: [],
      lastValidated: 0,
      addItem: (newItem) =>
        set((state) => {
          // Remove if exists to move to top
          const filtered = state.items.filter((i) => i.id !== newItem.id)
          // Add to front, limit to 12
          return { items: [newItem, ...filtered].slice(0, 12) }
        }),
      setItems: (items) => set({ items }),
      setLastValidated: (time) => set({ lastValidated: time }),
      clear: () => set({ items: [], lastValidated: 0 }),
    }),
    {
      name: 'recently-viewed-storage',
      // Ensure we persist validation time
      partialize: (state) => ({ items: state.items, lastValidated: state.lastValidated }),
    }
  )
)

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
  addItem: (item: RecentProduct) => void
  clear: () => void
}

export const useRecentStore = create<RecentStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (newItem) =>
        set((state) => {
          // Remove if exists to move to top
          const filtered = state.items.filter((i) => i.id !== newItem.id)
          // Add to front, limit to 12
          return { items: [newItem, ...filtered].slice(0, 12) }
        }),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'recently-viewed-storage',
    }
  )
)

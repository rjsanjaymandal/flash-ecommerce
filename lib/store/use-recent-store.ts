import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RecentProduct {
  id: string
  name: string
  price: number
  image: string
  slug: string
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
          // Add to front, limit to 10
          return { items: [newItem, ...filtered].slice(0, 10) }
        }),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'recently-viewed-storage',
    }
  )
)

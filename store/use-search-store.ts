import { create } from 'zustand'

interface SearchStore {
  isOpen: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

export const useSearchStore = create<SearchStore>((set) => ({
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))

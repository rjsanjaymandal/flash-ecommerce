import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface WishlistItem {
  id?: string
  productId: string
  name: string
  price: number
  image: string | null
  slug: string
}

interface WishlistState {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  setItems: (items: WishlistItem[]) => void
}

const supabase = createClient()

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: async (item) => {
        const { items } = get()
        if (items.some((i) => i.productId === item.productId)) {
           toast.info("Already in wishlist")
           return
        }
        
        // Optimistic
        set({ items: [...items, item] })
        toast.success("Added to Wishlist")

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
             const { error } = await supabase
                .from('wishlist_items')
                .upsert(
                    { user_id: user.id, product_id: item.productId }, 
                    { onConflict: 'user_id, product_id' }
                )
            if (error) console.error("Error adding to remote wishlist", error)
        }
      },

      removeItem: async (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }))
        toast.info("Removed from Wishlist")

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase
                .from('wishlist_items')
                .delete()
                .match({ user_id: user.id, product_id: productId })
        }
      },
      setItems: (items) => set({ items }),
    }),
    {
      name: 'flash-wishlist-storage',
      skipHydration: true,
    }
  )
)

export const selectIsInWishlist = (state: WishlistState, productId: string) => 
    state.items.some((i) => i.productId === productId)

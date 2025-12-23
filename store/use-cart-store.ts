import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface CartItem {
  id?: string // UUID for DB items
  productId: string
  name: string
  price: number
  image: string | null
  size: string
  color: string
  quantity: number
  maxQuantity: number
}

interface CartState {
  items: CartItem[]
  isCartOpen: boolean
  isLoading: boolean
  addItem: (item: CartItem) => Promise<void>
  removeItem: (productId: string, size: string, color: string) => Promise<void>
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  setItems: (items: CartItem[]) => void
  setIsCartOpen: (open: boolean) => void
  setIsLoading: (isLoading: boolean) => void
}

const supabase = createClient()

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      isLoading: true,
      
      addItem: async (item) => {
        const { data: { user } } = await supabase.auth.getUser()
        const currentItems = get().items
        const existingIndex = currentItems.findIndex(
          (i) =>
            i.productId === item.productId &&
            i.size === item.size &&
            i.color === item.color
        )

        const newItems = [...currentItems]
        let newQuantity = item.quantity

        if (existingIndex > -1) {
          const currentQty = newItems[existingIndex].quantity
          // Update maxQuantity with fresh data from payload
          newItems[existingIndex].maxQuantity = item.maxQuantity
          const maxQty = item.maxQuantity || 10
          
          if (currentQty >= maxQty) {
              toast.error("Max available stock reached")
              return
          }

          newQuantity = Math.min(
              currentQty + item.quantity,
              maxQty
          )
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newQuantity
          }
        } else {
          newItems.push(item)
        }
        
        // Optimistic Update
        set({ items: newItems, isCartOpen: true })
        toast.success("Added to cart")

        if (user) {
            const dbItem = {
                user_id: user.id,
                product_id: item.productId,
                size: item.size,
                color: item.color,
                quantity: newItems[existingIndex > -1 ? existingIndex : newItems.length - 1].quantity
            }
            const { error } = await supabase
                .from('cart_items')
                .upsert(dbItem, { onConflict: 'user_id, product_id, size, color' })
            
            if (error) {
                console.error("Failed to sync cart item", error)
                toast.error("Failed to save cart remotely")
            }
        }
      },

      removeItem: async (productId, size, color) => {
        const { data: { user } } = await supabase.auth.getUser()
        
        set((state) => ({
            items: state.items.filter(
                (i) => !(i.productId === productId && i.size === size && i.color === color)
            )
        }))

        if (user) {
             const { error } = await supabase
                .from('cart_items')
                .delete()
                .match({ user_id: user.id, product_id: productId, size, color })
            
            if (error) console.error("Error deleting remote item", error)
        }
      },

      updateQuantity: async (productId, size, color, quantity) => {
        const { data: { user } } = await supabase.auth.getUser()
        const state = get()
        const itemIndex = state.items.findIndex(
            (i) => i.productId === productId && i.size === size && i.color === color
        )

        if (itemIndex === -1) return

        // Auto-remove if quantity <= 0
        if (quantity <= 0) {
            get().removeItem(productId, size, color)
            return
        }

        // Enforce max quantity limit
        const item = state.items[itemIndex]
        const maxQty = item.maxQuantity || 10
        
        if (quantity > maxQty) {
            toast.error(`Sorry, we only have ${maxQty} in stock`)
            return
        }

        set((state) => ({
            items: state.items.map((i) =>
                i.productId === productId && i.size === size && i.color === color
                ? { ...i, quantity }
                : i
            )
        }))

        if (user) {
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity })
                .match({ user_id: user.id, product_id: productId, size, color })
            
            if (error) console.error("Error updating remote quantity", error)
        }
      },

      clearCart: async () => {
         const { data: { user } } = await supabase.auth.getUser()
         set({ items: [] })
         if (user) {
             await supabase.from('cart_items').delete().eq('user_id', user.id)
         } else {
             localStorage.removeItem('flash-cart-storage')
         }
      },

      setItems: (items) => set({ items }),
      setIsCartOpen: (open) => set({ isCartOpen: open }),
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'flash-cart-storage',
      skipHydration: true,
    }
  )
)

export const selectCartCount = (state: CartState) => state.items.reduce((acc, item) => acc + item.quantity, 0)
export const selectCartTotal = (state: CartState) => state.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)

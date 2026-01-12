import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface CartItem {
  id?: string // UUID for DB items
  productId: string
  categoryId?: string
  slug?: string
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
  addItem: (item: CartItem, options?: { openCart?: boolean, showToast?: boolean }) => Promise<void>
  removeItem: (productId: string, size: string, color: string) => Promise<void>
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  syncWithUser: (userId: string) => Promise<void>
  setItems: (items: CartItem[]) => void
  setIsCartOpen: (open: boolean) => void
  setIsLoading: (isLoading: boolean) => void
  loadingStates: Record<string, boolean>
  setLoadingState: (key: string, isLoading: boolean) => void
}

const supabase = createClient()

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      isLoading: true,
      loadingStates: {},
      setLoadingState: (key, isLoading) => set((state) => ({ loadingStates: { ...state.loadingStates, [key]: isLoading } })),
      
      addItem: async (item, options = { openCart: true, showToast: true }) => {
        const currentItems = get().items
        const existingIndex = currentItems.findIndex(
          (i) =>
            i.productId === item.productId &&
            i.size === item.size &&
            i.color === item.color
        )

        const newItems = [...currentItems]
        let newQuantity = item.quantity
        const maxQty = item.maxQuantity || 10

        if (existingIndex > -1) {
          const currentQty = newItems[existingIndex].quantity
          
          if (currentQty >= maxQty) {
              if (options.showToast) toast.error("Max available stock reached")
              return
          }

          newQuantity = Math.min(
              currentQty + item.quantity,
              maxQty
          )
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newQuantity,
            maxQuantity: maxQty
          }
        } else {
          newItems.push(item)
        }
        
        // Optimistic Update
        set({ 
            items: newItems, 
            isCartOpen: options.openCart ?? true 
        })
        
        if (options.showToast) {
            toast.success("Added to cart")
        }

        // Sync to DB
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const dbItem = {
                    user_id: user.id,
                    product_id: item.productId,
                    size: item.size,
                    color: item.color,
                    quantity: newQuantity
                }
                const { data, error } = await supabase
                    .from('cart_items')
                    .upsert(dbItem, { onConflict: 'user_id, product_id, size, color' })
                    .select('id')
                    .single()
                
                if (error) throw error
                
                // CRITICAL: Update the item with the DB ID to prevent duplication on refresh
                if (data?.id) {
                    set((state) => ({
                        items: state.items.map((i) => 
                            i.productId === item.productId && i.size === item.size && i.color === item.color
                            ? { ...i, id: data.id }
                            : i
                        )
                    }))
                }
            }
        } catch (error) {
            console.error("[CartStore] Sync error (addItem):", error)
            // We don't necessarily revert if it's just a sync error, but log it
            // Reverting might be annoying for UX if the local addition was successful
        }
      },

      removeItem: async (productId, size, color) => {
        const currentItems = get().items
        
        // Optimistic
        set((state) => ({
            items: state.items.filter(
                (i) => !(i.productId === productId && i.size === size && i.color === color)
            )
        }))

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                 const { error } = await supabase
                    .from('cart_items')
                    .delete()
                    .match({ user_id: user.id, product_id: productId, size, color })
                
                if (error) throw error
            }
        } catch (error) {
            console.error("[CartStore] Sync error (removeItem):", error)
            set({ items: currentItems })
            toast.error("Failed to sync removal. Reverting.")
        }
      },

      updateQuantity: async (productId, size, color, quantity) => {
        const currentItems = get().items
        const itemIndex = currentItems.findIndex(
            (i) => i.productId === productId && i.size === size && i.color === color
        )

        if (itemIndex === -1) return

        // Auto-remove if quantity <= 0
        if (quantity <= 0) {
            get().removeItem(productId, size, color)
            return
        }

        const item = currentItems[itemIndex]
        const maxQty = item.maxQuantity || 10
        
        if (quantity > maxQty) {
            toast.error(`Sorry, we only have ${maxQty} in stock`)
            return
        }

        // Optimistic
        set((state) => ({
            items: state.items.map((i) =>
                i.productId === productId && i.size === size && i.color === color
                ? { ...i, quantity }
                : i
            )
        }))

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { error } = await supabase
                    .from('cart_items')
                    .update({ quantity })
                    .match({ user_id: user.id, product_id: productId, size, color })
                
                if (error) throw error
            }
        } catch (error) {
            console.error("[CartStore] Sync error (updateQuantity):", error)
            set({ items: currentItems })
            toast.error("Failed to sync quantity. Reverting.")
        }
      },

      clearCart: async () => {
         const { data: { user } } = await supabase.auth.getUser()
         set({ items: [] })
         if (user) {
             await supabase.from('cart_items').delete().eq('user_id', user.id)
         }
      },

      syncWithUser: async (userId: string) => {
        /**
         * ADVANCED IDEMPOTENT SYNC LOGIC
         * Prevents duplication by checking for already-synced items (with IDs)
         */
        try {
            // 1. Fetch Server Items
            const { data: serverRawItems, error } = await supabase
                .from('cart_items')
                .select('id, product_id, quantity, size, color, product:products(name, price, main_image_url, slug, category_id)')
                .eq('user_id', userId)

            if (error) {
                console.error("[CartSync] Failed to fetch server items:", error)
                return
            }

            interface CartDBItem {
                id: string
                product_id: string
                quantity: number
                size: string
                color: string
                product: {
                    name: string
                    price: number
                    main_image_url: string
                    slug: string
                    category_id: string
                } | null
            }

            const serverItems: CartItem[] = ((serverRawItems as unknown) as CartDBItem[] || []).map((dbItem) => ({
                id: dbItem.id,
                productId: dbItem.product_id,
                name: dbItem.product?.name || 'Unknown Product',
                price: Number(dbItem.product?.price || 0),
                image: dbItem.product?.main_image_url || null,
                size: dbItem.size || '',
                color: dbItem.color || '',
                quantity: dbItem.quantity,
                maxQuantity: 10,
                slug: dbItem.product?.slug,
                categoryId: dbItem.product?.category_id
            })).filter(i => i.price > 0)

            // 2. Intelligent Merge
            const localItems = get().items
            const mergedMap = new Map<string, CartItem>()

            // A. Load Server Items first (they have absolute truth IDs)
            serverItems.forEach(item => {
                const key = `${item.productId}-${item.size}-${item.color}`
                mergedMap.set(key, item)
            })

            // B. Merge Local Items (checking if they are already accounted for)
            localItems.forEach(localItem => {
                const key = `${localItem.productId}-${localItem.size}-${localItem.color}`
                const existing = mergedMap.get(key)
                
                if (existing) {
                    // ID Check: If the local item has an ID, it's ALREADY in the server list.
                    // If it doesn't have an ID, it's a guest item that needs to be SUMMED.
                    if (!localItem.id) {
                        const newQty = Math.min(existing.quantity + localItem.quantity, existing.maxQuantity || 10)
                        mergedMap.set(key, { ...existing, quantity: newQty })
                    }
                    // Else: localItem.id === existing.id, so it's the same item, skip summing.
                } else {
                    // New item found locally only
                    mergedMap.set(key, localItem)
                }
            })

            const finalItems = Array.from(mergedMap.values())
            set({ items: finalItems })

            // 3. Batch Sync back to Server for any new/merged items without IDs or updated quantities
            const dbPayload = finalItems.map(item => ({
                user_id: userId,
                product_id: item.productId,
                size: item.size,
                color: item.color,
                quantity: item.quantity
            }))
            
            if (dbPayload.length > 0) {
                 await supabase
                    .from('cart_items')
                    .upsert(dbPayload, { onConflict: 'user_id, product_id, size, color' })
            }

        } catch (err) {
            console.error("[CartSync] Critical failure:", err)
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

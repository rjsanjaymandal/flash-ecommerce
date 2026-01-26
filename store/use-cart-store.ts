import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface CartItem {
  id?: string // UUID for DB items
  productId: string
  categoryId: string
  slug: string
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
  savedItems: CartItem[]
  isCartOpen: boolean
  isLoading: boolean
  isHydrated: boolean
  addItem: (item: CartItem, options?: { openCart?: boolean, showToast?: boolean }) => Promise<void>
  removeItem: (productId: string, size: string, color: string) => Promise<void>
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => Promise<void>
  toggleSaveForLater: (productId: string, size: string, color: string) => Promise<void>
  clearCart: () => Promise<void>
  syncWithUser: (userId: string) => Promise<void>
  setItems: (items: CartItem[]) => void
  setSavedItems: (items: CartItem[]) => void
  setIsCartOpen: (open: boolean) => void
  setIsLoading: (isLoading: boolean) => void
  setHasHydrated: (hydrated: boolean) => void
  loadingStates: Record<string, boolean>
  setLoadingState: (key: string, isLoading: boolean) => void
  // Enterprise Sync Logic
  syncQueue: Promise<any>
  addToSyncQueue: (fn: () => Promise<any>) => void
}

const supabase = createClient()

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      savedItems: [],
      isCartOpen: false,
      isLoading: false,
      isHydrated: false,
      loadingStates: {},
      syncQueue: Promise.resolve(),
      setLoadingState: (key, isLoading) => set((state) => ({ loadingStates: { ...state.loadingStates, [key]: isLoading } })),
      setHasHydrated: (hydrated) => set({ isHydrated: hydrated }),

      addToSyncQueue: (fn) => {
        set((state) => {
          // ENSURE syncQueue is a Promise (defensive against hydration edge cases)
          const currentQueue = state.syncQueue instanceof Promise ? state.syncQueue : Promise.resolve();
          return {
            syncQueue: currentQueue.then(async () => {
              try {
                await fn();
              } catch (err) {
                console.error("[CartStore] Sync operation failed:", err);
              }
            })
          };
        });
      },
      
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

        // Sync to DB via Queue
        get().addToSyncQueue(async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

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
            
            if (data?.id) {
                set((state) => ({
                    items: state.items.map((i) => 
                        i.productId === item.productId && i.size === item.size && i.color === item.color
                        ? { ...i, id: data.id }
                        : i
                    )
                }))
            }
        })
      },

      removeItem: async (productId, size, color) => {
        const currentItems = get().items
        
        // Optimistic
        set((state) => ({
            items: state.items.filter(
                (i) => !(i.productId === productId && i.size === size && i.color === color)
            )
        }))

        // Sync to DB via Queue
        get().addToSyncQueue(async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from('cart_items')
                .delete()
                .match({ user_id: user.id, product_id: productId, size, color })
            
            if (error) {
                toast.error("Failed to sync removal. Reverting.")
                set({ items: currentItems })
                throw error
            }
        })
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

        // Sync to DB via Queue
        get().addToSyncQueue(async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from('cart_items')
                .update({ quantity })
                .match({ user_id: user.id, product_id: productId, size, color })
            
            if (error) {
                toast.error("Failed to sync quantity. Reverting.")
                set({ items: currentItems })
                throw error
            }
        })
      },

      toggleSaveForLater: async (productId, size, color) => {
        const { items, savedItems } = get()
        const itemInCart = items.find(i => i.productId === productId && i.size === size && i.color === color)
        const itemInSaved = savedItems.find(i => i.productId === productId && i.size === size && i.color === color)

        if (itemInCart) {
          // Move from Cart to Saved
          set({
            items: items.filter(i => !(i.productId === productId && i.size === size && i.color === color)),
            savedItems: [...savedItems, itemInCart]
          })
          toast.success("Item saved for later")
          
          // Sync: Remove from cart_items, Add to wishlist_items
          get().addToSyncQueue(async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            
            // 1. Delete from cart
            await supabase.from('cart_items').delete().match({ user_id: user.id, product_id: productId, size, color })
            
            // 2. Add to wishlist
            await supabase.from('wishlist_items').upsert({ user_id: user.id, product_id: productId }, { onConflict: 'user_id, product_id' })
          })
        } else if (itemInSaved) {
          // Move from Saved to Cart
          set({
            items: [...items, itemInSaved],
            savedItems: savedItems.filter(i => !(i.productId === productId && i.size === size && i.color === color)),
            isCartOpen: true
          })
          toast.success("Item moved back to bag")

          // Sync: Remove from wishlist_items, Add to cart_items
          get().addToSyncQueue(async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            
            // 1. Delete from wishlist
            await supabase.from('wishlist_items').delete().match({ user_id: user.id, product_id: productId })
            
            // 2. Add to cart
            await supabase.from('cart_items').upsert({ 
                user_id: user.id, 
                product_id: productId, 
                size, 
                color, 
                quantity: itemInSaved.quantity 
            }, { onConflict: 'user_id, product_id, size, color' })
          })
        }
      },

      clearCart: async () => {
         const { data: { user } } = await supabase.auth.getUser()
         set({ items: [], savedItems: [] })
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
            // 1. Fetch Server Items (Cart + Saved/Wishlist)
            const [cartRes, savedRes] = await Promise.all([
                supabase
                    .from('cart_items')
                    .select('id, product_id, quantity, size, color, product:products(name, price, main_image_url, slug, category_id)')
                    .eq('user_id', userId),
                supabase
                    .from('wishlist_items')
                    .select('id, product_id, product:products(name, price, main_image_url, slug, category_id)')
                    .eq('user_id', userId)
            ])

            if (cartRes.error) {
                console.error("[CartSync] Failed to fetch server cart:", cartRes.error)
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

            interface SavedDBItem {
                id: string
                product_id: string
                product: {
                    name: string
                    price: number
                    main_image_url: string
                    slug: string
                    category_id: string
                } | null
            }

            const serverCartRaw = (cartRes.data as unknown) as CartDBItem[] || []
            const serverSavedRaw = (savedRes.data as unknown) as SavedDBItem[] || []

            const serverItems: CartItem[] = serverCartRaw.map((dbItem) => ({
                id: dbItem.id,
                productId: dbItem.product_id,
                name: dbItem.product?.name || 'Unknown Product',
                price: Number(dbItem.product?.price || 0),
                image: dbItem.product?.main_image_url || null,
                size: dbItem.size || '',
                color: dbItem.color || '',
                quantity: dbItem.quantity,
                maxQuantity: 10,
                slug: dbItem.product?.slug || '',
                categoryId: dbItem.product?.category_id || ''
            })).filter(i => i.price > 0 && i.slug && i.categoryId)

            const serverSavedItems: CartItem[] = serverSavedRaw.map((dbItem) => ({
                id: dbItem.id,
                productId: dbItem.product_id,
                name: dbItem.product?.name || 'Unknown Product',
                price: Number(dbItem.product?.price || 0),
                image: dbItem.product?.main_image_url || null,
                size: 'Universal', // Clearer than 'Standard' for generic wishlist items
                color: 'N/A',
                quantity: 1,
                maxQuantity: 10,
                slug: dbItem.product?.slug || '',
                categoryId: dbItem.product?.category_id || ''
            })).filter(i => i.price > 0 && i.slug && i.categoryId)

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
            
            // 3. Intelligent Merge (Saved)
            const localSaved = get().savedItems
            const mergedSavedMap = new Map<string, CartItem>()
            
            serverSavedItems.forEach(item => mergedSavedMap.set(item.productId, item))
            localSaved.forEach(item => {
                if (!mergedSavedMap.has(item.productId)) {
                    mergedSavedMap.set(item.productId, item)
                }
            })
            
            const finalSavedItems = Array.from(mergedSavedMap.values())

            set({ items: finalItems, savedItems: finalSavedItems })

            // 4. Batch Sync Cart back to Server
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

            // 5. Batch Sync Saved (Wishlist) back to Server
            const savedPayload = finalSavedItems.map(item => ({
                user_id: userId,
                product_id: item.productId,
            }))
            
            if (savedPayload.length > 0) {
                 await supabase
                    .from('wishlist_items')
                    .upsert(savedPayload, { onConflict: 'user_id, product_id' })
            }

        } catch (err) {
            console.error("[CartSync] Critical failure:", err)
        }
      },

      setItems: (items) => set({ items }),
      setSavedItems: (savedItems) => set({ savedItems }),
      setIsCartOpen: (open) => set({ isCartOpen: open }),
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'flash-cart-storage',
      skipHydration: true,
      partialize: (state) => ({ 
        items: state.items, 
        savedItems: state.savedItems 
      }),
    }
  )
)

export const selectCartCount = (state: CartState) => state.items.reduce((acc, item) => acc + item.quantity, 0)
export const selectCartSubtotal = (state: CartState) => state.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
export const selectShippingFee = (state: CartState) => {
  const subtotal = selectCartSubtotal(state)
  if (subtotal === 0) return 0
  return subtotal >= 699 ? 0 : 50
}
export const selectCartTotal = (state: CartState) => {
  return selectCartSubtotal(state) + selectShippingFee(state)
}
export const selectFreeShippingRemaining = (state: CartState) => {
  const subtotal = selectCartSubtotal(state)
  return Math.max(699 - subtotal, 0)
}

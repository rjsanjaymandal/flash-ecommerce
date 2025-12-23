'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/auth-context'
import { useCartStore, CartItem } from '@/store/use-cart-store'
import { useWishlistStore, WishlistItem } from '@/store/use-wishlist-store'
import { toast } from 'sonner'

export function StoreSync() {
  const { user } = useAuth()
  const supabase = createClient()
  
  // Cart Store Actions
  const setCartItems = useCartStore((state) => state.setItems)
  const cartItems = useCartStore((state) => state.items)
  const setIsLoading = useCartStore((state) => state.setIsLoading)
  
  // Wishlist Store Actions
  const setWishlistItems = useWishlistStore((state) => state.setItems)
  
  // Refs to track state
  const prevCartItemsRef = useRef(cartItems)
  const isSyncingRef = useRef(false)

  // Helper to validate stock
  async function validateStock(items: CartItem[]) {
      if (items.length === 0) return
      const { data: stocks } = await supabase
          .from('product_stock')
          .select('product_id, size, color, quantity')
          .in('product_id', items.map(i => i.productId))
      
      // Edge Case: If stocks query fails or returns nothing, we shouldn't assume OOS for everything unless we are sure.
      // But if we get an empty array and we asked for specific IDs, it means they might be deleted. 
      // Safe bet: if !stocks, do nothing.
      if (!stocks) return

      let changed = false
      const changes: string[] = []

      const newItems = items.map(item => {
          const stockEntry = stocks.find(s => 
              s.product_id === item.productId && s.size === item.size && s.color === item.color
          )
          
          // If stock entry is missing, it implies 0 stock (or product deleted).
          const available = stockEntry?.quantity ?? 0
          
          if (item.quantity > available) {
              changed = true
              if (available === 0) {
                  changes.push(`Marked ${item.name} as Sold Out`)
                  // Keep item but mark maxQuantity as 0 so UI can show OOS
                  return { ...item, maxQuantity: 0 }
              } else {
                  changes.push(`Adjusted ${item.name} quantity to ${available}`)
                  return { ...item, quantity: available, maxQuantity: available }
              }
          }
          return { ...item, maxQuantity: available }
      }) // Removed .filter(i => i.quantity > 0) to allow OOS items to persist visually

      if (changed) {
          // Show specific changes or a summary
          if (changes.length === 1) {
             toast.warning(changes[0])
          } else {
             toast.warning("Some items were updated due to stock changes.")
          }
          setCartItems(newItems)
          
          // SYNC BACK TO DB
          if (user) {
              // 1. Identify removed items to DELETE
              const removedItems = items.filter(oldItem => 
                  !newItems.some(newItem => 
                      newItem.productId === oldItem.productId && 
                      newItem.size === oldItem.size && 
                      newItem.color === oldItem.color
                  )
              )

              for (const removed of removedItems) {
                  await supabase.from('cart_items').delete().match({ 
                      user_id: user.id, 
                      product_id: removed.productId, 
                      size: removed.size, 
                      color: removed.color 
                  })
              }

              // 2. Identify modified items to UPDATE
              const modifiedItems = newItems.filter(newItem => {
                  const oldItem = items.find(i => 
                      i.productId === newItem.productId && 
                      i.size === newItem.size && 
                      i.color === newItem.color
                  )
                  return oldItem && oldItem.quantity !== newItem.quantity
              })

              for (const modified of modifiedItems) {
                  await supabase.from('cart_items').update({ quantity: modified.quantity }).match({
                      user_id: user.id,
                      product_id: modified.productId,
                      size: modified.size,
                      color: modified.color
                  })
              }
          }
      }
  }

  // 1. Load Initial Data on Auth Change
  useEffect(() => {
    async function loadData() {
        if (isSyncingRef.current) return
        
        console.log('[StoreSync] Auth status change. User:', user?.email)
        isSyncingRef.current = true
        setIsLoading(true)
        
        try {
            // Hydrate from localStorage first
            useCartStore.persist.rehydrate()
            useWishlistStore.persist.rehydrate()
            const localCart = useCartStore.getState().items

            if (user) {
                console.log('[StoreSync] Logged in. Syncing DB data...')
                
                // 1. Merge Guest Items
                if (localCart.length > 0) {
                   const guestItems = localCart.filter(i => !i.id)
                   
                   if (guestItems.length > 0) {
                       console.log('[StoreSync] Found guest items. Merging to DB...', guestItems.length)
                       for (const item of guestItems) {
                          await supabase.from('cart_items').upsert({
                              user_id: user.id,
                              product_id: item.productId,
                              size: item.size,
                              color: item.color,
                              quantity: item.quantity
                          }, { onConflict: 'user_id, product_id, size, color' })
                       }
                   }
                }

                // 1b. Merge Guest Wishlist
                const localWishlist = useWishlistStore.getState().items
                if (localWishlist.length > 0) {
                    console.log('[StoreSync] Found guest wishlist items. Merging to DB...')
                    for (const item of localWishlist) {
                        await supabase.from('wishlist_items').upsert({
                            user_id: user.id,
                            product_id: item.productId
                        }, { onConflict: 'user_id, product_id', ignoreDuplicates: true })
                    }
                }

                // 2. Load Final Full Cart from DB
                const { data: cartData, error: cartError } = await supabase
                    .from('cart_items')
                    .select(`*, product:products(name, price, main_image_url)`)
                    .eq('user_id', user.id)

                if (cartError) {
                    console.error('[StoreSync] Cart fetch error:', cartError)
                } else if (cartData) {
                    console.log('[StoreSync] Cart items fetched:', cartData.length)
                    const mappedCart: CartItem[] = cartData.map((d: any) => ({
                        id: d.id,
                        productId: d.product_id,
                        name: d.product?.name || 'Unknown Product',
                        price: d.product?.price || 0,
                        image: d.product?.main_image_url || null,
                        size: d.size,
                        color: d.color,
                        quantity: d.quantity,
                        maxQuantity: 10
                    }))
                    setCartItems(mappedCart)
                    validateStock(mappedCart)
                }

                // 3. Load Wishlist
                const { data: wishlistData, error: wishError } = await supabase
                    .from('wishlist_items')
                    .select(`*, product:products(name, price, slug, main_image_url)`)
                    .eq('user_id', user.id)
                
                if (wishError) {
                    console.error('[StoreSync] Wishlist fetch error:', wishError)
                } else if (wishlistData) {
                    const mappedWishlist: WishlistItem[] = wishlistData.map((d: any) => ({
                        id: d.id,
                        productId: d.product_id,
                        name: d.product?.name || 'Unknown',
                        price: d.product?.price || 0,
                        image: d.product?.main_image_url || null,
                        slug: d.product?.slug || '#'
                    }))
                    setWishlistItems(mappedWishlist)
                }
            } else {
                console.log('[StoreSync] Logged out or guest mode.')
            }
        } catch (error) {
            console.error('[StoreSync] Sync error:', error)
        } finally {
            setIsLoading(false)
            isSyncingRef.current = false
        }
    }

    loadData()
  }, [user, setCartItems, setWishlistItems, setIsLoading])

  // 2. Real-time Stock Subscription
  useEffect(() => {
      const channel = supabase
        .channel('stock-changes-store')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'product_stock' },
          (payload) => {
              const { product_id, size, color, quantity } = payload.new as any
              
              // 1. Update Global Stock Store (UI will react immediately)
              // Dynamically import to avoid circular dep issues during initialization if any, 
              // though importing at top level is fine usually.
              // We'll use the imported function.
              const updateStock = require('@/store/use-stock-store').useStockStore.getState().updateStock
              updateStock(product_id, size, color, quantity)

              // 2. Check Cart (Existing Logic)
              const currentItems = useCartStore.getState().items
              
              const needsUpdate = currentItems.some(i => 
                  i.productId === product_id && i.size === size && i.color === color && i.quantity > quantity
              )

              if (needsUpdate) {
                  toast.error("Item stock updated in your cart!")
                  setCartItems(currentItems.map(i => {
                      if (i.productId === product_id && i.size === size && i.color === color) {
                          // If stock is 0, mark maxQuantity as 0 but keep item quantity for UI warning
                          if (quantity === 0) {
                              return { ...i, maxQuantity: 0 }
                          }
                          // If stock simply reduced, cap quantity
                          // Actually, if stock reduced to 2, and we have 5, we should probably cap it?
                          // Or should we warn?
                          // Standard behavior: cap it to available.
                          return { ...i, quantity: Math.min(i.quantity, quantity), maxQuantity: quantity }
                      }
                      return i
                   })) // Removed .filter here too
              }
          }
        )
        .subscribe()

      return () => { supabase.removeChannel(channel) }
  }, [setCartItems])


  // 3. Sync Changes TO Supabase (Debounced or effect-based)
  // This is tricky. simpler to have the STORE call an API, but keeping store pure is nice.
  // We can just listen to store changes. 
  
  // NOTE: Ideally, we should intercept actions in the store, but listening to state changes works for saving.
  // HOWEVER, blindly saving full state on every change is heavy.
  // We'll trust that for now, the "Load" step handles the initial sync, and we just need individual action handlers.
  // Since we migrated logic OUT of the context, we lost the `addItem` -> `supabase.insert` logic.
  // We strictly need to re-implement that. 
  // We have two options:
  // A. Middleware in Zustand.
  // B. `useEffect` that diffs state.
  // C. Just modify the store actions to be async and call supabase. <--- WINNER.
  
  // WAIT: I made the store actions synchronous in `use-cart-store.ts`. 
  // I should probably update `use-cart-store.ts` to handle the side effects internally or via a helper, 
  // OR rely on this component to watch changes.
  
  // Let's go with Option B (Effect) for simplicity of migration if we want to keep the store "dumb", 
  // BUT Option C (Async Actions) is much more robust for "Add to Cart" -> "Network Error" -> "Revert".
  
  // Revised Plan: I will update `use-cart-store.ts` and `use-wishlist-store.ts` to have async actions that call Supabase if user is logged in.
  // BUT, to access `supabase` and `user` inside the store, we need to pass them or import them. 
  // `createClient` works anywhere. `useAuth` is a hook (Context). 
  // We can get the session from `supabase.auth.getSession()` inside the store action.
  
  return null
}

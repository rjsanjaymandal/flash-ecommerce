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
  
  // Refs to track previous state for syncing *changes*
  const prevCartItemsRef = useRef(cartItems)
  // const prevWishlistItemsRef = useRef(wishlistItems)

  // 1. Load Initial Data on Auth Change
  useEffect(() => {
    async function loadData() {
        console.log('[StoreSync] Auth status change. User:', user?.email)
        setIsLoading(true)
        
        // Hydrate from localStorage first
        useCartStore.persist.rehydrate()
        useWishlistStore.persist.rehydrate()
        const localCart = useCartStore.getState().items

        if (user) {
            console.log('[StoreSync] Logged in. Syncing DB data...')
            
            // 1. If we have local guest items, we should ideally push them to DB
            if (localCart.length > 0) {
               console.log('[StoreSync] Found guest items. Merging to DB...')
               for (const item of localCart) {
                  await supabase.from('cart_items').upsert({
                      user_id: user.id,
                      product_id: item.productId,
                      size: item.size,
                      color: item.color,
                      quantity: item.quantity
                  }, { onConflict: 'user_id, product_id, size, color' })
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
        setIsLoading(false)
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
              const currentItems = useCartStore.getState().items
              
              const needsUpdate = currentItems.some(i => 
                  i.productId === product_id && i.size === size && i.color === color && i.quantity > quantity
              )

              if (needsUpdate) {
                  toast.error("Item stock updated in your cart!")
                  setCartItems(currentItems.map(i => 
                      (i.productId === product_id && i.size === size && i.color === color && i.quantity > quantity)
                          ? { ...i, quantity: Math.max(0, quantity), maxQuantity: quantity }
                          : i
                   ).filter(i => i.quantity > 0))
              }
          }
        )
        .subscribe()

      return () => { supabase.removeChannel(channel) }
  }, [setCartItems])

  // Helper to validate stock
  async function validateStock(items: CartItem[]) {
      if (items.length === 0) return
      const { data: stocks } = await supabase
          .from('product_stock')
          .select('product_id, size, color, quantity')
          .in('product_id', items.map(i => i.productId))
      
      if (!stocks) return

      let changed = false
      const newItems = items.map(item => {
          const stockEntry = stocks.find(s => 
              s.product_id === item.productId && s.size === item.size && s.color === item.color
          )
          const available = stockEntry?.quantity ?? 0
          if (item.quantity > available) {
              changed = true
              return { ...item, quantity: available, maxQuantity: available }
          }
          return { ...item, maxQuantity: available }
      }).filter(i => i.quantity > 0)

      if (changed) {
          toast.warning("Cart updated based on available stock.")
          setCartItems(newItems)
      }
  }

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

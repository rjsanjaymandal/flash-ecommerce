'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/auth-context'
import { useCartStore, CartItem } from '@/store/use-cart-store'
import { useWishlistStore, WishlistItem } from '@/store/use-wishlist-store'
import { useStockStore } from '@/store/use-stock-store'
import { toast } from 'sonner'

interface CartDbItem {
    id: string
    product_id: string
    size: string
    color: string
    quantity: number
    product: {
        name: string
        price: number
        main_image_url: string
        category_id: string
        slug: string
    } | null
}

interface WishlistDbItem {
    id: string
    product_id: string
    product: {
        name: string
        price: number
        main_image_url: string
        slug: string
    } | null
}

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
  const validateStock = useCallback(async (items: CartItem[]) => {
      if (items.length === 0) return
      
      try {
          const { data: stocks } = await supabase
              .from('product_stock')
              .select('product_id, size, color, quantity')
              .in('product_id', items.map(i => i.productId))
          
          if (!stocks) return

          // Also fetch current prices to detect changes
          const { data: products } = await supabase
              .from('products')
              .select('id, price')
              .in('id', items.map(i => i.productId))

          let changed = false
          const changes: string[] = []

          const newItems = items.map(item => {
              const stockEntry = stocks.find(s => 
                  s.product_id === item.productId && s.size === item.size && s.color === item.color
              )
              const productEntry = products?.find(p => p.id === item.productId)
              
              const available = stockEntry?.quantity ?? 0
              let updatedItem = { ...item, maxQuantity: available }

              // 1. Stock Check
              if (item.quantity > available) {
                  changed = true
                  if (available === 0) {
                      changes.push(`Marked ${item.name} as Sold Out`)
                      updatedItem = { ...updatedItem, maxQuantity: 0 }
                  } else {
                      changes.push(`Adjusted ${item.name} quantity to ${available}`)
                      updatedItem = { ...updatedItem, quantity: available, maxQuantity: available }
                  }
              }

              // 2. Price Check
              if (productEntry && productEntry.price !== item.price) {
                  changed = true
                  changes.push(`Price for ${item.name} updated to ${productEntry.price}`)
                  updatedItem = { ...updatedItem, price: productEntry.price }
              }

              return updatedItem
          })

          if (changed) {
              if (changes.length > 0) {
                 toast.info("Your bag was updated with latest prices and stock.")
              }
              setCartItems(newItems)
              
              if (user) {
                  // Sync adjustments back to DB
                  for (const updated of newItems) {
                      await supabase.from('cart_items').upsert({
                          user_id: user.id,
                          product_id: updated.productId,
                          size: updated.size,
                          color: updated.color,
                          quantity: updated.quantity
                      }, { onConflict: 'user_id, product_id, size, color' })
                  }
              }
          }
      } catch (error) {
          console.error("[StoreSync] Stock validation failed:", error)
      }
  }, [supabase, user, setCartItems])

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
                       
                       // Fetch existing items to handle quantity summing
                       const { data: dbItems } = await supabase.from('cart_items').select('*').eq('user_id', user.id)
                       
                       for (const item of guestItems) {
                          const existing = dbItems?.find(d => 
                              d.product_id === item.productId && d.size === item.size && d.color === item.color
                          )
                          
                          const finalQty = existing ? existing.quantity + item.quantity : item.quantity

                          await supabase.from('cart_items').upsert({
                              user_id: user.id,
                              product_id: item.productId,
                              size: item.size,
                              color: item.color,
                              quantity: finalQty
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
                    .select(`*, product:products(name, price, main_image_url, category_id, slug)`)
                    .eq('user_id', user.id)

                if (cartError) {
                    console.error('[StoreSync] Cart fetch error:', cartError)
                } else if (cartData) {
                    console.log('[StoreSync] Cart items fetched:', cartData.length)
                    const mappedCart: CartItem[] = (cartData as unknown as CartDbItem[]).map((d) => ({
                        id: d.id,
                        productId: d.product_id,
                        categoryId: d.product?.category_id,
                        slug: d.product?.slug,
                        name: d.product?.name || 'Unknown Product',
                        price: d.product?.price || 0,
                        image: d.product?.main_image_url || null,
                        size: d.size,
                        color: d.color,
                        quantity: d.quantity,
                        maxQuantity: 10
                    }))
                    setCartItems(mappedCart)
                    await validateStock(mappedCart)
                }

                // 3. Load Wishlist
                const { data: wishlistData, error: wishError } = await supabase
                    .from('wishlist_items')
                    .select(`*, product:products(name, price, slug, main_image_url)`)
                    .eq('user_id', user.id)
                
                if (wishError) {
                    console.error('[StoreSync] Wishlist fetch error:', wishError)
                } else if (wishlistData) {
                    const mappedWishlist: WishlistItem[] = (wishlistData as unknown as WishlistDbItem[]).map((d) => ({
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
  }, [user, setCartItems, setWishlistItems, setIsLoading, supabase, validateStock])

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
              useStockStore.getState().updateStock(product_id, size, color, quantity)

              // 2. Check Cart
              const currentItems = useCartStore.getState().items
              const relevantItem = currentItems.find(i => 
                  i.productId === product_id && i.size === size && i.color === color
              )

              if (relevantItem) {
                  // If quantity reduced below what we have, adjust it
                  if (relevantItem.quantity > quantity) {
                      toast.error(`${relevantItem.name} stock updated.`)
                      setCartItems(currentItems.map(i => {
                          if (i.productId === product_id && i.size === size && i.color === color) {
                              return { ...i, quantity: Math.min(i.quantity, quantity), maxQuantity: quantity }
                          }
                          return i
                       }))
                  } else {
                      // Just update maxQuantity silently
                      setCartItems(currentItems.map(i => {
                        if (i.productId === product_id && i.size === size && i.color === color) {
                            return { ...i, maxQuantity: quantity }
                        }
                        return i
                     }))
                  }
              }
          }
        )
        .subscribe()

      // 3. Tab Focus Re-validation
      const handleFocus = () => {
          const currentItems = useCartStore.getState().items
          if (currentItems.length > 0) validateStock(currentItems)
      }

      window.addEventListener('focus', handleFocus)
      return () => { 
          supabase.removeChannel(channel)
          window.removeEventListener('focus', handleFocus)
      }
  }, [setCartItems, user, supabase, validateStock])


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

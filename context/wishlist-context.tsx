'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './auth-context'

export interface WishlistItem {
  id?: string
  productId: string
  name: string
  price: number
  image: string | null
  slug: string
}

interface WishlistContextType {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  wishlistCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const supabase = createClient()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load items
  useEffect(() => {
    async function loadWishlist() {
      if (user) {
        const { data } = await supabase
          .from('wishlist_items')
          .select(`
            *,
            product:products (
              name,
              price,
              slug,
              main_image_url
            )
          `)
          .eq('user_id', user.id)

        if (data) {
          const mapped: WishlistItem[] = data.map((d: any) => ({
             id: d.id,
             productId: d.product_id,
             name: d.product.name,
             price: d.product.price,
             image: d.product.main_image_url,
             slug: d.product.slug
          }))
          setItems(mapped)
        }
      } else {
        const saved = localStorage.getItem('flash-wishlist')
        if (saved) {
          try {
            setItems(JSON.parse(saved))
          } catch (e) {
            console.error('Failed to parse wishlist', e)
          }
        }
      }
      setIsInitialized(true)
    }
    loadWishlist()
  }, [user])

  // Save to local storage on change (guests)
  useEffect(() => {
    if (isInitialized && !user) {
      localStorage.setItem('flash-wishlist', JSON.stringify(items))
    }
  }, [items, isInitialized, user])

  const addItem = useCallback(async (item: WishlistItem) => {
    // Optimistic
    let exists = false;
    setItems(current => {
      if (current.some(i => i.productId === item.productId)) {
        exists = true;
        return current;
      }
      return [...current, item]
    })

    if (exists) {
        toast.info("Already in wishlist")
        return
    }

    toast.success("Added to Wishlist")

    if (user) {
        const { error } = await supabase
            .from('wishlist_items')
            .upsert(
                { user_id: user.id, product_id: item.productId }, 
                { onConflict: 'user_id, product_id' }
            )
        if (error) console.error("Error adding to remote wishlist", error)
    }
  }, [user])

  const removeItem = useCallback(async (productId: string) => {
    setItems(current => current.filter(i => i.productId !== productId))
    toast.info("Removed from Wishlist")

    if (user) {
        await supabase
            .from('wishlist_items')
            .delete()
            .match({ user_id: user.id, product_id: productId })
    }
  }, [user])

  const isInWishlist = useCallback((productId: string) => {
    return items.some(i => i.productId === productId)
  }, [items])

  const value = useMemo(() => ({
      items,
      addItem,
      removeItem,
      isInWishlist,
      wishlistCount: items.length
  }), [items, addItem, removeItem, isInWishlist])

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (context === undefined) throw new Error('useWishlist must be used within WishlistProvider')
  return context
}

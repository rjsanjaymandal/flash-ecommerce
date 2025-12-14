'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'

export interface WishlistItem {
  productId: string
  name: string
  price: number
  image: string | null
  slug: string
}

interface WishlistContextType {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  wishlistCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('flash-wishlist')
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse wishlist', e)
      }
    }
    setIsInitialized(true)
  }, [])

  // Save to local storage on change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('flash-wishlist', JSON.stringify(items))
    }
  }, [items, isInitialized])

  const addItem = (item: WishlistItem) => {
    setItems(current => {
      if (current.some(i => i.productId === item.productId)) {
        toast.info("Already in wishlist")
        return current
      }
      toast.success("Added to Wishlist")
      return [...current, item]
    })
  }

  const removeItem = (productId: string) => {
    setItems(current => current.filter(i => i.productId !== productId))
    toast.info("Removed from Wishlist")
  }

  const isInWishlist = (productId: string) => {
    return items.some(i => i.productId === productId)
  }

  return (
    <WishlistContext.Provider value={{
      items,
      addItem,
      removeItem,
      isInWishlist,
      wishlistCount: items.length
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (context === undefined) throw new Error('useWishlist must be used within WishlistProvider')
  return context
}

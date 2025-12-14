'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'

export interface CartItem {
  productId: string
  name: string
  price: number
  image: string | null
  size: string
  color: string
  quantity: number
  maxQuantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string, size: string, color: string) => void
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number
  isCartOpen: boolean // For drawer
  setIsCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('flash-cart')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Sanitize
        const sanitized = parsed.map((i: any) => ({
            ...i,
            quantity: Number.isFinite(i.quantity) ? i.quantity : 1,
            price: Number.isFinite(i.price) ? i.price : 0
        }))
        setItems(sanitized)
      } catch (e) {
        console.error('Failed to parse cart', e)
        localStorage.removeItem('flash-cart')
      }
    }
    setIsInitialized(true)
  }, [])

  // Save to local storage on change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('flash-cart', JSON.stringify(items))
    }
  }, [items, isInitialized])

  const addItem = useCallback((item: CartItem) => {
    setItems(current => {
      const existing = current.find(
        i => i.productId === item.productId && i.size === item.size && i.color === item.color
      )
      
      if (existing) {
        return current.map(i => 
          (i.productId === item.productId && i.size === item.size && i.color === item.color)
            ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.maxQuantity) } // Simple cap
            : i
        )
      }
      return [...current, item]
    })
    setIsCartOpen(true)
  }, [])

  const removeItem = useCallback((productId: string, size: string, color: string) => {
    setItems(current => current.filter(
      i => !(i.productId === productId && i.size === size && i.color === color)
    ))
  }, [])

  const updateQuantity = useCallback((productId: string, size: string, color: string, quantity: number) => {
    setItems(current => current.map(i => 
      (i.productId === productId && i.size === size && i.color === color)
        ? { ...i, quantity: Math.min(Math.max(1, quantity), i.maxQuantity) }
        : i
    ))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)
  const cartTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  const value = useMemo(() => ({
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
    isCartOpen,
    setIsCartOpen
  }), [items, addItem, removeItem, updateQuantity, clearCart, cartCount, cartTotal, isCartOpen])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) throw new Error('useCart must be used within CartProvider')
  return context
}

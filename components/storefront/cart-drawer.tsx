'use client'

import { useCart } from "@/context/cart-context"
import { X, Minus, Plus, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn, formatCurrency } from "@/lib/utils"

export function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, removeItem, updateQuantity, cartTotal } = useCart()

  if (!isCartOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-background shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col h-full border-l border-border">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-lg font-bold flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Shopping Cart
            </h2>
            <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-muted rounded-full">
                <X className="h-5 w-5" />
            </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                    <ShoppingBag className="h-12 w-12 opacity-20" />
                    <p>Your cart is empty.</p>
                    <Button onClick={() => setIsCartOpen(false)}>Continue Shopping</Button>
                </div>
            ) : (
                items.map(item => (
                    <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4">
                        <div className="h-24 w-20 bg-muted rounded-md overflow-hidden shrink-0">
                            {item.image ? (
                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-secondary/30 text-xs">NO IMG</div>
                            )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-medium line-clamp-1">{item.name}</h3>
                                <p className="text-sm text-muted-foreground">{item.size} / {item.color}</p>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center border border-border rounded-md">
                                    <button 
                                        className="p-1 hover:bg-muted"
                                        onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                                    >
                                        <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                                    <button 
                                        className="p-1 hover:bg-muted"
                                        onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                                    <button 
                                        onClick={() => removeItem(item.productId, item.size, item.color)}
                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
            <div className="p-5 border-t border-border bg-muted/20 space-y-4">
                <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">Shipping & taxes calculated at checkout.</p>
                <Button className="w-full text-lg h-12 bg-linear-to-r from-primary to-accent hover:opacity-90 transition-opacity" asChild>
                    <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
                        Checkout
                    </Link>
                </Button>
            </div>
        )}
      </div>
    </div>
  )
}

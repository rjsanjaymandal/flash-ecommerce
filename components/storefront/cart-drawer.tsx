"use client";

import { useState } from "react";

import { useCartStore, selectCartTotal } from "@/store/use-cart-store";
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import FlashImage from "@/components/ui/flash-image";
import { cn, formatCurrency } from "@/lib/utils";
import { FreeShippingBar } from "@/components/cart/free-shipping-bar";
import { CartUpsell } from "@/components/cart/cart-upsell";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function CartDrawer() {
  const items = useCartStore((state) => state.items);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const cartTotal = useCartStore(selectCartTotal);
  const [loadingStates, setLoadingStates] =
    (useCartStore as any).loadingStates ||
    useState<Record<string, boolean>>({});

  const handleUpdateQuantity = async (
    productId: string,
    size: string,
    color: string,
    newQty: number
  ) => {
    const key = `${productId}-${size}-${color}`;
    setLoadingStates((prev: any) => ({ ...prev, [key]: true }));
    try {
      await updateQuantity(productId, size, color, newQty);
    } finally {
      setLoadingStates((prev: any) => ({ ...prev, [key]: false }));
    }
  };

  const hasOutOfStockItems = items.some(
    (i) => i.maxQuantity === 0 || i.quantity > i.maxQuantity
  );

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end isolate">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-md bg-background/95 backdrop-blur-xl shadow-2xl flex flex-col h-full border-l border-white/10"
      >
        {/* Header */}
        <div className="p-5 border-b border-border/50 bg-background/50 backdrop-blur-md z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 italic">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Your Bag{" "}
              <span className="text-sm not-italic font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                ({items.length})
              </span>
            </h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {items.length > 0 && <FreeShippingBar total={cartTotal} />}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-6 text-center p-8">
              <div className="h-24 w-24 bg-muted/30 rounded-full flex items-center justify-center mb-2">
                <ShoppingBag className="h-10 w-10 opacity-30" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">
                  Your bag is empty
                </h3>
                <p className="text-sm max-w-xs mx-auto">
                  Looks like you haven't added any gear to your loadout yet.
                </p>
              </div>
              <Button
                onClick={() => setIsCartOpen(false)}
                size="lg"
                className="rounded-full px-8 font-bold"
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100, height: 0 }}
                    className="flex gap-4 group"
                  >
                    <div className="h-28 w-24 bg-secondary/5 rounded-xl overflow-hidden shrink-0 border border-border/40 relative group/img">
                      {item.image ? (
                        <FlashImage
                          src={item.image}
                          alt={item.name}
                          width={96}
                          height={112}
                          quality={80}
                          sizes="96px"
                          className={cn(
                            "h-full w-full object-contain p-2 transition-all duration-500 group-hover/img:scale-105",
                            item.maxQuantity === 0 && "opacity-50 grayscale"
                          )}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-secondary/10 text-xs text-muted-foreground font-bold uppercase tracking-widest">
                          No Image
                        </div>
                      )}
                      {item.maxQuantity === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                          <span className="text-[10px] uppercase font-bold text-white bg-destructive px-2 py-1 rounded-full">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h3
                            className={cn(
                              "font-bold text-sm uppercase tracking-wide line-clamp-2 leading-tight",
                              item.maxQuantity === 0 &&
                                "text-muted-foreground line-through decoration-destructive"
                            )}
                          >
                            {item.name}
                          </h3>
                          <button
                            onClick={() =>
                              removeItem(item.productId, item.size, item.color)
                            }
                            className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">
                          {item.size} / {item.color}
                        </p>
                        {item.maxQuantity === 0 && (
                          <p className="text-[10px] text-destructive font-bold flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Item is out of
                            stock
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {item.maxQuantity > 0 ? (
                          <div className="flex items-center bg-muted/30 border border-border/50 rounded-lg h-8 relative overflow-hidden">
                            <button
                              className={cn(
                                "h-full px-2 rounded-l-lg transition-colors",
                                item.quantity === 1
                                  ? "hover:bg-destructive/10 hover:text-destructive"
                                  : "hover:bg-muted/50"
                              )}
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.productId,
                                  item.size,
                                  item.color,
                                  item.quantity - 1
                                )
                              }
                              disabled={
                                loadingStates[
                                  `${item.productId}-${item.size}-${item.color}`
                                ]
                              }
                            >
                              {item.quantity === 1 ? (
                                <Trash2 className="h-3 w-3" />
                              ) : (
                                <Minus className="h-3 w-3" />
                              )}
                            </button>
                            <div className="w-8 text-center text-xs font-bold relative">
                              {loadingStates[
                                `${item.productId}-${item.size}-${item.color}`
                              ] ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                  <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                              ) : (
                                item.quantity
                              )}
                            </div>
                            <button
                              className="h-full px-2 hover:bg-muted/50 rounded-r-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              disabled={
                                item.quantity >= item.maxQuantity ||
                                loadingStates[
                                  `${item.productId}-${item.size}-${item.color}`
                                ]
                              }
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.productId,
                                  item.size,
                                  item.color,
                                  item.quantity + 1
                                )
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 text-[10px] px-3 uppercase font-bold tracking-widest"
                            onClick={() =>
                              removeItem(item.productId, item.size, item.color)
                            }
                          >
                            Remove
                          </Button>
                        )}
                        <span
                          className={cn(
                            "font-mono text-sm font-bold",
                            item.maxQuantity === 0 &&
                              "text-muted-foreground line-through"
                          )}
                        >
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Upsells */}
              <CartUpsell />
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-border/50 bg-background/80 backdrop-blur-xl space-y-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-20">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-muted-foreground text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground text-sm">
                <span>Shipping</span>
                <span
                  className={
                    cartTotal >= 999
                      ? "text-emerald-500 font-bold"
                      : "text-foreground"
                  }
                >
                  {cartTotal >= 999 ? "Free" : formatCurrency(50)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xl font-black italic uppercase pt-2 border-t border-dashed border-border/50">
                <span>Total</span>
                <span>
                  {formatCurrency(cartTotal + (cartTotal >= 999 ? 0 : 50))}
                </span>
              </div>
            </div>

            <Button
              className={cn(
                "w-full h-14 text-base font-black uppercase tracking-widest rounded-xl transition-all shadow-lg group",
                hasOutOfStockItems
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-foreground text-background hover:bg-foreground/90 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              )}
              asChild={!hasOutOfStockItems}
              onClick={(e) => {
                if (hasOutOfStockItems) {
                  e.preventDefault();
                  const oosItems = items.filter(
                    (i) => i.maxQuantity === 0 || i.quantity > i.maxQuantity
                  );
                  oosItems.forEach((i) =>
                    removeItem(i.productId, i.size, i.color)
                  );
                  toast.success(`Removed ${oosItems.length} unavailable items`);
                } else {
                  setIsCartOpen(false);
                }
              }}
            >
              {hasOutOfStockItems ? (
                <span className="flex items-center gap-2">
                  Remove Sold Out Items
                </span>
              ) : (
                <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
                  <span className="flex items-center gap-2">
                    Checkout{" "}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              )}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

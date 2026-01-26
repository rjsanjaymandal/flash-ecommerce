"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/use-cart-store";
import { createClient } from "@/lib/supabase/client";

export function useCartStockSync() {
  const items = useCartStore((state) => state.items);
  const setItems = useCartStore((state) => state.setItems);
  const supabase = createClient();

  useEffect(() => {
    if (items.length === 0) return;

    // Build a filter for all product IDs in the cart
    const productIds = Array.from(new Set(items.map((i) => i.productId)));
    
    // Subscribe to stock changes for these products
    const channel = supabase.channel("cart-stock-sync");

    channel
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "product_stock",
          // Note: Real-time filters in Supabase can be tricky with large IN lists.
          // For a pro bag (usually < 15 items), we can listen to all and filter client-side 
          // or use a more specific filter if the payload is heavy.
        },
        (payload) => {
          const newItem = payload.new as any;
          if (productIds.includes(newItem.product_id)) {
            // Update the store's maxQuantity for this item
            setItems(
              useCartStore.getState().items.map((item) =>
                item.productId === newItem.product_id &&
                item.size === newItem.size &&
                item.color === newItem.color
                  ? { ...item, maxQuantity: newItem.quantity }
                  : item
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [items.length, supabase, setItems]);
}

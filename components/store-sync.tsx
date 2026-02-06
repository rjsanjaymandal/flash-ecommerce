"use client";

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import { useCartStore, CartItem } from "@/store/use-cart-store";
import { useWishlistStore, WishlistItem } from "@/store/use-wishlist-store";
import { useStockStore } from "@/store/use-stock-store";
import { toast } from "sonner";

interface CartDbItem {
  id: string;
  product_id: string;
  size: string;
  color: string;
  fit: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    main_image_url: string;
    category_id: string;
    slug: string;
  } | null;
}

interface WishlistDbItem {
  id: string;
  product_id: string;
  product: {
    name: string;
    price: number;
    main_image_url: string;
    slug: string;
  } | null;
}

export function StoreSync() {
  const { user } = useAuth();
  const supabase = createClient();

  // Cart Store Actions
  const setCartItems = useCartStore((state) => state.setItems);
  const cartItems = useCartStore((state) => state.items);
  const setIsLoading = useCartStore((state) => state.setIsLoading);

  // Wishlist Store Actions
  const setWishlistItems = useWishlistStore((state) => state.setItems);

  // Refs to track state
  const isSyncingRef = useRef(false);

  // Helper to validate stock
  const validateStock = useCallback(
    async (items: CartItem[]) => {
      if (items.length === 0) return;

      try {
        // Consolidated Query: Fetch stock and price in one go
        const { data: stocks } = await supabase
          .from("product_stock")
          .select(
            "product_id, size, color, fit, quantity, product:products(price)",
          )
          .in(
            "product_id",
            items.map((i) => i.productId),
          );

        if (!stocks) return;

        let changed = false;
        const changes: string[] = [];

        const newItems = items.map((item) => {
          const stockEntry = (stocks as any[]).find(
            (s) =>
              s.product_id === item.productId &&
              s.size === item.size &&
              s.color === item.color &&
              s.fit === item.fit,
          );
          const productEntry = stockEntry?.product;

          const available = stockEntry?.quantity ?? 0;
          let updatedItem = { ...item, maxQuantity: available };

          // 1. Stock Check
          if (item.quantity > available) {
            changed = true;
            if (available === 0) {
              changes.push(`Marked ${item.name} as Sold Out`);
              updatedItem = { ...updatedItem, maxQuantity: 0 };
            } else {
              changes.push(`Adjusted ${item.name} quantity to ${available}`);
              updatedItem = {
                ...updatedItem,
                quantity: available,
                maxQuantity: available,
              };
            }
          }

          // 2. Price Check
          if (productEntry && productEntry.price !== item.price) {
            changed = true;
            changes.push(
              `Price for ${item.name} updated to ${productEntry.price}`,
            );
            updatedItem = { ...updatedItem, price: productEntry.price };
          }

          return updatedItem;
        });

        if (changed) {
          if (changes.length > 0) {
            toast.info("Your bag was updated with latest prices and stock.");
          }
          setCartItems(newItems);

          if (user) {
            // Sync adjustments back to DB
            for (const updated of newItems) {
              await supabase.from("cart_items").upsert(
                {
                  user_id: user.id,
                  product_id: updated.productId,
                  size: updated.size,
                  color: updated.color,
                  fit: updated.fit,
                  quantity: updated.quantity,
                },
                { onConflict: "user_id, product_id, size, color, fit" },
              );
            }
          }
        }
      } catch (error) {
        console.error("[StoreSync] Stock validation failed:", error);
      }
    },
    [supabase, user, setCartItems],
  );

  // 1. Load Initial Data on Auth Change
  useEffect(() => {
    async function loadData() {
      if (isSyncingRef.current) return;

      isSyncingRef.current = true;
      setIsLoading(true);

      try {
        // 1. Hydrate from localStorage first (Crucial: Await these in Zustand 5+)
        await useCartStore.persist.rehydrate();
        await useWishlistStore.persist.rehydrate();

        // 2. Mark as hydrated so UI can render safely
        useCartStore.getState().setHasHydrated(true);

        if (user) {
          await useCartStore.getState().syncWithUser(user.id);
          const finalCart = useCartStore.getState().items;
          await validateStock(finalCart);

          // 2. Merge Guest Wishlist
          const localWishlist = useWishlistStore.getState().items;
          if (localWishlist.length > 0) {
            for (const item of localWishlist) {
              await supabase.from("wishlist_items").upsert(
                {
                  user_id: user.id,
                  product_id: item.productId,
                },
                { onConflict: "user_id, product_id", ignoreDuplicates: true },
              );
            }
          }

          // 3. Load Wishlist
          const { data: wishlistData, error: wishError } = await supabase
            .from("wishlist_items")
            .select(`*, product:products(name, price, slug, main_image_url)`)
            .eq("user_id", user.id);

          if (wishError) {
            console.error("[StoreSync] Wishlist fetch error:", wishError);
          } else if (wishlistData) {
            const mappedWishlist: WishlistItem[] = (
              wishlistData as unknown as WishlistDbItem[]
            ).map((d) => ({
              id: d.id,
              productId: d.product_id,
              name: d.product?.name || "Unknown",
              price: d.product?.price || 0,
              image: d.product?.main_image_url || null,
              slug: d.product?.slug || "#",
            }));
            setWishlistItems(mappedWishlist);
          }
        }
      } catch (error) {
        console.error("[StoreSync] Sync error:", error);
      } finally {
        setIsLoading(false);
        isSyncingRef.current = false;
      }
    }

    loadData();
  }, [
    user,
    setCartItems,
    setWishlistItems,
    setIsLoading,
    supabase,
    validateStock,
  ]);

  // 2. Real-time Stock Subscription
  useEffect(() => {
    const channel = supabase
      .channel("stock-changes-store")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "product_stock" },
        (payload) => {
          const { product_id, size, color, fit, quantity } = payload.new as any;

          // 1. Update Global Stock Store (UI will react immediately)
          useStockStore
            .getState()
            .updateStock(product_id, size, color, fit, quantity);

          // 2. Check Cart
          const currentItems = useCartStore.getState().items;
          const relevantItem = currentItems.find(
            (i) =>
              i.productId === product_id &&
              i.size === size &&
              i.color === color &&
              i.fit === fit,
          );

          if (relevantItem) {
            // If quantity reduced below what we have, adjust it
            if (relevantItem.quantity > quantity) {
              toast.error(`${relevantItem.name} stock updated.`);
              setCartItems(
                currentItems.map((i) => {
                  if (
                    i.productId === product_id &&
                    i.size === size &&
                    i.color === color &&
                    i.fit === fit
                  ) {
                    return {
                      ...i,
                      quantity: Math.min(i.quantity, quantity),
                      maxQuantity: quantity,
                    };
                  }
                  return i;
                }),
              );
            } else {
              // Just update maxQuantity silently
              setCartItems(
                currentItems.map((i) => {
                  if (
                    i.productId === product_id &&
                    i.size === size &&
                    i.color === color &&
                    i.fit === fit
                  ) {
                    return { ...i, maxQuantity: quantity };
                  }
                  return i;
                }),
              );
            }
          }
        },
      )
      .subscribe();

    // 3. Tab Focus Re-validation
    const handleFocus = () => {
      const currentItems = useCartStore.getState().items;
      if (currentItems.length > 0) validateStock(currentItems);
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", handleFocus);
    };
  }, [setCartItems, user, supabase, validateStock]);

  return null;
}

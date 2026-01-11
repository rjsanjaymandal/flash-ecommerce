"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./auth-context";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export interface CartItem {
  id?: string; // UUID for DB items
  productId: string;
  name: string;
  price: number;
  image: string | null;
  size: string;
  color: string;
  quantity: number;
  maxQuantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (productId: string, size: string, color: string) => Promise<void>;
  updateQuantity: (
    productId: string,
    size: string,
    color: string,
    quantity: number
  ) => Promise<void>;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [supabase] = useState(() => createClient());
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial cart
  useEffect(() => {
    async function loadCart() {
      setIsLoading(true);
      if (user) {
        // Load from DB
        const { data, error } = await supabase
          .from("cart_items")
          .select(
            `
            *,
            product:products (
              name,
              price,
              main_image_url
            )
          `
          )
          .eq("user_id", user.id);

        if (data && !error) {
          const mappedItems: CartItem[] = data.map((d: any) => ({
            id: d.id,
            productId: d.product_id,
            name: d.product.name,
            price: d.product.price,
            image: d.product.main_image_url,
            size: d.size,
            color: d.color,
            quantity: d.quantity,
            maxQuantity: 10, // This should ideally come from stock, checked later
          }));
          setItems(mappedItems);

          // Validate stock after loading
          // Stock validation is now handled by StoreSync
          // validateStock(mappedItems)
        }
      } else {
        // Load from LocalStorage
        const saved = localStorage.getItem("flash-cart");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setItems(parsed);
          } catch (e) {
            console.error("Failed to parse cart", e);
          }
        }
      }
      setIsLoading(false);
    }

    loadCart();
  }, [user, supabase]);

  // Save to LocalStorage (only for guests)
  useEffect(() => {
    if (!user && !isLoading) {
      localStorage.setItem("flash-cart", JSON.stringify(items));
    }
  }, [items, user, isLoading]);

  // Validation and subscriptions are now handled by StoreSync to avoid duplication
  // We only keep basic state loading here if needed, but really CartProvider should just expose the Context

  const addItem = useCallback(
    async (item: CartItem) => {
      // Optimistic Update
      const newItems = [...items];
      const existingIndex = newItems.findIndex(
        (i) =>
          i.productId === item.productId &&
          i.size === item.size &&
          i.color === item.color
      );

      if (existingIndex > -1) {
        newItems[existingIndex].quantity = Math.min(
          newItems[existingIndex].quantity + item.quantity,
          newItems[existingIndex].maxQuantity || 10
        );
      } else {
        newItems.push(item);
      }
      setItems(newItems);
      setIsCartOpen(true);
      toast.success("Added to cart");

      if (user) {
        // Sync to DB
        // Check if exists in DB first to update or insert
        // Actually best to try upsert logic or separate generic sync
        const dbItem = {
          user_id: user.id,
          product_id: item.productId,
          size: item.size,
          color: item.color,
          quantity:
            newItems[existingIndex > -1 ? existingIndex : newItems.length - 1]
              .quantity,
        };

        // We use upsert based on the unique constraint we added (user_id, product_id, size, color)
        const { error } = await supabase
          .from("cart_items")
          .upsert(dbItem, { onConflict: "user_id, product_id, size, color" });

        if (error) {
          console.error("Failed to sync cart item", error);
          toast.error("Failed to save cart remotely");
        }
      }
    },
    [items, user, supabase]
  );

  const removeItem = useCallback(
    async (productId: string, size: string, color: string) => {
      setItems((current) =>
        current.filter(
          (i) =>
            !(i.productId === productId && i.size === size && i.color === color)
        )
      );

      if (user) {
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .match({ user_id: user.id, product_id: productId, size, color });

        if (error) console.error("Error deleting remote item", error);
      }
    },
    [user, supabase]
  );

  const updateQuantity = useCallback(
    async (
      productId: string,
      size: string,
      color: string,
      quantity: number
    ) => {
      setItems((current) =>
        current.map((i) =>
          i.productId === productId && i.size === size && i.color === color
            ? { ...i, quantity }
            : i
        )
      );

      if (user) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity })
          .match({ user_id: user.id, product_id: productId, size, color });

        if (error) console.error("Error updating remote quantity", error);
      }
    },
    [user, supabase]
  );

  const clearCart = useCallback(async () => {
    setItems([]);
    if (user) {
      await supabase.from("cart_items").delete().eq("user_id", user.id);
    } else {
      localStorage.removeItem("flash-cart");
    }
  }, [user, supabase]);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
      isCartOpen,
      setIsCartOpen,
      isLoading,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
      isCartOpen,
      isLoading,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined)
    throw new Error("useCart must be used within CartProvider");
  return context;
};

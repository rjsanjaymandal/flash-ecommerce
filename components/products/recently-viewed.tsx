"use client";

import { useEffect, useState, useRef } from "react";
import { useRecentStore } from "@/lib/store/use-recent-store";
import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
import { Trash2, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function RecentlyViewed({ currentProduct }: { currentProduct?: any }) {
  // State for validated items
  const [validatedItems, setValidatedItems] = useState<any[]>([]);
  // Store access
  const { items, addItem, setItems, clear } = useRecentStore();
  const [mounted, setMounted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Add current product to store on mount/change
  useEffect(() => {
    if (currentProduct) {
      addItem({
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        image: currentProduct.main_image_url,
        slug: currentProduct.slug || currentProduct.id,
        category_id: currentProduct.category_id,
        product_stock: currentProduct.product_stock,
        // Add minimal required fields for ProductCard if needed, though ProductCard takes a full Product object.
        // We might need to map or ensure the store has enough info, or fetch full details.
        // For now, let's assume ProductCard can handle a partial object or we map it correctly.
        // Actually, ProductCard expects a 'Product' type. storing full product in local storage might be heavy.
        // But passing basic props is usually fine if ProductCard handles it.
        // Let's check ProductCard props. It takes `product`.
        // We'll store enough to render.
        ...currentProduct,
      });
    }
  }, [currentProduct, addItem]);

  // Validate items against DB (Self-Healing)
  useEffect(() => {
    // Only run if mounted and we have items
    if (!mounted || items.length === 0) return;

    const validate = async () => {
      // Optimization: Time-based Cache (15 minutes)
      // If we validated less than 15 mins ago, skip server call.
      // 15 mins = 15 * 60 * 1000 = 900,000 ms
      const CACHE_DURATION = 15 * 60 * 1000;
      const now = Date.now();
      const { lastValidated, setLastValidated } = useRecentStore.getState(); // Access fresh state

      if (lastValidated && now - lastValidated < CACHE_DURATION) {
        // Cache is valid, rely on local store
        setValidatedItems(items);
        return;
      }

      try {
        // Import dynamically to avoid server action issues in client initially?
        // No, standard import is fine for server actions.
        const { getValidProducts } =
          await import("@/lib/services/product-service");

        // Get all IDs from store
        const ids = items.map((i) => i.id);

        // Fetch valid ones
        const validProducts = await getValidProducts(ids);

        // If count mismatch, it means some were deleted/inactive
        // We update the store with ONLY the valid ones (preserving order is tricky, getValidProducts validation order?)
        // getValidProducts uses .in() which doesn't guarantee order.
        // We should re-sort validProducts based on original 'items' order.

        const validMap = new Map(validProducts.map((p) => [p.id, p]));

        const orderedValidItems = items
          .filter((i) => validMap.has(i.id))
          .map((i) => {
            const fresh = validMap.get(i.id);
            return { ...i, ...fresh }; // Merge to keep store props but update fresh data (price/stock)
          });

        setValidatedItems(orderedValidItems);

        // Update Timestamp
        setLastValidated(now);

        // Self-Heal: Update store if length changed or data refreshed
        // We technically should always update to save fresh prices etc, but 'setItems' might trigger re-render loops if not careful?
        // zustand persist handles it.
        // Let's only 'setItems' if content actually changed (length) OR deep compare?
        // For "Recently Viewed", just removing deleted is enough. Updating price is a bonus.
        // Let's safe update if length differs.
        if (orderedValidItems.length !== items.length) {
          console.log("Sanitizing Recently Viewed: Removed invalid items.");
          setItems(orderedValidItems);
        }
      } catch (err) {
        console.error("Failed to validate recently viewed:", err);
        // Fallback: show what we have in store, or nothing?
        // Better to show nothing if validation fails to avoid glitches?
        // Or show store items? Let's show store items as fallback to avoid empty section on network error.
        setValidatedItems(items);
      }
    };

    validate();
  }, [mounted, items.length, setItems]); // Re-run if length changes (add/remove)

  if (!mounted || items.length === 0) return null;

  // Filter out current product from display list (using validated items)
  // If validation hasn't run yet, validatedItems is empty?
  // We can show 'items' while validating? Or wait?
  // Showing 'items' might flash deleted content.
  // Let's wait for validation (validatedItems has content or we handle loading state).
  // Actually, on first load validatedItems is empty.

  const listToUse = validatedItems.length > 0 ? validatedItems : []; // Don't show anything until validated to be safe against deleted?
  // Or show items locally and then update?
  // User requested: "recently viewed shwos the deleted products" -> so we MUST validate before showing.

  const displayItems = listToUse.filter((i) => i.id !== currentProduct?.id);

  if (displayItems.length === 0) return null;

  return (
    <section className="py-16 md:py-24 border-t border-border/40 relative overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-1">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl font-black uppercase tracking-tighter italic flex items-center gap-3"
            >
              <History className="w-6 h-6 text-muted-foreground" />
              Recently{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-600">
                Scouted
              </span>
            </motion.h2>
            <p className="text-sm text-muted-foreground font-medium pl-9">
              Retrace your steps through the collection
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors gap-2 text-xs uppercase font-bold tracking-wider"
          >
            <Trash2 className="w-4 h-4" />
            Clear History
          </Button>
        </div>

        <div className="relative">
          <ScrollArea className="w-full whitespace-nowrap rounded-3xl pb-4">
            <div className="flex gap-4 md:gap-6 pb-4" ref={scrollContainerRef}>
              <AnimatePresence mode="popLayout">
                {displayItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                      transition: { duration: 0.2 },
                    }}
                    transition={{ delay: index * 0.05 }}
                    className="w-[280px] md:w-[320px] shrink-0"
                  >
                    <ProductCard
                      product={
                        {
                          ...item,
                          // Compatibility: Store has 'image', ProductCard expects 'main_image_url' or 'images'
                          main_image_url:
                            item.image || (item as any).main_image_url,
                        } as any
                      }
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>

          {/* Gradient Fade Edges */}
          <div className="absolute top-0 left-0 bottom-0 w-8 md:w-20 bg-linear-to-r from-background to-transparent pointer-events-none z-10" />
          <div className="absolute top-0 right-0 bottom-0 w-8 md:w-20 bg-linear-to-l from-background to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </section>
  );
}

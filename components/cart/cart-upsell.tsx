"use client";

import { useQuery } from "@tanstack/react-query";
import { getUpsellProducts } from "@/app/actions/cart-upsell";
import { useCartStore } from "@/store/use-cart-store";
import { Loader2, Plus, X } from "lucide-react";
import FlashImage from "@/components/ui/flash-image";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useMemo, useState } from "react";

export function CartUpsell() {
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  // Extract unique category IDs from cart items to pass to upsell engine
  const categoryIds = Array.from(
    new Set(cartItems.map((i) => i.categoryId).filter(Boolean)),
  ) as string[];

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["cart-upsell", categoryIds.join(",")],
    queryFn: async () => {
      const results = await getUpsellProducts(
        categoryIds,
        cartItems.map((i) => i.productId),
      );
      // Shuffle here to keep render pure
      return results.sort(() => Math.random() - 0.5);
    },
    staleTime: 1000 * 60 * 5,
  });

  // Filter out items already in cart
  const upsellItems = useMemo(() => {
    return products.filter(
      (p) => !cartItems.some((ci) => ci.productId === p.id),
    );
  }, [products, cartItems]);

  const onAddVariant = (product: any, variant: any) => {
    addItem({
      productId: product.id,
      categoryId: product.category_id,
      name: product.name,
      price: product.price,
      image: product.main_image_url,
      quantity: 1,
      size: variant.size,
      color: variant.color,
      fit: variant.fit || "Regular",
      maxQuantity: variant.quantity,
      slug: product.slug,
    });

    toast.success(`Added ${product.name} (${variant.size}) to bag`);
    setActiveProductId(null);
  };

  if (isLoading)
    return (
      <div className="py-4 text-center text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
      </div>
    );
  if (upsellItems.length === 0) return null;

  return (
    <div className="space-y-3 py-4 border-t border-dashed border-border/50">
      <h3 className="text-xs font-black uppercase tracking-widest px-1 text-muted-foreground">
        Don&apos;t Miss Out
      </h3>

      <div className="flex gap-3 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide snap-x">
        {upsellItems.slice(0, 6).map((product) => {
          const inStockVariants = (product.product_stock || []).filter(
            (v: any) => v.quantity > 0,
          );
          const isSelecting = activeProductId === product.id;

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="snap-start shrink-0 w-32 group relative"
            >
              <div className="aspect-3/4 bg-muted/20 rounded-lg overflow-hidden border border-border/40 relative mb-2 group/img">
                {product.main_image_url ? (
                  <FlashImage
                    src={product.main_image_url}
                    alt={product.name}
                    fill
                    quality={80}
                    resizeMode="contain"
                    className={cn(
                      "object-contain p-2 transition-all duration-500",
                      isSelecting && "scale-90 opacity-20 blur-[2px]",
                    )}
                    sizes="128px"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-secondary/10 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    No Image
                  </div>
                )}

                {/* Size Picker Overlay */}
                <AnimatePresence>
                  {isSelecting && (
                    <motion.div
                      key="picker"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute inset-0 z-10 p-2 flex flex-col justify-end gap-1 bg-linear-to-t from-background via-background/40 to-transparent"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveProductId(null);
                        }}
                        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <p className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground px-1 mb-1">
                        Select Size
                      </p>
                      <div className="grid grid-cols-2 gap-1 overflow-y-auto max-h-[70%]">
                        {inStockVariants.map((v: any) => (
                          <button
                            key={`${v.size}-${v.color}-${v.fit}`}
                            onClick={() => onAddVariant(product, v)}
                            className="h-7 text-[9px] font-black uppercase rounded bg-foreground text-background hover:bg-primary hover:text-white transition-colors border border-foreground/10"
                          >
                            {v.size}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Default Trigger */}
                {!isSelecting && (
                  <button
                    onClick={() => {
                      setActiveProductId(product.id);
                    }}
                    className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-white text-black shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 z-20"
                    title="Quick Add"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-[10px] font-bold uppercase truncate pr-2 leading-tight">
                  {product.name}
                </h4>
                <p className="text-[10px] text-muted-foreground font-mono">
                  {formatCurrency(product.price)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

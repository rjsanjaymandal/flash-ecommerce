"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/use-cart-store";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";
import { useRealTimeHype } from "@/hooks/use-real-time-stock";
import { Check, ShoppingBag } from "lucide-react";

interface QuickAddDialogProps {
  product: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buyNowMode?: boolean;
}

import { useRouter } from "next/navigation";

export function QuickAddDialog({
  product,
  open,
  onOpenChange,
  buyNowMode = false,
}: QuickAddDialogProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const { stock } = useRealTimeHype(product.id, product.product_stock || []);

  // Determine available sizes based on real-time stock
  const availableSizes = Array.from(
    new Set(stock.filter((s: any) => s.quantity > 0).map((s: any) => s.size)),
  );
  const allSizes =
    product.size_options && product.size_options.length > 0
      ? product.size_options
      : ["XS", "S", "M", "L", "XL", "XXL"];

  // Enterprise Initial State
  const initialStockItem = useMemo(() => {
    return (product.product_stock || []).find((s: any) => s.quantity > 0);
  }, [product.product_stock]);

  const hasSingleDefaultSize =
    allSizes.length === 1 &&
    (allSizes[0] === "Standard" || allSizes[0] === "One Size");
  const [selectedSize, setSelectedSize] = useState<string>(
    initialStockItem?.size || (allSizes.length > 0 ? allSizes[0] : ""),
  );

  // Update color when size changes if current color is invalid for new size
  const availableColorsForSize = Array.from(
    new Set(
      stock
        .filter(
          (s: any) =>
            (!selectedSize || s.size === selectedSize) && s.quantity > 0,
        )
        .map((s: any) => s.color),
    ),
  );

  // State for color and fit
  const [selectedColor, setSelectedColor] = useState<string>(
    initialStockItem?.color && initialStockItem.color !== "Standard"
      ? initialStockItem.color
      : product.color_options?.length > 0 &&
          product.color_options[0] !== "Standard"
        ? product.color_options[0]
        : "",
  );

  const availableFitsForSelection = Array.from(
    new Set([
      ...(product.fit_options || []),
      ...stock
        .filter(
          (s: any) =>
            (!selectedSize || s.size === selectedSize) &&
            (!selectedColor || s.color === selectedColor) &&
            s.quantity > 0,
        )
        .map((s: any) => s.fit),
    ]),
  ).filter((fit): fit is string => Boolean(fit));

  const [selectedFit, setSelectedFit] = useState<string>(
    initialStockItem?.fit || product.fit_options?.[0] || "",
  );

  // Auto-Select Logic: Context-Aware Selection
  useEffect(() => {
    // 1. Auto-Select Size
    const validSizes = allSizes.filter((s: string) => {
      if (selectedColor && selectedFit) {
        return stock.some(
          (item: any) =>
            item.size === s &&
            item.color === selectedColor &&
            item.fit === selectedFit &&
            item.quantity > 0,
        );
      }
      return true;
    });

    // 1. Auto-Select or Correct Size
    if (
      !selectedSize ||
      (selectedSize &&
        !validSizes.includes(selectedSize) &&
        validSizes.length > 0)
    ) {
      if (validSizes.length > 0) {
        setSelectedSize(validSizes[0]);
      } else if (allSizes.length > 0 && !selectedSize) {
        setSelectedSize(allSizes[0]); // Global fallback
      }
    }

    // 2. Auto-Select or Correct Color
    const allColorsList = Array.from(
      new Set([...(product.color_options || []), ...availableColorsForSize]),
    );

    const validColors = allColorsList.filter((c: string) => {
      if (selectedSize && selectedFit) {
        return stock.some(
          (item: any) =>
            item.size === selectedSize &&
            item.color === c &&
            item.fit === selectedFit &&
            item.quantity > 0,
        );
      }
      return true;
    });

    if (
      !selectedColor ||
      (selectedColor &&
        !validColors.includes(selectedColor) &&
        validColors.length > 0)
    ) {
      if (validColors.length > 0) {
        setSelectedColor(validColors[0]);
      } else if (allColorsList.length > 0 && !selectedColor) {
        setSelectedColor(allColorsList[0]); // Global fallback
      }
    }

    // 3. Auto-Select or Correct Fit
    const validFits = availableFitsForSelection.filter((f: string) => {
      if (selectedSize && selectedColor) {
        return stock.some(
          (item: any) =>
            item.size === selectedSize &&
            item.color === selectedColor &&
            item.fit === f &&
            item.quantity > 0,
        );
      }
      return true;
    });

    if (
      !selectedFit ||
      (selectedFit && !validFits.includes(selectedFit) && validFits.length > 0)
    ) {
      if (validFits.length > 0) {
        setSelectedFit(validFits[0]);
      } else if (availableFitsForSelection.length > 0 && !selectedFit) {
        setSelectedFit(availableFitsForSelection[0]); // Global fallback
      }
    }
  }, [
    allSizes,
    product.color_options,
    availableColorsForSize,
    availableFitsForSelection,
    selectedSize,
    selectedColor,
    selectedFit,
  ]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    // Use selected color or fallback if not selected (should enforce selection for multi-color)
    const finalColor = selectedColor || availableColorsForSize[0] || "Standard";

    if (!finalColor && product.color_options?.length > 1) {
      toast.error("Please select a color");
      return;
    }

    const finalFit = selectedFit || availableFitsForSelection[0] || "Regular";

    const stockItem = stock.find(
      (item: any) =>
        item.size === selectedSize &&
        item.color === finalColor &&
        item.fit === finalFit,
    );
    const maxQuantity = stockItem?.quantity || 0;

    if (maxQuantity === 0) {
      toast.error("Selected option is out of stock");
      return;
    }

    addItem(
      {
        productId: product.id,
        categoryId: product.category_id || "",
        name: product.name,
        price: product.price,
        image: product.main_image_url,
        size: selectedSize,
        color: finalColor,
        fit: finalFit,
        quantity: 1,
        maxQuantity: maxQuantity,
        slug: product.slug || "",
      },
      { openCart: !buyNowMode, showToast: !buyNowMode },
    );

    if (buyNowMode) {
      router.push("/checkout");
    } else {
      onOpenChange(false);
    }

    setSelectedSize("");
    setSelectedColor("");
    setSelectedFit("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[425px] rounded-[1.5rem] sm:rounded-[2rem] p-6 gap-6">
        <DialogHeader className="space-y-4">
          <DialogTitle className="flex flex-col gap-2">
            <span className="text-xl font-black uppercase italic tracking-tight leading-none">
              {product.name}
            </span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(product.price)}
            </span>
          </DialogTitle>
          <DialogDescription className="text-base font-medium text-muted-foreground">
            Select your preferred configuration.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Size Selection */}
          {!hasSingleDefaultSize && (
            <div className="space-y-3">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Select Size
              </div>
              <div className="grid grid-cols-3 gap-3">
                {allSizes.map((size: string) => {
                  const isAvailable = stock.some(
                    (s: any) => s.size === size && s.quantity > 0,
                  );
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      disabled={!isAvailable}
                      onClick={() => {
                        setSelectedSize(size);
                        setSelectedColor(""); // Reset color on size change
                        setSelectedFit(""); // Reset fit on size change
                      }}
                      className={cn(
                        "h-14 rounded-xl border-2 text-sm font-bold transition-all relative overflow-hidden active:scale-95",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]"
                          : "border-input hover:bg-muted/50 text-foreground hover:border-foreground/20",
                        !isAvailable &&
                          "opacity-40 cursor-not-allowed bg-muted/20 border-transparent",
                      )}
                    >
                      {size}
                      {!isAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-current -rotate-45 opacity-50" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Color Selection (Only if colors exist and vary, or if non-standard) */}
          {(product.color_options?.length > 0 ||
            availableColorsForSize.length > 0) &&
            !(
              (product.color_options?.length === 1 &&
                product.color_options[0] === "Standard") ||
              (availableColorsForSize.length === 1 &&
                availableColorsForSize[0] === "Standard")
            ) && (
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                  Select Color
                </div>
                <div className="flex flex-wrap gap-3">
                  {Array.from(
                    new Set([
                      ...(product.color_options || []),
                      ...availableColorsForSize,
                    ]),
                  ).map((color: string) => {
                    // Check if this color is valid for the selected size (if size selected)
                    // If no size selected, check if color exists in ANY stock
                    const isValidForSize =
                      (!selectedSize ||
                        stock.some(
                          (s: any) =>
                            s.size === selectedSize &&
                            s.color === color &&
                            s.quantity > 0,
                        )) &&
                      color !== "Standard";
                    const isSelected = selectedColor === color;

                    if (color === "Standard") return null;

                    return (
                      <button
                        key={color}
                        disabled={!isValidForSize}
                        onClick={() => {
                          setSelectedColor(color);
                          setSelectedFit(""); // Reset fit on color change
                        }}
                        className={cn(
                          "h-10 px-4 min-w-[3rem] rounded-lg border-2 text-sm font-bold transition-all relative active:scale-95",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-md scale-105"
                            : "border-input hover:bg-muted/50",
                          !isValidForSize && "opacity-40 cursor-not-allowed",
                        )}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          {/* Fit Selection (Only if multiple fits exist, or non-regular single fit) */}
          {availableFitsForSelection.length > 0 &&
            !(
              availableFitsForSelection.length === 1 &&
              (availableFitsForSelection[0] || "").toLowerCase() === "regular"
            ) && (
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                  Select Fit
                </div>
                <div className="flex flex-wrap gap-3">
                  {availableFitsForSelection.map((fit: string) => {
                    const isSelected = selectedFit === fit;
                    return (
                      <button
                        key={fit}
                        onClick={() => setSelectedFit(fit)}
                        className={cn(
                          "h-10 px-4 min-w-[3rem] rounded-lg border-2 text-sm font-bold transition-all relative active:scale-95",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-md scale-105"
                            : "border-input hover:bg-muted/50",
                        )}
                      >
                        {fit}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          <Button
            size="lg"
            className="w-full h-14 text-base rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            onClick={handleAddToCart}
            disabled={
              !selectedSize ||
              (product.color_options?.length > 1 &&
                !selectedColor &&
                availableColorsForSize.length > 1) ||
              (availableFitsForSelection.length > 1 && !selectedFit)
            }
          >
            {buyNowMode ? "Proceed to Checkout" : "Add to Cart"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";
import { toast } from "sonner";
import Link from "next/link";
import FlashImage from "@/components/ui/flash-image";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/services/product-service";

// Can accept a subset of product data
interface QuickViewProps {
  product: Product;
}

export function QuickView({ product }: QuickViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [selectedSize, setSelectedSize] = useState(
    product.size_options?.[0] || "M",
  );
  const [selectedFit, setSelectedFit] = useState(
    product.fit_options?.[0] || "Regular",
  );
  const [selectedColor, setSelectedColor] = useState(
    product.color_options?.[0] || "Classic",
  );

  const handleAddToCart = () => {
    const stockItem = product.product_stock?.find(
      (item: any) => item.size === selectedSize && item.fit === selectedFit,
    );
    const maxQuantity = stockItem?.quantity || 10; // Fallback if stock not found, though it should be

    addItem({
      productId: product.id,
      categoryId: product.category_id || "",
      name: product.name,
      price: product.price,
      image: product.main_image_url,
      size: selectedSize,
      color: selectedColor,
      fit: selectedFit,
      quantity: 1,
      maxQuantity: maxQuantity,
      slug: product.slug || "",
    });
    toast.success("Added to Cart");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full bg-white/90 hover:bg-white text-black shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0"
          onClick={(e) => e.stopPropagation()} // Prevent navigation to slug
          suppressHydrationWarning
        >
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-white">
        <DialogTitle className="sr-only">
          Product Quick View: {product.name}
        </DialogTitle>
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative h-[300px] md:h-[500px] bg-gray-100">
            <FlashImage
              src={product.main_image_url || "/placeholder.jpg"}
              alt={product.name}
              fill
              resizeMode="contain"
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
          <div className="p-8 flex flex-col justify-center space-y-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-2">
                New Arrival
              </p>
              <h2 className="text-2xl font-black tracking-tight mb-2">
                {product.name}
              </h2>
              <p className="text-xl font-medium text-primary">
                {formatCurrency(product.price)}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.size_options?.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-10 w-10 rounded-lg border text-sm font-medium transition-all ${
                        selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input hover:bg-muted"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {product.fit_options &&
                (product.fit_options.length > 1 ||
                  (product.fit_options.length === 1 &&
                    product.fit_options[0].toLowerCase() !== "regular")) && (
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">
                      Fit
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(product.fit_options || []).map((fit: string) => {
                        if (
                          product.fit_options &&
                          product.fit_options.length === 1 &&
                          fit.toLowerCase() === "regular"
                        )
                          return null;
                        return (
                          <button
                            key={fit}
                            onClick={() => setSelectedFit(fit)}
                            className={`h-10 px-4 rounded-lg border text-sm font-medium transition-all ${
                              selectedFit === fit
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-input hover:bg-muted"
                            }`}
                          >
                            {fit}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 rounded-xl text-sm font-black uppercase tracking-widest h-12"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 rounded-xl text-sm font-black uppercase tracking-widest h-12"
                  asChild
                >
                  <Link href={`/product/${product.slug || product.id}`}>
                    Details
                  </Link>
                </Button>
              </div>
              <Button
                size="lg"
                className="w-full rounded-xl text-sm font-black uppercase tracking-widest h-12 gradient-primary shadow-lg shadow-primary/20"
                onClick={async () => {
                  const stockItem = product.product_stock?.find(
                    (item: any) =>
                      item.size === selectedSize && item.fit === selectedFit,
                  );
                  const maxQuantity = stockItem?.quantity || 10;
                  await addItem(
                    {
                      productId: product.id,
                      categoryId: product.category_id || "",
                      name: product.name,
                      price: product.price,
                      image: product.main_image_url,
                      size: selectedSize,
                      color: selectedColor,
                      fit: selectedFit,
                      quantity: 1,
                      maxQuantity: maxQuantity,
                      slug: product.slug || "",
                    },
                    { openCart: false, showToast: false },
                  );
                  setIsOpen(false);
                  router.push("/checkout");
                }}
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

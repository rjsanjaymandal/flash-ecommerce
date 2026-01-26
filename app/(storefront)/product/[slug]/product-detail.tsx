"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/use-cart-store";
import {
  useWishlistStore,
  selectIsInWishlist,
} from "@/store/use-wishlist-store";
import { cn, formatCurrency, calculateDiscount } from "@/lib/utils";
import { Star, Plus, Heart, Clock } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { togglePreorder } from "@/app/actions/preorder";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductSelectors } from "@/components/products/product-selectors";
import { ProductDescriptionAccordion } from "@/components/products/product-description-accordion";
import dynamic from "next/dynamic";

const SizeGuideModal = dynamic(
  () =>
    import("@/components/products/size-guide-modal").then(
      (mod) => mod.SizeGuideModal,
    ),
  { ssr: false },
);
import { MobileStickyBar } from "@/components/storefront/mobile-sticky-bar";
import { FAQJsonLd } from "@/components/seo/faq-json-ld";
import { ShareButton } from "@/components/products/share-button";
import { motion } from "framer-motion";
import { RecommendedProducts } from "@/components/storefront/recommended-products";
import { useRealTimeHype, StockItem } from "@/hooks/use-real-time-stock";
import { useAuth } from "@/context/auth-context";
import { WaitlistDialog } from "@/components/products/waitlist-dialog";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Fallback Standards
const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

// Types
// type StockItem = { ... } // Replaced by import or compatible shape

type ProductDetailProps = {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    original_price?: number | null;
    main_image_url: string;
    gallery_image_urls?: string[];
    size_options: string[];
    color_options: string[];
    product_stock: StockItem[];
    category_id?: string;
    images?: {
      thumbnail: string;
      mobile: string;
      desktop: string;
    };
    slug?: string;
    categories?: {
      name: string;
    } | null;
  };
  initialReviews: {
    count: number;
    average: string;
  };
};

export function ProductDetailClient({
  product,
  initialReviews,
}: ProductDetailProps) {
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addItem);
  const addItem = useWishlistStore((state) => state.addItem);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const isWishlisted = useWishlistStore((state) =>
    selectIsInWishlist(state, product.id),
  );

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  // Waitlist State
  const [isOnWaitlist, setIsOnWaitlist] = useState(false);
  const [isLoadingWaitlist, setIsLoadingWaitlist] = useState(false);
  const [isWaitlistDialogOpen, setIsWaitlistDialogOpen] = useState(false);
  const [savedGuestEmail, _setSavedGuestEmail] = useState("");
  const [isUnjoinDialogOpen, setIsUnjoinDialogOpen] = useState(false);

  const [showStickyBar, _setShowStickyBar] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const { user } = useAuth();

  // Real-time Stock & Hype Check
  // Renamed hook usage
  const {
    stock: realTimeStock,
    loading: loadingStock,
    viewerCount,
  } = useRealTimeHype(product.id, product.product_stock);

  // Ref for the main action button to sticky bar intersection
  const mainActionRef = useRef<HTMLDivElement>(null);

  // Helper to get or create guest ID
  const getGuestId = useCallback(() => {
    if (typeof window === "undefined") return undefined;
    let id = localStorage.getItem("guest_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("guest_id", id);
    }
    return id;
  }, []);

  // Logic to determine what options to show
  const sizeOptions = useMemo(() => {
    const sizes = product.size_options?.length
      ? [...product.size_options]
      : realTimeStock?.length
        ? Array.from(new Set(realTimeStock.map((s) => s.size)))
        : [...STANDARD_SIZES];

    return sizes.sort((a, b) => {
      const indexA = STANDARD_SIZES.indexOf(a);
      const indexB = STANDARD_SIZES.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [product.size_options, realTimeStock, STANDARD_SIZES]);

  const discountPercent = useMemo(
    () => calculateDiscount(product.price, product.original_price),
    [product.price, product.original_price],
  );

  const colorOptions = product.color_options?.length
    ? product.color_options
    : (Array.from(
        new Set(realTimeStock?.map((s) => s.color) || ["Standard"]),
      ).sort() as string[]);

  // Stock Logic
  const stockMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (!realTimeStock) return map;
    realTimeStock.forEach((item) => {
      const key = `${item.size}-${item.color}`;
      map[key] = item.quantity;
    });
    return map;
  }, [realTimeStock]);

  const totalStock = useMemo(() => {
    return (
      realTimeStock?.reduce(
        (acc: number, item) => acc + (item.quantity || 0),
        0,
      ) ?? 0
    );
  }, [realTimeStock]);

  const getStock = (size: string, color: string) =>
    stockMap[`${size}-${color}`] || 0;
  const isAvailable = (size: string, color: string) =>
    (stockMap[`${size}-${color}`] || 0) > 0;
  const isSizeAvailable = (size: string) =>
    realTimeStock?.some((s) => s.size === size && s.quantity > 0);

  const maxQty = getStock(selectedSize, selectedColor);

  // Logic: OOS if Global stock is 0 OR if specific selection is 0
  const isGlobalOutOfStock = totalStock === 0 && !loadingStock;
  const isSelectionOutOfStock = maxQty === 0 && selectedSize && selectedColor;
  const isOutOfStock = isGlobalOutOfStock || isSelectionOutOfStock;

  // Handlers
  // Handlers
  const handlePreOrder = async () => {
    // OPTIMISTIC UI: If we think we are joined...
    if (isOnWaitlist) {
      // GUEST HANDLING: No optimistic toggle. Just remind them.
      if (!user) {
        toast.info("You are already on the waitlist! (Guest)");
        return;
      }

      // AUTH USER HANDLING: Ask for confirmation
      setIsUnjoinDialogOpen(true);
      return;
    }

    // If NOT joined, proceed to join flow
    setIsLoadingWaitlist(true);
    try {
      // Attempt 1: Try as logged in / existing session
      const result = await togglePreorder(product.id);

      if (
        result.error &&
        (result.error.includes("sign in") ||
          result.error.includes("identifying"))
      ) {
        // Not logged in -> Open Dialog
        setIsWaitlistDialogOpen(true);
      } else if (result.error) {
        toast.error(result.error);
      } else {
        // Logged in success
        setIsOnWaitlist(true);
        toast.success("Added to waitlist!");
        if (result.status === "added")
          localStorage.setItem(`waitlist_${product.id}`, "true");
      }
    } catch (_error) {
      toast.error("Something went wrong.");
    } finally {
      setIsLoadingWaitlist(false);
    }
  };

  const handleConfirmUnjoin = async () => {
    const previousState = true;
    setIsOnWaitlist(false); // Optimistic remove
    toast.success("Removed from waitlist.");

    try {
      const result = await togglePreorder(product.id);

      if (result.error) {
        setIsOnWaitlist(previousState); // Revert
        toast.dismiss();
        toast.error(result.error);
      } else {
        localStorage.removeItem(`waitlist_${product.id}`);
      }
    } catch (_error) {
      setIsOnWaitlist(previousState);
      toast.dismiss();
      toast.error("Something went wrong.");
    }
  };

  const handleWaitlistSubmit = async (email: string) => {
    setIsLoadingWaitlist(true);
    try {
      const guestId = getGuestId();
      const result = await togglePreorder(product.id, email, guestId);
      if (result.error) {
        toast.error(result.error);
      } else if (result.status === "already_joined") {
        setIsOnWaitlist(true);
        toast.info(result.message);
        localStorage.setItem(`waitlist_${product.id}`, "true");
        if (email) localStorage.setItem("user_email_preference", email);
      } else {
        setIsOnWaitlist(true);
        toast.success("You've been added to the waitlist!");
        localStorage.setItem(`waitlist_${product.id}`, "true");
        if (email) localStorage.setItem("user_email_preference", email);
      }
    } catch (_error) {
      toast.error("Failed to join waitlist.");
    } finally {
      setIsLoadingWaitlist(false);
    }
  };
  const handleAddToCart = async (
    options = { openCart: true, showToast: true },
  ) => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select a size and color");
      return false;
    }
    if (maxQty <= 0) {
      toast.error("Selected combination is out of stock");
      return false;
    }
    try {
      await addToCart(
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.main_image_url,
          size: selectedSize,
          color: selectedColor,
          quantity: quantity,
          maxQuantity: maxQty,
        },
        options,
      );
      return true;
    } catch (_err) {
      toast.error("Failed to add to bag");
      return false;
    }
  };

  // Prefetch checkout for speed
  useEffect(() => {
    router.prefetch("/checkout");
  }, [router]);

  const handleBuyNow = async () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select a size and color");
      return;
    }

    if (isOutOfStock) {
      toast.error("Item is out of stock");
      return;
    }

    // FIRE AND FORGET - Do not await DB sync
    // State updates synchronously in Zustand before the remote sync
    addToCart(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.main_image_url,
        size: selectedSize,
        color: selectedColor,
        quantity: quantity,
        maxQuantity: maxQty,
      },
      { openCart: false, showToast: false },
    );

    router.push("/checkout");
  };

  // FAQ Data
  const faqData = [
    {
      question: "What material is this?",
      answer: "Premium Fabric Blend designed for comfort and durability.",
    },
    {
      question: "How is the fit?",
      answer: "Relaxed, gender-neutral fit. True to size.",
    },
    {
      question: "Shipping policy?",
      answer:
        "Free global shipping on orders over ₹2000. Processed in 24 hours.",
    },
    {
      question: "Return policy?",
      answer: "Returns accepted within 14 days of delivery.",
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-6 pb-20">
      <FAQJsonLd questions={faqData} />
      <MobileStickyBar
        isVisible={showStickyBar}
        price={formatCurrency(product.price)}
        isOutOfStock={Boolean(isOutOfStock)}
        isOnWaitlist={isOnWaitlist}
        disabled={
          isOutOfStock ? isLoadingWaitlist : !selectedSize || !selectedColor
        }
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onPreOrder={handlePreOrder}
      />

      <div className="container mx-auto px-4 lg:px-8">
        {/* Refined Breadcrumbs */}
        <nav className="flex items-center text-xs lg:text-sm text-muted-foreground mb-8 lg:mb-12 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
          <Link
            href="/"
            className="hover:text-primary transition-colors shrink-0"
          >
            Home
          </Link>
          <span className="mx-2 text-muted-foreground/40">/</span>
          <Link
            href="/shop"
            className="hover:text-primary transition-colors shrink-0"
          >
            Shop
          </Link>

          {product.categories?.name && (
            <>
              <span className="mx-2 text-muted-foreground/40">/</span>
              <Link
                href={`/shop?category=${product.category_id}`}
                className="hover:text-primary transition-colors shrink-0 font-medium text-foreground/80"
              >
                {product.categories.name}
              </Link>
            </>
          )}

          <span className="mx-2 text-muted-foreground/40">/</span>
          <span className="font-bold text-foreground truncate max-w-[120px] sm:max-w-xs md:max-w-md">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
          {/* LEFT: Gallery (Takes 7 cols) */}
          <div className="lg:col-span-7">
            <ProductGallery
              images={product.gallery_image_urls || []}
              name={product.name}
              mainImage={product.images?.desktop || product.main_image_url}
            />
          </div>

          {/* RIGHT: Product Info (Takes 5 cols) */}
          <div className="lg:col-span-5 flex flex-col h-full pt-2 lg:sticky lg:top-24 self-start">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card/50 backdrop-blur-sm rounded-none lg:p-0"
            >
              {/* Title & Price */}
              <div className="border-b border-border/60 pb-8 mb-8">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground uppercase leading-[0.9] max-w-[85%]">
                    <span className="text-gradient">{product.name}</span>
                  </h1>
                  <ShareButton title={product.name} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-3xl font-black tracking-tighter text-foreground">
                      {formatCurrency(product.price)}
                    </p>
                    {discountPercent && (
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-lg text-muted-foreground line-through decoration-red-500/30 decoration-2 font-medium">
                          {formatCurrency(product.original_price)}
                        </p>
                        <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                          Save {discountPercent}%
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">
                      Inclusive of all taxes
                    </p>
                  </div>

                  {initialReviews.count > 0 && (
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5 text-amber-400">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-black text-lg text-foreground">
                          {initialReviews.average}
                        </span>
                      </div>
                      <Link
                        href="#reviews"
                        className="text-[10px] bg-muted px-2 py-1 rounded-full font-bold uppercase tracking-widest text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {initialReviews.count} Reviews
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Selectors */}
              <ProductSelectors
                sizeOptions={sizeOptions}
                colorOptions={colorOptions}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                onSelectSize={(s) => {
                  setSelectedSize(s);
                  setQuantity(1);
                  setSelectedColor("");
                }}
                onSelectColor={(c) => {
                  setSelectedColor(c);
                  setQuantity(1);
                }}
                onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
                isAvailable={isAvailable}
                isSizeAvailable={isSizeAvailable}
                getStock={getStock}
              />

              {/* Hype Badge: Live Viewers */}
              {viewerCount > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mb-4 text-xs font-bold text-red-500 animate-pulse"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  {viewerCount} people are looking at this right now
                </motion.div>
              )}

              {/* Low Stock Warning */}
              {maxQty > 0 && maxQty < 5 && selectedSize && selectedColor && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3"
                >
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-500">
                    Hurry! Only {maxQty} left in this size.
                  </p>
                </motion.div>
              )}

              {/* Actions */}
              <div className="space-y-6" ref={mainActionRef}>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <Button
                      size="lg"
                      className={cn(
                        "flex-1 h-14 text-sm font-black uppercase tracking-[0.15em] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300",
                        isOutOfStock
                          ? "bg-amber-400 text-amber-950 hover:bg-amber-500"
                          : "bg-foreground text-background hover:bg-foreground/90 hover:scale-[1.01]",
                      )}
                      disabled={
                        isOutOfStock
                          ? isLoadingWaitlist
                          : !selectedSize || !selectedColor
                      }
                      onClick={() =>
                        isOutOfStock ? handlePreOrder() : handleAddToCart()
                      }
                    >
                      {isOutOfStock ? (
                        <span className="flex items-center gap-2">
                          {isLoadingWaitlist ? (
                            <span className="animate-pulse">Checking...</span>
                          ) : (
                            <>
                              <Clock className="h-4 w-4" />
                              {isOnWaitlist ? "On Waitlist" : "Join Waitlist"}
                            </>
                          )}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Add to Bag
                        </span>
                      )}
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      className={cn(
                        "h-14 w-14 rounded-xl border-2 transition-all duration-300 px-0 shrink-0",
                        isWishlisted
                          ? "border-red-500/50 bg-red-500/5 text-red-500"
                          : "hover:border-primary/30 hover:bg-primary/5",
                      )}
                      onClick={() =>
                        isWishlisted
                          ? removeItem(product.id)
                          : addItem({
                              productId: product.id,
                              name: product.name,
                              price: product.price,
                              image: product.main_image_url,
                              slug: product.slug || "",
                            })
                      }
                    >
                      <Heart
                        className={cn(
                          "h-5 w-5 transition-colors",
                          isWishlisted
                            ? "fill-red-500 stroke-red-500"
                            : "text-foreground",
                        )}
                      />
                    </Button>
                  </div>

                  {!isOutOfStock && (
                    <Button
                      size="lg"
                      className="w-full h-14 text-sm font-black uppercase tracking-[0.15em] rounded-xl gradient-primary text-white shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.01] transition-all"
                      disabled={Boolean(!selectedSize || !selectedColor)}
                      onClick={handleBuyNow}
                    >
                      Buy It Now
                    </Button>
                  )}
                </div>
              </div>

              {/* Short Description Accordion */}
              <div className="mt-8">
                <ProductDescriptionAccordion
                  description={product.description}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <WaitlistDialog
        open={isWaitlistDialogOpen}
        onOpenChange={(open) => {
          if (!isLoadingWaitlist) setIsWaitlistDialogOpen(open);
        }}
        onSubmit={handleWaitlistSubmit}
        isSubmitting={isLoadingWaitlist}
        initialEmail={savedGuestEmail}
      />

      <SizeGuideModal
        open={isSizeGuideOpen}
        onOpenChange={setIsSizeGuideOpen}
      />

      <AlertDialog
        open={isUnjoinDialogOpen}
        onOpenChange={setIsUnjoinDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Waitlist?</AlertDialogTitle>
            <AlertDialogDescription>
              You will no longer receive notifications when this product is back
              in stock. You can always join again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.stopPropagation();
                handleConfirmUnjoin();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <RecommendedProducts
        categoryId={product.category_id || ""}
        currentProductId={product.id}
      />
    </div>
  );
}

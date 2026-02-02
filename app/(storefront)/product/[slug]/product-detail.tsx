"use client";

import FlashImage from "@/components/ui/flash-image";

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
          categoryId: product.category_id || "",
          name: product.name,
          price: product.price,
          image: product.main_image_url,
          size: selectedSize,
          color: selectedColor,
          quantity: quantity,
          maxQuantity: maxQty,
          slug: product.slug || "",
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
        categoryId: product.category_id || "",
        name: product.name,
        price: product.price,
        image: product.main_image_url,
        size: selectedSize,
        color: selectedColor,
        quantity: quantity,
        maxQuantity: maxQty,
        slug: product.slug || "",
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
        {/* Refined Minimal Breadcrumbs */}
        <nav className="flex items-center text-[10px] lg:text-xs text-muted-foreground mb-8 lg:mb-16 uppercase tracking-[0.2em] font-medium">
          <Link
            href="/"
            className="hover:text-foreground transition-colors shrink-0"
          >
            Home
          </Link>
          <span className="mx-3 text-border">/</span>
          <Link
            href="/shop"
            className="hover:text-foreground transition-colors shrink-0"
          >
            Shop
          </Link>
          {product.categories?.name && (
            <>
              <span className="mx-3 text-border">/</span>
              <Link
                href={`/shop?category=${product.category_id}`}
                className="hover:text-foreground transition-colors shrink-0"
              >
                {product.categories.name}
              </Link>
            </>
          )}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          {/* LEFT: Immersive Vertical Gallery (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Mobile Carousel (Hidden on Desktop) */}
            <div className="lg:hidden">
              <ProductGallery
                images={product.gallery_image_urls || []}
                name={product.name}
                mainImage={product.images?.desktop || product.main_image_url}
              />
            </div>

            {/* Desktop Vertical Stack (Hidden on Mobile) */}
            <div className="hidden lg:flex flex-col gap-4">
              {[
                product.images?.desktop || product.main_image_url,
                ...(product.gallery_image_urls || []),
              ]
                .filter(Boolean)
                .map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-full aspect-[4/5] bg-neutral-50 overflow-hidden"
                  >
                    <FlashImage
                      src={img}
                      alt={`${product.name} - View ${idx + 1}`}
                      fill
                      className="object-cover"
                      priority={idx < 2}
                    />
                  </div>
                ))}
            </div>
          </div>

          {/* RIGHT: Sticky "Control Center" (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col h-full pt-2 lg:sticky lg:top-8 self-start">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Header Info */}
              <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-regular uppercase tracking-[0.1em] text-foreground leading-tight mb-2">
                  {product.name}
                </h1>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex flex-col">
                    <p className="text-xl font-medium tracking-wide text-foreground">
                      {formatCurrency(product.price)}
                    </p>
                    {!!product.original_price &&
                      product.original_price > product.price && (
                        <p className="text-xs text-muted-foreground line-through decoration-transparent tracking-wider mt-0.5">
                          {formatCurrency(product.original_price)}
                        </p>
                      )}
                  </div>

                  {/* Quiet Review Count */}
                  {initialReviews.count > 0 && (
                    <Link
                      href="#reviews"
                      className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors group"
                    >
                      <Star className="w-3 h-3 text-foreground" />
                      <span className="mt-0.5 border-b border-transparent group-hover:border-foreground">
                        {initialReviews.count} Reviews
                      </span>
                    </Link>
                  )}
                </div>

                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-6">
                  Tax Included. Free Shipping.
                </p>
              </div>

              {/* Hype/Stock Tickers (Refined) */}
              {viewerCount > 2 && (
                <div className="flex items-center gap-2 mb-6 opacity-70">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                    {viewerCount} viewing now
                  </span>
                </div>
              )}

              {/* Selectors */}
              <div className="mb-8 border-t border-border/40 pt-8">
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
              </div>

              {/* Primary Actions */}
              <div className="space-y-3 mb-12">
                <Button
                  size="lg"
                  className={cn(
                    "w-full h-12 text-xs font-bold uppercase tracking-[0.2em] rounded-none transition-all duration-300",
                    isOutOfStock
                      ? "bg-neutral-200 text-neutral-500 hover:bg-neutral-300"
                      : "bg-foreground text-background hover:bg-foreground/90",
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
                  {isOutOfStock
                    ? isOnWaitlist
                      ? "You're on the list"
                      : "Join Waitlist"
                    : "Add to Bag"}
                </Button>

                {!isOutOfStock && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full h-12 text-xs font-bold uppercase tracking-[0.2em] rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background transition-all"
                    onClick={handleBuyNow}
                    disabled={!selectedSize || !selectedColor}
                  >
                    Buy Now
                  </Button>
                )}

                <button
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
                  className="w-full py-2 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Heart
                    className={cn(
                      "w-3.5 h-3.5",
                      isWishlisted
                        ? "fill-red-500 text-red-500"
                        : "text-current",
                    )}
                  />
                  {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                </button>
              </div>

              {/* Details Accordion (Clean List) */}
              <div className="border-t border-border/40">
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

"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/use-cart-store";
import { cn, formatCurrency, calculateDiscount } from "@/lib/utils";
import { Phone, Plus, Share2, Star } from "lucide-react"; // Icons for services
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { togglePreorder } from "@/app/actions/preorder";
import { ProductGallery } from "@/components/products/product-gallery";
import {
  ProductColorSelector,
  ProductSizeSelector,
  ProductFitSelector,
} from "@/components/products/product-selectors";

import dynamic from "next/dynamic";

const SizeGuideModal = dynamic(
  () =>
    import("@/components/products/size-guide-modal").then(
      (mod) => mod.SizeGuideModal,
    ),
  { ssr: false },
);

import { FAQJsonLd } from "@/components/seo/faq-json-ld";
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
    fit_options?: string[];
    product_stock: (StockItem & { fit: string })[];
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
  colorMap?: Record<string, string>;
};

export function ProductDetailClient({
  product,
  initialReviews,
  colorMap,
}: ProductDetailProps) {
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addItem);

  // Enterprise Initial State: Find first in-stock variant combo if available.
  const initialStockItem = useMemo(() => {
    return product.product_stock?.find((s) => s.quantity > 0);
  }, [product.product_stock]);

  const [selectedSize, setSelectedSize] = useState<string>(
    initialStockItem?.size || product.size_options?.[0] || "",
  );

  const [selectedColor, setSelectedColor] = useState<string>(
    initialStockItem?.color && initialStockItem.color !== "Standard"
      ? initialStockItem.color
      : product.color_options?.length > 0 &&
          product.color_options[0] !== "Standard"
        ? product.color_options[0]
        : "",
  );

  const [selectedFit, setSelectedFit] = useState<string>(
    initialStockItem?.fit || product.fit_options?.[0] || "Regular",
  );
  const [quantity] = useState(1);

  // Waitlist State
  const [isOnWaitlist, setIsOnWaitlist] = useState(false);
  const [isLoadingWaitlist, setIsLoadingWaitlist] = useState(false);
  const [isWaitlistDialogOpen, setIsWaitlistDialogOpen] = useState(false);
  const [isUnjoinDialogOpen, setIsUnjoinDialogOpen] = useState(false);

  // Helper: Normalize color strings (fix typos, standard formatting)
  const normalizeColor = (c: string) => {
    if (!c) return "";
    let clean = c.trim().toLowerCase().replace(/\s+/g, " ");
    // Specific fixes based on user feedback
    if (clean === "offf white") clean = "off white";
    if (clean === "off-white") clean = "off white";
    // Title Case for display
    return clean
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const adjustedPrice = product.price;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  // Auto-Select Logic: If there's only 1 option for any attribute, select it automatically.

  const { user } = useAuth();

  // Real-time Stock & Hype Check
  const { stock: realTimeStock, loading: loadingStock } = useRealTimeHype(
    product.id,
    product.product_stock,
  );

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
        : ["One Size"];

    return sizes.sort((a, b) => {
      const indexA = STANDARD_SIZES.indexOf(a);
      const indexB = STANDARD_SIZES.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [product.size_options, realTimeStock]);

  const colorOptions = useMemo(() => {
    const rawOptions = product.color_options?.length
      ? product.color_options
      : realTimeStock?.map((s) => s.color).filter(Boolean) || ["Standard"];

    // Deduplicate based on normalized values
    const normalized = Array.from(
      new Set(rawOptions.map(normalizeColor)),
    ).sort();

    // Hide if only 1 option and it's "Standard"
    if (normalized.length === 1 && normalized[0] === "Standard") {
      return [];
    }

    return normalized;
  }, [product.color_options, realTimeStock]);

  const fitOptions = useMemo(() => {
    if (product.fit_options?.length) {
      return product.fit_options;
    }

    const fits = realTimeStock?.map((s) => s.fit).filter(Boolean) || [];
    const uniqueFits = Array.from(new Set(fits));

    return uniqueFits;
  }, [product.fit_options, realTimeStock]);

  // Stock Logic (Normalized)
  const stockMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (!realTimeStock) return map;

    realTimeStock.forEach((item) => {
      // Use normalized color for the key to merge duplicates
      const key = `${item.size}-${normalizeColor(item.color || "")}-${item.fit || "Regular"}`;
      map[key] = (map[key] || 0) + item.quantity;
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

  const getStock = (size: string, color: string, fit: string) =>
    stockMap[`${size}-${normalizeColor(color)}-${fit}`] || 0;

  // Auto-Select Logic: Context Aware Selection
  useEffect(() => {
    // Determine available options under current constraints
    const availableSizes = sizeOptions.filter((s: string) => {
      // If color and fit are selected, check exact stock. Otherwise it's broadly available.
      if (selectedColor && selectedFit)
        return getStock(s, selectedColor, selectedFit) > 0;
      return true;
    });

    const availableColors = colorOptions.filter((c: string) => {
      if (selectedSize && selectedFit)
        return getStock(selectedSize, c, selectedFit) > 0;
      return true;
    });

    const availableFits = fitOptions.filter((f: string) => {
      if (selectedSize && selectedColor)
        return getStock(selectedSize, selectedColor, f) > 0;
      return true;
    });

    // 1. Auto-Select or Correct Size
    // If no size is selected, or if the current size is no longer available under the new color/fit constraints BUT other sizes are.
    if (
      !selectedSize ||
      (selectedSize &&
        !availableSizes.includes(selectedSize) &&
        availableSizes.length > 0)
    ) {
      if (availableSizes.length > 0) {
        setSelectedSize(availableSizes[0]);
      } else if (sizeOptions.length > 0 && !selectedSize) {
        setSelectedSize(sizeOptions[0]); // Global fallback
      }
    }

    // 2. Auto-Select or Correct Color
    if (
      !selectedColor ||
      (selectedColor &&
        !availableColors.includes(selectedColor) &&
        availableColors.length > 0)
    ) {
      if (availableColors.length > 0) {
        setSelectedColor(availableColors[0]);
      } else if (colorOptions.length > 0 && !selectedColor) {
        setSelectedColor(colorOptions[0]); // Global fallback
      }
    }

    // 3. Auto-Select or Correct Fit
    if (
      !selectedFit ||
      (selectedFit &&
        !availableFits.includes(selectedFit) &&
        availableFits.length > 0)
    ) {
      if (availableFits.length > 0) {
        setSelectedFit(availableFits[0]);
      } else if (fitOptions.length > 0 && !selectedFit) {
        setSelectedFit(fitOptions[0]); // Global fallback
      }
    }
  }, [
    sizeOptions,
    colorOptions,
    fitOptions,
    selectedSize,
    selectedColor,
    selectedFit,
    stockMap, // Dependency on stock map so it respects real-time calculations
  ]);
  //   const isAvailable = (size: string, color: string) =>
  //     (stockMap[`${size}-${color}`] || 0) > 0;
  const isSizeAvailable = (size: string) => {
    if (!selectedColor || !selectedFit) return true;
    return getStock(size, selectedColor, selectedFit) > 0;
  };

  const isFitAvailable = (fit: string) => {
    if (!selectedSize || !selectedColor) return true;
    return getStock(selectedSize, selectedColor, fit) > 0;
  };

  // If fit is hidden, use "Regular" for stock lookup as per default standard
  const activeFit = selectedFit || "Regular";
  const maxQty = getStock(selectedSize, selectedColor, activeFit);

  // Logic: OOS if Global stock is 0 OR if specific selection is 0
  const isGlobalOutOfStock = totalStock === 0 && !loadingStock;
  const isSelectionOutOfStock = maxQty === 0 && selectedSize && selectedColor;
  const isOutOfStock = isGlobalOutOfStock || isSelectionOutOfStock;

  // Handlers
  const handlePreOrder = async () => {
    if (isOnWaitlist) {
      if (!user) {
        toast.info("You are already on the waitlist! (Guest)");
        return;
      }
      setIsUnjoinDialogOpen(true);
      return;
    }
    setIsLoadingWaitlist(true);
    try {
      const result = await togglePreorder(product.id);
      if (
        result.error &&
        (result.error.includes("sign in") ||
          result.error.includes("identifying"))
      ) {
        setIsWaitlistDialogOpen(true);
      } else if (result.error) {
        toast.error(result.error);
      } else {
        setIsOnWaitlist(true);
        toast.success("Added to waitlist!");
        if (result.status === "added")
          localStorage.setItem(`waitlist_${product.id}`, "true");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoadingWaitlist(false);
    }
  };

  const handleConfirmUnjoin = async () => {
    const previousState = true;
    setIsOnWaitlist(false);
    toast.success("Removed from waitlist.");
    try {
      const result = await togglePreorder(product.id);
      if (result.error) {
        setIsOnWaitlist(previousState);
        toast.dismiss();
        toast.error(result.error);
      } else {
        localStorage.removeItem(`waitlist_${product.id}`);
      }
    } catch {
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
    } catch {
      toast.error("Failed to join waitlist.");
    } finally {
      setIsLoadingWaitlist(false);
    }
  };
  const handleAddToCart = async (
    options = { openCart: true, showToast: true },
  ) => {
    if (
      !selectedSize ||
      (colorOptions.length > 0 && !selectedColor) ||
      (fitOptions.length > 0 && !selectedFit)
    ) {
      toast.error("Please complete your selection");
      return false;
    }
    if (maxQty <= 0) {
      toast.error("Out of stock");
      return false;
    }
    try {
      await addToCart(
        {
          productId: product.id,
          categoryId: product.category_id || "",
          name: product.name,
          price: adjustedPrice,
          image: product.main_image_url,
          size: selectedSize,
          color: selectedColor || "Standard", // Fallback for backend if color hidden
          fit: selectedFit || "Regular", // Fallback for backend if fit hidden
          quantity: quantity,
          maxQuantity: maxQty,
          slug: product.slug || "",
        },
        options,
      );
      return true;
    } catch {
      toast.error("Failed to update cart");
      return false;
    }
  };

  // Prefetch checkout for speed
  useEffect(() => {
    router.prefetch("/checkout");
  }, [router]);

  // FAQ Data
  const faqData = [
    {
      question: "Material",
      answer: "Premium Fabric Blend designed for comfort and durability.",
    },
    {
      question: "Fit",
      answer: "Relaxed, gender-neutral fit. True to size.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <FAQJsonLd questions={faqData} />

      {/* GALLERY SECTION (Full Width) */}
      <div className="w-full">
        <ProductGallery
          images={product.gallery_image_urls || []}
          name={product.name}
          mainImage={product.images?.desktop || product.main_image_url}
        />
      </div>

      {/* SPLIT INFO SECTION (Grid) */}
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 pt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 lg:gap-x-24">
          {/* LEFT COLUMN: Identity & Visuals (Col-7) */}
          <div className="col-span-1 lg:col-span-7 flex flex-col gap-6">
            <div className="space-y-6">
              {/* Breadcrumb-ish / Collection Name & Share */}
              <div className="flex items-center justify-between">
                <span className="text-[8px] uppercase tracking-[0.4em] text-muted-foreground font-medium">
                  Collection 2026
                </span>
                <button
                  onClick={handleShare}
                  className="p-1 hover:opacity-50 transition-all outline-none focus:outline-none"
                  aria-label="Share product"
                >
                  <Share2 className="w-3.5 h-3.5 text-foreground stroke-[1.5]" />
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-foreground leading-tight tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={adjustedPrice}
                    initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="text-xl font-serif tracking-tight text-foreground/80"
                  >
                    {formatCurrency(adjustedPrice)}
                  </motion.div>
                </AnimatePresence>
                {product.original_price &&
                  product.original_price > product.price && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground line-through">
                        {formatCurrency(product.original_price)}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-foreground border border-foreground/20 px-2 py-0.5 rounded-none">
                        -
                        {calculateDiscount(
                          adjustedPrice,
                          product.original_price,
                        )}
                        %
                      </span>
                    </div>
                  )}
              </div>

              {/* Rating Summary */}
              {initialReviews.count > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-foreground">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <span className="ml-1 text-[10px] font-medium tracking-widest uppercase">
                      {initialReviews.average}
                    </span>
                  </div>
                  <span className="text-[8px] text-muted-foreground uppercase tracking-[0.3em]">
                    ({initialReviews.count} Reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Visual Color Variations */}
            {colorOptions.length > 0 && colorOptions[0] !== "Standard" && (
              <div>
                <ProductColorSelector
                  options={colorOptions}
                  selected={selectedColor}
                  onSelect={setSelectedColor}
                  isAvailable={(color) => {
                    if (!selectedSize || !selectedFit) return true;
                    return getStock(selectedSize, color, selectedFit) > 0;
                  }}
                  customColorMap={colorMap}
                />
              </div>
            )}

            {fitOptions.length > 0 && (
              <div className="mt-6">
                <ProductFitSelector
                  options={fitOptions}
                  selected={selectedFit}
                  onSelect={setSelectedFit}
                  isAvailable={isFitAvailable}
                />
              </div>
            )}

            <div className="w-full h-px bg-border my-4" />

            {/* Description Block (Desktop Only) */}
            <div className="space-y-4 hidden lg:block">
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-medium text-foreground">
                Description
              </h3>
              <div className="text-[13px] leading-relaxed text-muted-foreground max-w-xl font-medium">
                <div
                  className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground font-serif tracking-wide [&>p]:mb-4"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Action & Service (Col-5) */}
          <div className="col-span-1 lg:col-span-5 flex flex-col gap-5 lg:pt-8">
            {/* Size & Add to Cart */}
            <div className="space-y-8 p-0 lg:p-0">
              {sizeOptions.length > 0 &&
                !(
                  sizeOptions.length === 1 && sizeOptions[0] === "Standard"
                ) && (
                  <ProductSizeSelector
                    options={sizeOptions}
                    selected={selectedSize}
                    onSelect={setSelectedSize}
                    isAvailable={isSizeAvailable}
                    onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
                  />
                )}

              <Button
                size="lg"
                className={cn(
                  "w-full h-14 text-[10px] font-medium uppercase tracking-[0.3em] rounded-none transition-all duration-300 active:scale-[0.98] outline-none focus:outline-none",
                  isOutOfStock
                    ? "bg-muted text-muted-foreground hover:bg-muted/80"
                    : "bg-foreground text-background hover:opacity-90",
                )}
                disabled={isOutOfStock ? isLoadingWaitlist : false}
                onClick={() =>
                  isOutOfStock ? handlePreOrder() : handleAddToCart()
                }
              >
                {isOutOfStock
                  ? isOnWaitlist
                    ? "Joined waitlist"
                    : "Join waitlist"
                  : selectedSize && selectedColor && selectedFit
                    ? "Add to shopping bag"
                    : "Make your selection"}
              </Button>
            </div>

            {/* Description Block (Mobile Only - Collapsible) */}
            <div className="pt-4 block lg:hidden border-t border-border">
              <button
                onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                className="w-full flex items-center justify-between group outline-none focus:outline-none"
              >
                <h3 className="text-xs uppercase tracking-widest font-bold text-foreground group-hover:opacity-70 transition-opacity">
                  Product Description
                </h3>
                <span className="text-sm font-light text-muted-foreground">
                  {isDescriptionOpen ? "−" : "+"}
                </span>
              </button>

              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out overflow-hidden",
                  isDescriptionOpen
                    ? "grid-rows-[1fr] opacity-100 mt-4"
                    : "grid-rows-[0fr] opacity-0 mt-0",
                )}
              >
                <div className="min-h-0">
                  <div className="text-sm leading-relaxed text-muted-foreground max-w-xl font-medium">
                    <div
                      className="prose prose-sm prose-neutral dark:prose-invert max-w-none text-muted-foreground font-medium [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Service Links */}
            <div className="space-y-6 pt-4 border-t border-border">
              <div className="flex items-start gap-3">
                <Phone
                  className="w-4 h-4 mt-0.5 text-foreground"
                  strokeWidth={1.5}
                />
                <div className="space-y-1">
                  <Link
                    href="/contact"
                    className="text-[11px] font-serif hover:underline underline-offset-4 decoration-foreground/30 block text-foreground tracking-wide"
                  >
                    Contact Us
                  </Link>
                  <p className="text-[11px] text-muted-foreground leading-normal font-serif opacity-70">
                    Our Client Advisors are available to answer your questions.
                  </p>
                </div>
              </div>
            </div>

            {/* Accordion / Services */}
            <div className="pt-4">
              <div className="group">
                <button className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-medium mb-2 text-foreground outline-none focus:outline-none">
                  <Plus className="w-3 h-3" /> Services
                </button>
                <p className="text-[11px] text-muted-foreground pl-5">
                  Complimentary Shipping, Complimentary Exchanges & Returns,
                  Secure Payments.
                </p>
              </div>
            </div>
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
        initialEmail=""
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
              you can always join again later.
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

      {/* Recommended (Full Width Below) */}
      <RecommendedProducts
        categoryId={product.category_id || ""}
        currentProductId={product.id}
        title="Picked Just For You"
      />

      {/* Import missing icon */}
    </div>
  );
}

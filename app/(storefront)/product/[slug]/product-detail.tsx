"use client";

import FlashImage from "@/components/ui/flash-image";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/use-cart-store";
import {
  useWishlistStore,
  selectIsInWishlist,
} from "@/store/use-wishlist-store";
import { cn, formatCurrency, calculateDiscount } from "@/lib/utils";
import { Phone, MapPin, Package, RefreshCcw, Plus, Share2 } from "lucide-react"; // Icons for services
import { toast } from "sonner";
import Link from "next/link";
import { togglePreorder } from "@/app/actions/preorder";
import { ProductGallery } from "@/components/products/product-gallery";
import {
  ProductColorSelector,
  ProductSizeSelector,
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
import { motion } from "framer-motion";

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

  const [showStickyBar, _setShowStickyBar] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

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
        : [...STANDARD_SIZES];

    return sizes.sort((a, b) => {
      const indexA = STANDARD_SIZES.indexOf(a);
      const indexB = STANDARD_SIZES.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [product.size_options, realTimeStock]);

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

  const colorOptions = useMemo(() => {
    const rawOptions = product.color_options?.length
      ? product.color_options
      : realTimeStock?.map((s) => s.color) || ["Standard"];

    // Deduplicate based on normalized values
    return Array.from(new Set(rawOptions.map(normalizeColor))).sort();
  }, [product.color_options, realTimeStock]);

  // Stock Logic (Normalized)
  const stockMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (!realTimeStock) return map;
    realTimeStock.forEach((item) => {
      // Use normalized color for the key to merge duplicates
      const key = `${item.size}-${normalizeColor(item.color)}`;
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

  const getStock = (size: string, color: string) =>
    stockMap[`${size}-${color}`] || 0;
  //   const isAvailable = (size: string, color: string) =>
  //     (stockMap[`${size}-${color}`] || 0) > 0;
  const isSizeAvailable = (size: string) =>
    realTimeStock?.some((s) => s.size === size && s.quantity > 0) ?? true;

  const maxQty = getStock(selectedSize, selectedColor);

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
    } catch (_error) {
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
      toast.error("Select a size and color");
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
      toast.error("Failed to add");
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
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 pt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-2 lg:gap-x-24">
          {/* LEFT COLUMN: Identity & Visuals (Col-7) */}
          <div className="col-span-1 lg:col-span-7 flex flex-col gap-6">
            <div className="space-y-6">
              {/* Breadcrumb-ish / Collection Name & Share */}
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground font-medium">
                  Collection 2026
                </span>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  aria-label="Share product"
                >
                  <Share2 className="w-4 h-4 text-foreground" />
                </button>
              </div>

              <h1 className="text-4xl lg:text-5xl font-serif text-foreground leading-tight tracking-tight">
                {product.name}
              </h1>

              <div className="text-2xl font-medium tracking-tight text-foreground/70">
                {formatCurrency(product.price)}
              </div>
            </div>

            {/* Visual Color Variations */}
            <div>
              <ProductColorSelector
                options={colorOptions}
                selected={selectedColor}
                onSelect={setSelectedColor}
                isAvailable={() => true}
              />
            </div>

            <div className="w-full h-px bg-border my-4" />

            {/* Description Block (Desktop Only) */}
            <div className="space-y-4 hidden lg:block">
              <h3 className="text-xs uppercase tracking-widest font-bold text-foreground">
                Product Description
              </h3>
              <div className="text-sm leading-relaxed text-muted-foreground max-w-xl font-medium">
                <div
                  className="prose prose-sm prose-neutral dark:prose-invert max-w-none text-muted-foreground font-medium [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Action & Service (Col-5) */}
          <div className="col-span-1 lg:col-span-5 flex flex-col gap-5 lg:pt-8">
            {/* Size & Add to Cart */}
            <div className="space-y-8 p-0 lg:p-0">
              <ProductSizeSelector
                options={sizeOptions}
                selected={selectedSize}
                onSelect={setSelectedSize}
                isAvailable={isSizeAvailable}
                onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
              />

              <Button
                size="lg"
                className={cn(
                  "w-full h-14 text-sm font-bold uppercase tracking-[0.2em] rounded-none transition-all duration-300",
                  isOutOfStock
                    ? "bg-muted text-muted-foreground hover:bg-muted/80"
                    : "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
                disabled={isOutOfStock ? isLoadingWaitlist : false}
                onClick={() =>
                  isOutOfStock ? handlePreOrder() : handleAddToCart()
                }
              >
                {isOutOfStock
                  ? isOnWaitlist
                    ? "You're on the list"
                    : "Join Waitlist"
                  : selectedSize
                    ? "Add to Shopping Bag"
                    : "Select Size"}
              </Button>
            </div>

            {/* Description Block (Mobile Only - Collapsible) */}
            <div className="pt-4 block lg:hidden border-t border-border">
              <button
                onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                className="w-full flex items-center justify-between group"
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
                    className="text-xs uppercase tracking-widest font-bold underline decoration-1 underline-offset-4 decoration-foreground/30 hover:decoration-foreground block text-foreground"
                  >
                    Contact Us
                  </Link>
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    Our Client Advisors are available to answer your questions.
                  </p>
                </div>
              </div>
            </div>

            {/* Accordion / Services */}
            <div className="pt-4">
              <div className="group">
                <button className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold mb-2 text-foreground">
                  <Plus className="w-3 h-3" /> Flash Services
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

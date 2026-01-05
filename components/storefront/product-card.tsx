"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { ShoppingBag, Heart, Star } from "lucide-react";
import {
  useWishlistStore,
  selectIsInWishlist,
} from "@/store/use-wishlist-store";
import { useCartStore } from "@/store/use-cart-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";
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
import dynamic from "next/dynamic";
import FlashImage from "@/components/ui/flash-image";

const QuickView = dynamic(
  () => import("@/components/products/quick-view").then((mod) => mod.QuickView),
  { ssr: false }
);
const QuickAddDialog = dynamic(
  () =>
    import("@/components/products/quick-add-dialog").then(
      (mod) => mod.QuickAddDialog
    ),
  { ssr: false }
);
const WaitlistDialog = dynamic(
  () =>
    import("@/components/products/waitlist-dialog").then(
      (mod) => mod.WaitlistDialog
    ),
  { ssr: false }
);

import type { Product } from "@/lib/services/product-service";
import { checkPreorderStatus, togglePreorder } from "@/app/actions/preorder";
import { prefetchProductAction } from "@/app/actions/prefetch-product";
import { useRealTimeHype } from "@/hooks/use-real-time-stock";

interface ProductCardProps {
  product: Product;
  showRating?: boolean;
  priority?: boolean;
  onWaitlistChange?: (isJoined: boolean) => void;
}
// Force rebuild for waitlist logic update

export function ProductCard({
  product,
  showRating = true,
  priority = false,
  onWaitlistChange,
}: ProductCardProps) {
  // Use optimized images if available, starting with thumbnail for grid, or mobile for slightly larger cards
  // Fallback to main_image_url
  const optimizedSrc =
    product.images?.thumbnail ||
    product.images?.mobile ||
    product.main_image_url;
  const [imageSrc, setImageSrc] = useState(optimizedSrc || "/placeholder.svg");
  const [isNew, setIsNew] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Real-time Stock
  // Type sanitation: DB types map product_id as string | null, but we need string for strict state
  const initialStock = (product.product_stock || [])
    .filter((item): item is typeof item & { product_id: string } =>
      Boolean(item.product_id)
    )
    .map((item) => ({
      ...item,
      product_id: item.product_id,
      quantity: item.quantity ?? 0, // Ensure number
    }));

  const { stock: realTimeStock } = useRealTimeHype(
    product.id,
    product.product_stock || []
  );

  // Pre-order state
  const [isOnWaitlist, setIsOnWaitlist] = useState(false);
  const [isLoadingWaitlist, setIsLoadingWaitlist] = useState(false);
  const [isWaitlistDialogOpen, setIsWaitlistDialogOpen] = useState(false);

  const router = useRouter();

  const addToCart = useCartStore((state) => state.addItem);
  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen);
  const addToWishlist = useWishlistStore((state) => state.addItem);
  const removeFromWishlist = useWishlistStore((state) => state.removeItem);
  const isWishlisted = useWishlistStore((state) =>
    selectIsInWishlist(state, product.id)
  );

  // Dynamic stock calculation
  const stock = realTimeStock || [];

  // Determine if product has multiple options.
  // We check metadata AND actual stock variations to be safe.
  const hasMultipleOptions =
    (product.size_options && product.size_options.length > 0) ||
    (product.color_options && product.color_options.length > 0) ||
    stock.length > 1 ||
    (stock.length === 1 &&
      stock[0].size !== "Standard" &&
      stock[0].size !== "One Size");

  // Calculate total stock
  const totalStock = stock.reduce(
    (acc: number, item: { quantity: number }) => acc + (item.quantity || 0),
    0
  );
  const isOutOfStock = totalStock === 0;

  // Optional: Get rating from product if passed (e.g. from a joined aggregate)
  const rating = product.average_rating || 0;
  const reviewCount = product.review_count || 0;

  // Check waitlist status on mount if OOS
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.main_image_url || "",
        slug: product.slug || "",
      });
      toast.success("Added to Wishlist");
    }
  };

  const { user } = useAuth();
  const [savedGuestEmail, setSavedGuestEmail] = useState("");
  const [isUnjoinDialogOpen, setIsUnjoinDialogOpen] = useState(false);

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isBuyNowMode, setIsBuyNowMode] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasMultipleOptions) {
      setIsBuyNowMode(true);
      setIsQuickAddOpen(true);
      return;
    }

    // Pick first available variant
    const firstStock = realTimeStock.find((s) => s.quantity > 0);
    if (!firstStock) {
      toast.error("No stock available");
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.main_image_url || "",
          size: firstStock.size || "Standard",
          color: firstStock.color || "Standard",
          quantity: 1,
          maxQuantity: firstStock.quantity,
        },
        { openCart: false, showToast: false }
      );

      router.push("/checkout");
    } catch (error) {
      toast.error("Failed to proceed to checkout");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasMultipleOptions) {
      setIsBuyNowMode(false);
      setIsQuickAddOpen(true);
      return;
    }

    // Pick first available variant
    const firstStock = realTimeStock.find((s) => s.quantity > 0);
    if (!firstStock) {
      togglePreorder(product.id); // If no stock, offer preorder
      return;
    }

    // Prevent double clicks
    if (isAddingToCart) return;

    setIsAddingToCart(true);
    try {
      await addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.main_image_url || "",
        size: firstStock.size || "Standard",
        color: firstStock.color || "Standard",
        quantity: 1,
        maxQuantity: firstStock.quantity,
      });
      toast.success("Added to Cart");
      setIsCartOpen(true);
    } catch (error) {
      // Error handled by store
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Helper to get or create guest ID
  const getGuestId = () => {
    if (typeof window === "undefined") return undefined;
    let id = localStorage.getItem("guest_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("guest_id", id);
    }
    return id;
  };

  // Check waitlist status on mount if OOS
  // Check localStorage for guest status & email preference
  useEffect(() => {
    // 1. Load Email Preference
    const savedEmail = localStorage.getItem("user_email_preference");
    if (savedEmail) setSavedGuestEmail(savedEmail);

    // 2. Determine Waitlist Status (Server > Local)
    if (isOutOfStock) {
      setIsLoadingWaitlist(true);
      const guestId = getGuestId();
      // Pass savedEmail and guestId to check if this specific guest is on the list
      checkPreorderStatus(product.id, savedEmail || undefined, guestId).then(
        (serverStatus) => {
          if (serverStatus) {
            // Confirmed by server (User OR Guest with matching email OR GuestID)
            setIsOnWaitlist(true);
            // ensure local storage is in sync
            localStorage.setItem(`waitlist_${product.id}`, "true");
          } else {
            // Server says 'not joined'
            setIsOnWaitlist(false);
            localStorage.removeItem(`waitlist_${product.id}`);
          }
          setIsLoadingWaitlist(false);
        }
      );
    }
  }, [isOutOfStock, product.id]);

  const handlePreOrder = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // OPTIMISTIC UI: If we think we are joined...
    if (isOnWaitlist) {
      // GUEST HANDLING: No optimistic toggle. Just remind them.
      if (!user) {
        toast.info("You are already on the waitlist! (Guest)");
        return;
      }

      // AUTH USER HANDLING: Optimistic Remove
      const previousState = true;
      setIsOnWaitlist(false); // Optimistically remove
      toast.success("Removed from waitlist."); // Optimistic success

      try {
        const result = await togglePreorder(product.id);

        if (result.error) {
          // Error -> Revert
          setIsOnWaitlist(previousState);
          toast.dismiss();
          toast.error(result.error);
        } else {
          // Success confirmed
          localStorage.removeItem(`waitlist_${product.id}`);
        }
      } catch (error) {
        setIsOnWaitlist(previousState);
        toast.dismiss();
        toast.error("Something went wrong.");
      }
      return;
    }

    // If NOT joined...

    setIsLoadingWaitlist(true);
    try {
      // Attempt 1: Try as logged in / existing session
      const result = await togglePreorder(product.id);

      // Updated Error Check for Guest (check if it asks for identifying info)
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
        onWaitlistChange?.(true);
        toast.success("Added to waitlist!");
        if (result.status === "added")
          localStorage.setItem(`waitlist_${product.id}`, "true");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsLoadingWaitlist(false);
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
    } catch (error) {
      toast.error("Failed to join waitlist.");
    } finally {
      setIsLoadingWaitlist(false);
    }
  };

  const handleConfirmUnjoin = async () => {
    // Optimistic Remove
    const previousState = true;
    setIsOnWaitlist(false);
    toast.success("Removed from waitlist.");
    setIsUnjoinDialogOpen(false);

    try {
      const guestId = getGuestId();
      const savedEmail = localStorage.getItem("user_email_preference");

      const result = await togglePreorder(
        product.id,
        savedEmail || undefined,
        guestId
      );

      if (result.error) {
        // Error -> Revert
        setIsOnWaitlist(previousState);
        toast.dismiss();
        toast.error(result.error);
      } else {
        // Success confirmed
        localStorage.removeItem(`waitlist_${product.id}`);
      }
    } catch (error) {
      setIsOnWaitlist(previousState);
      toast.dismiss();
      toast.error("Something went wrong.");
    }
  };

  useEffect(() => {
    if (product.created_at) {
      const isProductNew =
        new Date(product.created_at) >
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      setIsNew(isProductNew);
    }
  }, [product.created_at]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (product.slug) {
      // Predictively warm the cache
      prefetchProductAction(product.slug);
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        className="group relative flex flex-col gap-2"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <Link
          href={`/product/${product.slug || product.id}`}
          className="block relative aspect-[3/4] overflow-hidden rounded-md bg-muted/20 border border-transparent group-hover:border-border/50 transition-all duration-300"
        >
          {/* Badges */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
            {isOutOfStock ? (
              <Badge className="bg-neutral-900 text-white hover:bg-neutral-800 uppercase tracking-wider text-[9px] font-bold px-2 py-0.5 rounded-sm border-none shadow-sm">
                Sold Out
              </Badge>
            ) : (
              <>
                {isNew && (
                  <Badge className="bg-white text-black hover:bg-white/90 uppercase tracking-wider text-[9px] font-bold px-2 py-0.5 rounded-sm border-none shadow-sm backdrop-blur-md">
                    New
                  </Badge>
                )}
              </>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            className={cn(
              "absolute top-2 right-2 z-10 h-7 w-7 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all duration-200 hover:scale-110 shadow-sm opacity-0 group-hover:opacity-100",
              isWishlisted
                ? "text-red-500 opacity-100"
                : "text-black hover:bg-white"
            )}
          >
            <Heart
              className={cn(
                "h-3.5 w-3.5 transition-colors",
                isWishlisted ? "fill-current" : "group-hover/heart:fill-red-200"
              )}
            />
          </button>

          {/* Main Image Layer */}
          <div className="relative h-full w-full bg-zinc-100 overflow-hidden">
            <FlashImage
              src={imageSrc}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-all duration-700 ease-in-out",
                isHovered && product.gallery_image_urls?.[0]
                  ? "opacity-0 scale-110"
                  : "opacity-100 scale-100"
              )}
              sizes="(max-width: 768px) 50vw, (max-width: 1210px) 33vw, 25vw"
              priority={priority}
              onError={() => setImageSrc("/placeholder.svg")}
            />

            {/* Hover Secondary Image */}
            {product.gallery_image_urls?.[0] && (
              <FlashImage
                src={product.gallery_image_urls[0]}
                alt={`${product.name} - alternate`}
                fill
                className={cn(
                  "object-cover transition-all duration-700 ease-in-out absolute inset-0",
                  isHovered ? "opacity-100 scale-100" : "opacity-0 scale-105"
                )}
                sizes="(max-width: 768px) 50vw, (max-width: 1210px) 33vw, 25vw"
              />
            )}
          </div>

          {/* Desktop Action Overlay */}
          <div className="hidden lg:flex absolute inset-x-2 bottom-2 gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out z-20">
            {!isOutOfStock ? (
              <>
                <Button
                  size="sm"
                  className="flex-1 bg-white text-black hover:bg-neutral-100 shadow-md font-bold h-9 rounded-sm transition-all duration-200 uppercase text-[10px] tracking-widest border border-transparent"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? "Adding..." : "Add to Cart"}
                </Button>
                <div onClick={(e) => e.preventDefault()} className="shrink-0">
                  <QuickView product={product} />
                </div>
              </>
            ) : (
              <Button
                size="sm"
                className={cn(
                  "flex-1 shadow-md font-bold h-9 rounded-sm transition-all duration-200 uppercase text-[10px] tracking-widest",
                  isOnWaitlist
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-neutral-900 hover:bg-neutral-800 text-white"
                )}
                onClick={handlePreOrder}
                disabled={isLoadingWaitlist}
              >
                {isLoadingWaitlist
                  ? "..."
                  : isOnWaitlist
                    ? "Joined"
                    : "Notify Me"}
              </Button>
            )}
          </div>
        </Link>

        {/* Details */}
        <div className="space-y-1 px-0.5">
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between items-start gap-2">
              <Link
                href={`/product/${product.slug || product.id}`}
                className="hover:text-primary transition-colors flex-1 min-w-0"
              >
                <h3 className="font-bold text-xs lg:text-sm leading-tight text-foreground uppercase tracking-wide truncate">
                  {product.name}
                </h3>
              </Link>
              <p className="font-bold text-xs lg:text-sm text-foreground tracking-tight tabular-nums whitespace-nowrap">
                {formatCurrency(product.price)}
              </p>
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground/70 uppercase tracking-wider font-medium">
              <span>{product.categories?.name || "Collection"}</span>
              {hasMultipleOptions && (
                <span>{stock.length > 0 ? "+ Options" : ""}</span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="lg:hidden mt-2 grid grid-cols-2 gap-2">
          {!isOutOfStock ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-sm text-[10px] font-bold uppercase tracking-widest border-zinc-200 shadow-sm hover:bg-zinc-50"
                onClick={handleAddToCart}
                disabled={isAddingToCart}
              >
                {isAddingToCart ? "..." : "Add"}
              </Button>
              <Button
                size="sm"
                className="h-9 rounded-sm text-[10px] font-bold uppercase tracking-widest shadow-sm bg-neutral-900 text-white hover:bg-neutral-800"
                onClick={handleBuyNow}
                disabled={isAddingToCart}
              >
                {isAddingToCart ? "..." : "Buy Now"}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className={cn(
                "col-span-2 h-9 rounded-sm text-[10px] font-bold uppercase tracking-widest shadow-sm",
                isOnWaitlist
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-neutral-900 hover:bg-neutral-800 text-white"
              )}
              onClick={handlePreOrder}
              disabled={isLoadingWaitlist}
            >
              {isLoadingWaitlist
                ? "..."
                : isOnWaitlist
                  ? "Joined Waitlist"
                  : "Notify Me"}
            </Button>
          )}
        </div>
      </motion.div>

      <WaitlistDialog
        open={isWaitlistDialogOpen}
        onOpenChange={(open) => {
          // Prevent interaction if submitting
          if (!isLoadingWaitlist) setIsWaitlistDialogOpen(open);
        }}
        onSubmit={handleWaitlistSubmit}
        isSubmitting={isLoadingWaitlist}
        initialEmail={savedGuestEmail}
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

      <QuickAddDialog
        product={product}
        open={isQuickAddOpen}
        onOpenChange={(open) => {
          setIsQuickAddOpen(open);
          if (!open) setIsBuyNowMode(false); // Reset mode on close
        }}
        buyNowMode={isBuyNowMode}
      />
    </>
  );
}

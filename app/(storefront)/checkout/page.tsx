"use client";

import { useCartStore, selectCartTotal } from "@/store/use-cart-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  Ticket,
  ShieldCheck,
  Lock,
  CreditCard,
  Trash,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Script from "next/script";
import { createOrder, validateCoupon } from "./actions";
import { getPincodeDetails } from "@/app/actions/get-pincode";
// import { PaymentTimer } from "@/components/checkout/payment-timer";
import { AddressSelector } from "@/components/checkout/address-selector";
import { Address } from "@/lib/services/address-service";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { BrandGlow } from "@/components/storefront/brand-glow";
import { BrandBadge } from "@/components/storefront/brand-badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, CheckoutFormData } from "@/lib/validations/checkout";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import NextImage from "next/image";
import imageLoader from "@/lib/image-loader";

declare global {
  interface Window {
    Razorpay: new (options: any) => any;
  }
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface VerifyPayload {
  order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const cartTotal = useCartStore(selectCartTotal);
  const clearCart = useCartStore((state) => state.clearCart);

  // Script Load State
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const removeItem = useCartStore((state) => state.removeItem);
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    type: "percentage" | "fixed";
    value: number;
  } | null>(null);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);

  // Partial COD State
  const [paymentMethod, setPaymentMethod] = useState<"PREPAID" | "PARTIAL_COD">(
    "PREPAID",
  );

  // Check if script is already loaded (e.g. from previous navigation)
  useEffect(() => {
    if (window.Razorpay) {
      console.log("Razorpay script already present on mount");
      setIsScriptLoaded(true);
    }
  }, []);

  // Form Setup
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      email: "",
      phone: "",
    },
  });

  // Pre-fill email if logged in (Client Side Only)
  useEffect(() => {
    if (user?.email) {
      form.setValue("email", user.email);
    }
  }, [user, form]);

  // Calculations
  const discountAmount = appliedCoupon
    ? appliedCoupon.type === "percentage"
      ? (cartTotal * appliedCoupon.value) / 100
      : appliedCoupon.value
    : 0;

  // Smart Pincode Lookup
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const zipCode = form.watch("zip");

  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      if (error === "payment_failed")
        toast.error("Payment failed. Please try again.");
      else if (error === "invalid_signature")
        toast.error("Security check failed. Payment flagged.");
      else if (error === "order_not_found")
        toast.error("Order not found during verification.");
      else if (error === "db_error")
        toast.error(
          "Payment successful but failed to update order. Contact support.",
        );
      else if (error === "server_error")
        toast.error("Server error during verification. Contact support.");
      else toast.error("Payment verification failed. Please try again.");

      // Clear the param
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      router.replace(url.pathname + url.search);
    }
  }, [searchParams, router]);

  useEffect(() => {
    const fetchPincode = async () => {
      if (zipCode && zipCode.length === 6) {
        setIsPincodeLoading(true);
        try {
          // ensure we use the imported action
          const result = await getPincodeDetails(zipCode);

          if (result.success && result.city) {
            form.setValue("city", result.city, { shouldValidate: true });
            form.setValue("state", result.state || "", {
              shouldValidate: true,
            });
            form.setValue("country", result.country || "India", {
              shouldValidate: true,
            });
            toast.success(`Found ${result.city}, ${result.state}`);
          } else {
            toast.error("Could not find pincode details");
          }
        } catch (error) {
          console.error("Pincode lookup error:", error);
          toast.error("Error checking pincode");
        } finally {
          setIsPincodeLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(fetchPincode, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [zipCode, form]);

  // Shipping Logic
  const shippingFee = cartTotal >= 699 ? 0 : 50;

  const finalTotal = Math.max(0, cartTotal - discountAmount + shippingFee);

  // Address Selection Handler
  const handleAddressSelect = (
    addr: Address,
    options?: { silent?: boolean },
  ) => {
    form.setValue("firstName", addr.name.split(" ")[0]);
    form.setValue("lastName", addr.name.split(" ").slice(1).join(" "));
    form.setValue(
      "address",
      addr.address_line1 +
        (addr.address_line2 ? `, ${addr.address_line2}` : ""),
    );
    form.setValue("city", addr.city);
    form.setValue("state", addr.state);
    form.setValue("zip", addr.pincode);
    form.setValue("country", addr.country);
    form.setValue("phone", addr.phone);

    if (!options?.silent) {
      toast.success("Address applied", { id: "address-applied" });
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsCheckingCoupon(true);
    try {
      const result = await validateCoupon(couponCode, cartTotal);
      if (result.valid) {
        setAppliedCoupon({
          code: couponCode.toUpperCase(),
          type: result.discount_type!,
          value: result.value!,
        });
        toast.success(`Coupon applied: ${result.message}`);
      } else {
        setAppliedCoupon(null);
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Failed to validate coupon");
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (!isScriptLoaded && !window.Razorpay) {
      toast.error("Payment system is still loading. Please wait a moment...");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create Order & Items (using Server Action)
      toast.info("Preparing your order...");

      const sanitizedItems = items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
        image: i.image,
        maxQuantity: i.maxQuantity,
        slug: i.slug,
        categoryId: i.categoryId,
      }));

      console.log("Breadcrumb: Calling createOrder...");
      const order = await createOrder({
        user_id: user?.id || null,
        subtotal: cartTotal,
        total: finalTotal,
        shipping_name: `${data.firstName} ${data.lastName}`,
        phone: data.phone,
        address_line1: data.address,
        city: data.city,
        state: data.state,
        pincode: data.zip,
        country: data.country,
        payment_provider: "razorpay",
        payment_reference: "",
        items: sanitizedItems,
        coupon_code: appliedCoupon?.code,
        discount_amount: discountAmount,
        email: data.email,
      });
      console.log("Breadcrumb: Order created successfully", order.id);

      // 3. Create Razorpay Order
      console.log("Breadcrumb: Requesting Razorpay Order...");
      const response = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: order.id,
          isPartialCod: paymentMethod === "PARTIAL_COD",
        }),
      });
      const rzpOrder = await response.json();
      console.log("Breadcrumb: Razorpay Order response received", rzpOrder);

      if (!response.ok)
        throw new Error(rzpOrder.error || "Failed to create Razorpay order");

      // 4. Open Razorpay Checkout
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      console.log("Razorpay Key ID Status:", keyId ? "Present" : "MISSING");

      if (!keyId) {
        throw new Error("Razorpay Key ID is missing. Please contact support.");
      }

      const options = {
        key: keyId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "Flash Ecommerce",
        description: "Order Payment",
        order_id: rzpOrder.id,
        handler: async function (paymentResponse: RazorpayResponse) {
          // 5. Verify Payment with Smart Retry (Exponential Backoff)
          const verifyPaymentWithRetry = async (
            payload: VerifyPayload,
            retries = 3,
            delay = 1000,
          ): Promise<{ verified: boolean; error?: string }> => {
            try {
              const res = await fetch("/api/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });

              // If server error (5xx), throw to retry
              if (res.status >= 500)
                throw new Error(`Server Error: ${res.status}`);

              return await res.json();
            } catch (err) {
              if (retries > 0) {
                console.log(
                  `Verification failed, retrying in ${delay}ms...`,
                  err,
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
                return verifyPaymentWithRetry(payload, retries - 1, delay * 2);
              }
              throw err;
            }
          };

          try {
            const verifyData = await verifyPaymentWithRetry({
              order_id: order.id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });

            if (verifyData.verified) {
              clearCart();
              toast.success("Payment Successful! Redirecting...");
              router.push(`/order/confirmation/${order.id}`);
            } else {
              // If it's a specific logic error (signature mismatch), we don't retry.
              toast.error(
                verifyData.error ||
                  "Payment verification failed. Security Check.",
              );
            }
          } catch (netErr) {
            // High-Resilience Fallback: If verification fails/times out but Razorpay reported success,
            // we redirect anyway and let the Confirmation page's Auto-Reconciliation handle it.
            console.error("Verification Network Delay/Failure:", netErr);
            clearCart();
            toast.info("Processing your transmission in background...");

            const params = new URLSearchParams({
              pid: paymentResponse.razorpay_payment_id,
              poid: paymentResponse.razorpay_order_id,
              psig: paymentResponse.razorpay_signature,
            });

            router.push(`/order/confirmation/${order.id}?${params.toString()}`);
          }
        },
        prefill: {
          name: `${data.firstName} ${data.lastName}`,
          email: user?.email || "guest@example.com",
          contact: data.phone,
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
        // Remove callback_url to avoid conflict with handler-based verification
        // callback_url: `${window.location.origin}/api/razorpay/callback`,
      };

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay SDK failed to load. Please check your internet connection.",
        );
      }

      const rzp1 = new window.Razorpay(options);
      console.log("Breadcrumb: Razorpay instance initialized");
      rzp1.open();
      console.log("Breadcrumb: Razorpay opened successfully");
    } catch (err: any) {
      console.error("FATAL Checkout Error:", err);
      console.error("Error Object Type:", typeof err);

      const detailedError = {
        message: err?.message || String(err),
        stack: err?.stack,
        name: err?.name,
        digest: err?.digest, // Next.js server action error digest
        raw: err,
      };

      console.error("Checkout failed detailed [Object]:", detailedError);

      toast.error(`Checkout failure: ${detailedError.message}`, {
        description: detailedError.digest
          ? `Error ID: ${detailedError.digest}`
          : "Please check your network and try again.",
      });

      setIsProcessing(false);
    }
  };

  // Success UI removed in favor of Redirect
  // if (isSuccess) { ... }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 text-center relative">
        <BrandGlow />
        <div className="relative z-10 space-y-4">
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <Button
            asChild
            variant="link"
            className="text-primary text-xl font-black uppercase tracking-widest"
          >
            <Link href="/shop">Go Shop Changes</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 container mx-auto px-4 relative">
      <BrandGlow className="top-20 opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center md:text-left"
      >
        <BrandBadge>Secure Checkout</BrandBadge>
        <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic mt-4 text-transparent bg-clip-text bg-gradient-to-r from-foreground via-muted-foreground to-foreground">
          Finalize <br className="hidden md:block" />
          <span className="text-stroke text-foreground/10">Transmission</span>
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-start relative z-10">
        {/* Left Column: Forms */}
        <div className="space-y-8 animate-in slide-in-from-left-5 duration-700 order-2 lg:order-1">
          {/* Saved Addresses */}
          {user && (
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight italic text-foreground">
                  Quick Fill
                </h2>
              </div>
              <div className="rounded-3xl border border-border/50 p-6 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
                <AddressSelector onSelect={handleAddressSelect} />
              </div>
            </section>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Shipping Details */}
              <section className="space-y-6 bg-card/80 backdrop-blur-md p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-border/50 shadow-sm">
                <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-foreground text-background font-bold text-sm">
                    1
                  </span>
                  <h2 className="text-xl font-black uppercase tracking-tight italic text-foreground">
                    Shipping Coordinates
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-5 mb-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="you@example.com"
                            {...field}
                            className="h-12 bg-muted/50 border-transparent focus:border-primary/50 rounded-xl focus:ring-primary/20"
                            disabled={!!user?.email}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                          First Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John"
                            {...field}
                            className="h-12 bg-muted/50 border-transparent focus:border-primary/50 rounded-xl focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                          Last Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Doe"
                            {...field}
                            className="h-12 bg-muted/50 border-transparent focus:border-primary/50 rounded-xl focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                        Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123 Flash St."
                          {...field}
                          className="h-12 bg-muted/50 border-transparent focus:border-primary/50 rounded-xl focus:ring-primary/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                          City
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Metropolis"
                            {...field}
                            className="h-12 bg-muted/50 border-transparent focus:border-primary/50 rounded-xl focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                          State
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="NY"
                            {...field}
                            className="h-12 bg-muted/50 border-transparent focus:border-primary/50 rounded-xl focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="zip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                          Pincode
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="10001"
                              {...field}
                              className="h-12 bg-muted/50 border-transparent focus:border-primary/50 rounded-xl focus:ring-primary/20 pr-10"
                            />
                            {isPincodeLoading && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                          Country
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="India"
                            {...field}
                            className="h-12 bg-muted/50 border-transparent focus:border-primary/50 rounded-xl focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                        Phone
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+91 99999 99999"
                          {...field}
                          className="h-12 bg-muted/50 border-transparent focus:border-primary/50 rounded-xl focus:ring-primary/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              {/* Payment Section - Scalable Selection */}
              <section className="space-y-6 bg-card/80 backdrop-blur-md p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-border/50 shadow-sm">
                <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-foreground text-background font-bold text-sm">
                    2
                  </span>
                  <h2 className="text-xl font-black uppercase tracking-tight italic text-foreground">
                    Payment Selection
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Prepaid Option */}
                  <label
                    className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${
                      paymentMethod === "PREPAID"
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border/50 bg-muted/10 hover:border-border"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      className="hidden"
                      checked={paymentMethod === "PREPAID"}
                      onChange={() => setPaymentMethod("PREPAID")}
                    />
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-foreground uppercase tracking-tight">
                        Full Online Payment
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">
                        Instant Confirmation & Zero COD Hashle
                      </p>
                    </div>
                    {paymentMethod === "PREPAID" && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </label>

                  {/* Partial COD Option */}
                  <label
                    className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all relative overflow-hidden ${
                      paymentMethod === "PARTIAL_COD"
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border/50 bg-muted/10 hover:border-border"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      className="hidden"
                      checked={paymentMethod === "PARTIAL_COD"}
                      onChange={() => setPaymentMethod("PARTIAL_COD")}
                    />
                    {/* Hot Badge */}
                    <div className="absolute top-0 right-0 bg-primary text-[8px] font-black text-white px-3 py-1 rounded-bl-xl uppercase tracking-widest italic animate-pulse">
                      Best Seller
                    </div>

                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-foreground uppercase tracking-tight">
                        Partial COD (Pay ₹100 Now)
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">
                        Pay remaining on delivery
                      </p>
                    </div>
                    {paymentMethod === "PARTIAL_COD" && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </label>
                </div>

                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black text-center mt-2 flex items-center justify-center gap-2">
                  <ShieldCheck className="h-3 w-3" /> Secure checkout by
                  Razorpay
                </p>
              </section>

              <div className="pt-4 sticky bottom-4 z-20 lg:static">
                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-sm md:text-base gradient-primary hover:scale-[1.01] active:scale-[0.98] transition-all shadow-xl shadow-primary/25 relative overflow-hidden group border-0 text-white"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative flex items-center gap-3">
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        Pay{" "}
                        {formatCurrency(
                          paymentMethod === "PARTIAL_COD" ? 100 : finalTotal,
                        )}{" "}
                        Now
                      </>
                    )}
                  </span>
                </Button>
                <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground mt-4 font-bold flex items-center justify-center gap-2 bg-background/80 backdrop-blur-sm py-1 rounded-full lg:bg-transparent">
                  <ShieldCheck className="h-3 w-3" />
                  256-Bit SSL Encrypted Transaction
                </p>
              </div>
            </form>
          </Form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="order-1 lg:order-2 lg:sticky lg:top-32 space-y-6 animate-in slide-in-from-right-5 duration-700 delay-100">
          <div className="bg-card text-card-foreground p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden group border border-border/50">
            {/* Ambient Background - Adaptive */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -ml-32 -mb-32" />

            <div className="relative z-10">
              <h2 className="font-black text-2xl italic uppercase tracking-tighter mb-6 flex items-center justify-between text-foreground">
                Order Summary
                <span className="text-sm not-italic font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {items.length} Items
                </span>
              </h2>

              <div className="space-y-5 max-h-[300px] lg:max-h-[400px] overflow-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="flex gap-4 items-start group/item"
                  >
                    <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-muted border border-border/50 shrink-0">
                      {item.image && (
                        <NextImage
                          src={item.image}
                          layout="fill"
                          objectFit="cover"
                          loader={imageLoader}
                          className="group-hover/item:scale-110 transition-transform duration-500"
                          alt={item.name}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate pr-4 text-foreground">
                        {item.name}
                      </p>
                      <p className="text-muted-foreground text-xs font-medium mt-0.5">
                        {item.size} / {item.color}{" "}
                        <span className="mx-1">x</span> {item.quantity}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-mono text-sm font-bold text-primary">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() =>
                          removeItem(item.productId, item.size, item.color)
                        }
                        className="text-xs text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1 group/remove"
                      >
                        <Trash className="h-3 w-3 group-hover/remove:scale-110 transition-transform" />
                        <span className="sr-only">Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px w-full bg-border/50 my-6" />

              {/* Coupon Section */}
              <div className="bg-muted/30 rounded-2xl p-2 flex items-center gap-2 border border-border/50">
                <Ticket className="h-4 w-4 text-muted-foreground ml-3" />
                <Input
                  placeholder="PROMO CODE"
                  className="bg-transparent border-0 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0 h-10 font-bold uppercase tracking-wider text-sm shadow-none"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={!!appliedCoupon}
                />
                {appliedCoupon ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={removeCoupon}
                    className="h-9 rounded-xl px-4 font-bold text-xs uppercase tracking-wider"
                  >
                    Remove
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleApplyCoupon}
                    disabled={isCheckingCoupon || !couponCode}
                    className="h-9 bg-foreground text-background hover:bg-foreground/90 rounded-xl px-4 font-black text-xs uppercase tracking-wider"
                  >
                    {isCheckingCoupon ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Apply"
                    )}
                  </Button>
                )}
              </div>

              <div className="space-y-3 pt-2">
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-500 font-bold px-1 bg-green-500/10 p-2 rounded-lg border border-green-500/20">
                    <span className="flex items-center gap-1.5">
                      <Ticket className="h-3 w-3" /> {appliedCoupon.code}
                    </span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted-foreground text-sm font-medium">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-sm font-medium">
                  <span>Shipping</span>
                  <span
                    className={
                      shippingFee === 0 ? "text-green-500" : "text-foreground"
                    }
                  >
                    {shippingFee === 0 ? "Free" : formatCurrency(shippingFee)}
                  </span>
                </div>

                <div className="flex justify-between font-black text-3xl pt-4 border-t border-border/50 items-baseline">
                  <span className="text-base font-bold uppercase tracking-widest text-muted-foreground">
                    Total
                  </span>
                  <span className="text-foreground">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>

                {/* Partial COD Breakdown */}
                <AnimatePresence>
                  {paymentMethod === "PARTIAL_COD" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 pt-2"
                    >
                      <div className="flex justify-between items-center p-3 rounded-xl bg-primary/5 border border-primary/20">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                          Pay Online Now
                        </span>
                        <span className="font-bold text-primary">
                          {formatCurrency(100)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-xl bg-muted/20 border border-border/50">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Due on Delivery
                        </span>
                        <span className="font-bold text-foreground">
                          {formatCurrency(finalTotal - 100)}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/20 p-4 rounded-2xl flex gap-3 text-xs text-orange-800 dark:text-orange-400">
              <div className="shrink-0 mt-0.5">⚠️</div>
              <p>
                Depending on your location, flashing high-velocity gear might
                cause minor sonic booms. Please wear protection.
              </p>
            </div>
          </div>
        </div>
        <Script
          id="razorpay-checkout-js"
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
          onLoad={() => {
            console.log("Razorpay script loaded via onLoad");
            setIsScriptLoaded(true);
          }}
        />
      </div>
    </div>
  );
}

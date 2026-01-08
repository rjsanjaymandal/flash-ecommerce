"use client";

import { useCartStore, selectCartTotal } from "@/store/use-cart-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useState, useTransition, useEffect } from "react";
import {
  Loader2,
  CheckCircle2,
  Ticket,
  ShieldCheck,
  Lock,
  CreditCard,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Script from "next/script";
import { createOrder, validateCoupon } from "./actions";
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
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const cartTotal = useCartStore(selectCartTotal);
  const clearCart = useCartStore((state) => state.clearCart);
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    type: "percentage" | "fixed";
    value: number;
  } | null>(null);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);

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

  // Shipping Logic
  const shippingFee = cartTotal >= 1000 ? 0 : 50;

  const finalTotal = Math.max(0, cartTotal - discountAmount + shippingFee);

  // Address Selection Handler
  const handleAddressSelect = (
    addr: Address,
    options?: { silent?: boolean }
  ) => {
    form.setValue("firstName", addr.name.split(" ")[0]);
    form.setValue("lastName", addr.name.split(" ").slice(1).join(" "));
    form.setValue(
      "address",
      addr.address_line1 + (addr.address_line2 ? `, ${addr.address_line2}` : "")
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
    setIsProcessing(true);

    try {
      // 1. Create Order & Items (using Server Action)
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
        items: items,
        coupon_code: appliedCoupon?.code,
        discount_amount: discountAmount,
        email: data.email,
      } as any);

      // 3. Create Razorpay Order
      // Security: We send the Order ID, not the amount. Server fetches amount from DB.
      const response = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: (order as any).id }),
      });
      const rzpOrder = await response.json();

      if (!response.ok)
        throw new Error(rzpOrder.error || "Failed to create Razorpay order");

      // 4. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "Flash Ecommerce",
        description: "Order Payment",
        order_id: rzpOrder.id,
        handler: async function (paymentResponse: any) {
          // 5. Verify Payment
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order_id: (order as any).id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();

          if (verifyData.verified) {
            setIsSuccess(true);
            clearCart();
          } else {
            toast.error("Payment verification failed. Please contact support.");
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
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (err: any) {
      console.error("Checkout failed detailed:", {
        message: err?.message,
        fullError: err,
      });
      toast.error(`Checkout failed: ${err?.message || "Unknown error"}`);
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center animate-in fade-in duration-500 relative overflow-hidden">
        <BrandGlow className="animate-pulse" />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] border-2 border-white/20 shadow-2xl relative z-10"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500" />

          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 mb-6">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">
              Payment Confirmed!
            </h1>
            <p className="text-zinc-500 font-medium">
              Your gear is on its way via Flash transmission.
            </p>
          </div>

          <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 text-sm text-zinc-600">
            <p>
              A confirmation email has been sent to{" "}
              <span className="font-bold text-zinc-900">{user?.email}</span>
            </p>
          </div>

          <Button
            asChild
            className="w-full h-14 text-sm font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
          >
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

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
                          <Input
                            placeholder="10001"
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

              {/* Payment Section - Read Only for now (Razorpay handled via script) */}
              <section className="space-y-6 bg-card/80 backdrop-blur-md p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-border/50 shadow-sm opacity-80">
                <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-foreground text-background font-bold text-sm">
                    2
                  </span>
                  <h2 className="text-xl font-black uppercase tracking-tight italic text-foreground">
                    Payment Method
                  </h2>
                </div>
                <div className="flex items-center gap-4 p-4 border border-border/50 rounded-xl bg-muted/20">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="font-bold text-sm text-foreground">
                      Cards, UPI, NetBanking
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Processed securely by Razorpay
                    </p>
                  </div>
                  <ShieldCheck className="ml-auto h-5 w-5 text-green-500" />
                </div>
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
                        Pay {formatCurrency(finalTotal)}
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
                    <span className="font-mono text-sm font-bold text-primary">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
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
              </div>
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
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
    </div>
  );
}

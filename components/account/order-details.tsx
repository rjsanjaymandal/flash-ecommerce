"use client";

import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Download,
} from "lucide-react";
import Link from "next/link";
import { BrandBadge } from "@/components/storefront/brand-badge";
import { motion, AnimatePresence } from "framer-motion";
import { BrandGlow } from "@/components/storefront/brand-glow";
import FlashImage from "@/components/ui/flash-image";
import { toast } from "sonner";

import { Tables } from "@/types/supabase";
import { TrackingTimeline } from "@/components/storefront/tracking-timeline";

interface OrderItemWithProduct extends Tables<"order_items"> {
  products: {
    name: string;
    main_image_url: string | null;
    slug: string;
    description: string | null;
  } | null;
}

interface OrderDetailsProps {
  order: Tables<"orders">;
  items: OrderItemWithProduct[];
}

export function OrderDetails({ order, items }: OrderDetailsProps) {
  const steps = [
    { status: "pending", label: "Order Placed", icon: Package },
    { status: "paid", label: "Payment Confirmed", icon: CheckCircle2 },
    { status: "shipped", label: "Shipped", icon: Truck },
    { status: "delivered", label: "Delivered", icon: MapPin },
  ];

  const currentStepIndex = steps.findIndex((s) => s.status === order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="relative min-h-screen bg-white">
      <BrandGlow className="top-0 left-[-10%] opacity-20" size="lg" />
      <BrandGlow className="bottom-[10%] right-[-5%] opacity-10" size="md" />

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-24 relative z-10">
        {/* Header - Technical Transmission Style */}
        <div className="mb-12 md:mb-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-6 flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4"
              >
                <Link
                  href="/account/orders"
                  className="h-10 w-10 rounded-full border-2 border-zinc-100 flex items-center justify-center hover:bg-zinc-50 transition-all group"
                >
                  <ArrowLeft className="h-4 w-4 text-zinc-400 group-hover:text-black transition-colors" />
                </Link>
                <span className="text-zinc-400 font-black tracking-[0.4em] uppercase text-[10px]">
                  Secure Transmission #{order.id.slice(0, 8)}
                </span>
              </motion.div>

              <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.8] md:leading-[0.75]">
                Order <br /> <span className="text-zinc-200">Details</span>
              </h1>

              <div className="flex flex-wrap items-center gap-4">
                <div className="px-4 py-2 bg-zinc-950 rounded-2xl flex items-center gap-3 shadow-xl">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-white text-[10px] font-black uppercase tracking-widest">
                    {order.status}
                  </span>
                </div>
                <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest h-fit">
                  Synchronized:{" "}
                  {new Date(order.created_at!).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="rounded-2xl border-2 h-14 px-8 uppercase font-black tracking-widest text-xs bg-white shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                onClick={() =>
                  toast.info("Invoice Generation Initialized", {
                    description:
                      "Terminal: Requesting PDF stream from secure server...",
                  })
                }
              >
                <Download className="mr-3 h-4 w-4" /> Get Invoice
              </Button>
            </div>
          </div>
        </div>

        {/* Unified Order Journey Hub */}
        <div className="mb-12 md:mb-16">
          <div className="bg-white rounded-[2.5rem] border-2 border-zinc-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="px-6 md:px-10 py-8 md:py-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="space-y-1">
                  <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">
                    Order <span className="text-primary">Journey</span>
                  </h2>
                  <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">
                    Real-time Status Transmission
                  </p>
                </div>
                {order.tracking_number && (
                  <div className="flex items-center gap-3 bg-zinc-50 px-4 py-2 rounded-2xl border border-zinc-100">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">
                        Active AWB
                      </span>
                      <span className="text-xs font-mono font-bold text-zinc-900 leading-none">
                        {order.tracking_number}
                      </span>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  </div>
                )}
              </div>

              {/* Lifecycle Bar */}
              {!isCancelled && (
                <div className="relative mb-12">
                  <div className="absolute top-5 left-0 w-full h-1 bg-zinc-100 -translate-y-1/2 rounded-full hidden md:block" />
                  <div className="grid grid-cols-2 gap-y-8 md:grid-cols-4 md:gap-4 relative">
                    {steps.map((step, i) => {
                      const completed =
                        i <= currentStepIndex || order.status === "delivered";
                      const current = i === currentStepIndex;

                      return (
                        <div
                          key={step.status}
                          className="relative z-10 flex flex-col items-center text-center"
                        >
                          <div
                            className={`
                            h-10 w-10 md:h-12 md:w-12 rounded-full border-4 flex items-center justify-center transition-all duration-500 mb-4 bg-white relative
                            ${completed ? "border-primary text-primary shadow-lg scale-110" : "border-zinc-100 text-zinc-300"}
                          `}
                          >
                            <step.icon className="h-4 w-4 md:h-5 md:w-5" />
                            {current && (
                              <div className="absolute -inset-2 bg-primary/10 rounded-full animate-pulse -z-10" />
                            )}
                            {(step.status === "shipped" ||
                              step.status === "delivered") &&
                              order.tracking_number && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                                </span>
                              )}
                          </div>
                          <span
                            className={`text-[10px] uppercase font-black tracking-widest ${completed ? "text-zinc-900" : "text-zinc-300"}`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Live Tracking Expansion */}
              {(order.status === "shipped" ||
                order.status === "delivered" ||
                order.tracking_number) && (
                <div className="mt-8 md:mt-12 pt-8 md:pt-12 border-t-2 border-dashed border-zinc-100 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-12 w-12 bg-zinc-950 rounded-2xl flex items-center justify-center shadow-xl">
                      <Truck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase italic tracking-tighter">
                        Live Shipment History
                      </h3>
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                        {order.tracking_number
                          ? `Granular status from central logistics`
                          : `Synchronization in progress`}
                      </p>
                    </div>
                  </div>

                  {order.tracking_number ? (
                    <div className="bg-zinc-50/50 rounded-[2rem] border-2 border-zinc-100 overflow-hidden">
                      <TrackingTimeline
                        awb={order.tracking_number}
                        className="p-4 md:p-6"
                      />
                    </div>
                  ) : (
                    <div className="bg-zinc-50/30 rounded-[2rem] border-2 border-dashed border-zinc-100 p-12 text-center">
                      <div className="h-16 w-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6 opacity-50 relative">
                        <Truck className="h-8 w-8 text-zinc-400" />
                        <div className="absolute inset-0 rounded-full border-2 border-zinc-200 animate-ping opacity-20" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 leading-relaxed max-w-[200px] mx-auto">
                        Shipment has been initialized. <br />
                        Real-time telemetry will <br />
                        appear here shortly.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
          {/* Items */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border-2 border-zinc-100 overflow-hidden shadow-sm">
              <div className="px-6 md:px-8 py-6 bg-zinc-50/50 border-b-2 border-zinc-100">
                <h3 className="font-black uppercase tracking-widest text-xs text-zinc-500">
                  Items Ordered
                </h3>
              </div>
              <div className="divide-y divide-zinc-100">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 md:p-10 flex flex-col sm:flex-row gap-6 md:gap-10 group hover:bg-zinc-50/30 transition-all duration-500"
                  >
                    <div className="h-32 w-32 md:h-40 md:w-32 bg-zinc-100 rounded-[2rem] overflow-hidden shrink-0 self-start shadow-xl border-4 border-white group-hover:scale-105 transition-transform duration-500 relative">
                      {item.products?.main_image_url ? (
                        <FlashImage
                          src={item.products.main_image_url}
                          alt={item.name_snapshot || "Product"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-100 flex items-center justify-center">
                          <Package className="h-8 w-8 text-zinc-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div className="space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                          <div className="space-y-1">
                            <Link
                              href={`/product/${item.products?.slug}`}
                              className="font-black text-2xl md:text-3xl tracking-tighter uppercase italic leading-none hover:text-primary transition-colors block"
                            >
                              {item.name_snapshot || item.products?.name}
                            </Link>
                            <div className="flex flex-wrap gap-2 pt-2">
                              <Badge
                                variant="outline"
                                className="rounded-full px-3 py-1 font-black text-[9px] uppercase border-2 text-zinc-400 group-hover:text-black group-hover:border-black transition-colors"
                              >
                                Size: {item.size}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="rounded-full px-3 py-1 font-black text-[9px] uppercase border-2 text-zinc-400 group-hover:text-black group-hover:border-black transition-colors"
                              >
                                Color: {item.color}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="rounded-full px-3 py-1 font-black text-[9px] uppercase border-2 text-zinc-400 group-hover:text-black group-hover:border-black transition-colors"
                              >
                                Qty: {item.quantity}
                              </Badge>
                            </div>
                          </div>
                          <p className="font-black text-2xl md:text-4xl tracking-tighter italic">
                            {formatCurrency(item.unit_price * item.quantity)}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-start items-center gap-4 mt-8">
                        <Button
                          variant="link"
                          asChild
                          className="text-primary p-0 h-auto text-[10px] font-black uppercase tracking-widest"
                        >
                          <Link href={`/product/${item.products?.slug}`}>
                            View Product Details
                          </Link>
                        </Button>
                        <Separator
                          orientation="vertical"
                          className="h-3 bg-zinc-200"
                        />
                        <Button
                          variant="link"
                          className="text-zinc-400 p-0 h-auto text-[10px] font-black uppercase tracking-widest hover:text-black"
                        >
                          Write Experience Review
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-zinc-950 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
              <h3 className="font-black uppercase tracking-widest text-xs text-white/50 mb-6">
                Order Summary
              </h3>

              <div className="space-y-4 mb-6 text-sm font-medium text-white/80">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {order.shipping_fee === 0
                      ? "Free"
                      : formatCurrency(order.shipping_fee ?? 0)}
                  </span>
                </div>
                {(order.discount_amount ?? 0) > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount_amount ?? 0)}</span>
                  </div>
                )}
              </div>
              <Separator className="bg-white/10 mb-6" />
              <div className="flex justify-between items-end">
                <span className="font-black uppercase tracking-widest text-xs">
                  Total
                </span>
                <span className="font-black text-3xl leading-none">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>

            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-8 border-2 border-zinc-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 bg-zinc-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-zinc-500" />
                </div>
                <h3 className="font-black uppercase tracking-widest text-xs text-zinc-500">
                  Shipping To
                </h3>
              </div>
              <p className="font-bold text-lg leading-none mb-2">
                {order.shipping_name || order.address_line1}
              </p>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                {order.address_line1} <br />
                {order.address_line2 && (
                  <>
                    {order.address_line2} <br />
                  </>
                )}
                {order.city}, {order.state} - {order.pincode} <br />
                {order.country}
              </p>
            </motion.div>
            {/* Help & Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-zinc-50 rounded-3xl p-8 border-2 border-zinc-100 flex flex-col gap-4"
            >
              <h3 className="font-black uppercase tracking-widest text-[10px] text-zinc-400 mb-2">
                Transmission Support
              </h3>
              <Button
                variant="outline"
                asChild
                className="w-full rounded-2xl border-2 h-12 uppercase font-black tracking-widest text-[10px] bg-white group cursor-pointer"
              >
                <Link href="/contact">
                  Contact Flash Command
                  <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="w-full rounded-2xl border-2 h-12 uppercase font-black tracking-widest text-[10px] bg-white group cursor-pointer"
              >
                <Link
                  href={`/contact?subject=shipping_anomaly&orderId=${order.id}`}
                >
                  Report Shipping Anomaly
                </Link>
              </Button>
              <p className="text-center text-[9px] font-bold text-zinc-300 uppercase tracking-widest mt-2">
                Encrypted Data Stream
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

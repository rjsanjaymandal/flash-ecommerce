import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Download,
  ShoppingBag,
} from "lucide-react";
import { BrandGlow } from "@/components/storefront/brand-glow";
import { Button } from "@/components/ui/button";
import NextImage from "next/image";
import imageLoader from "@/lib/image-loader";
import { createAdminClient } from "@/lib/supabase/admin";
import { OrderStatusListener } from "@/components/checkout/order-status-listener";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { id } = await params;

  // Use Admin Client to fetch order details securely server-side
  // We need admin client because policies might restrict "select" on orders
  // if the user was a guest logic wasn't fully set for strictly RLS on "viewing" unowned orders by ID.
  // Ideally, RLS allows "Users can see own orders".
  // But for a robust confirmation page that might be redirected to immediately (and session might be slighty lagging or guest),
  // fetching by ID is safe IF we don't expose sensitive info inappropriately.
  // Actually, let's try standard client first, assuming RLS allows "Users can view own".
  // If guest, we might need a secure token or just rely on the fact they have the UUID.
  // For now, let's use Admin to ensure we GET the data to show them, as they just paid.
  const supabase = createAdminClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        *,
        product:products (
          name,
          main_image_url
        )
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !order) {
    console.error("Order fetch error:", error);
    return notFound();
  }

  // Calculate estimated delivery (Mock: 5-7 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const deliveryDateString = deliveryDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen pt-28 pb-20 container mx-auto px-4 relative overflow-hidden">
      <OrderStatusListener orderId={order.id} initialStatus={order.status} />
      <BrandGlow className="top-0 animate-pulse opacity-40" />

      {/* Success Animation Decoration */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-green-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        {/* Header Section */}
        <div className="text-center space-y-6 animate-in slide-in-from-bottom-5 duration-700">
          <div className="inline-flex items-center justify-center p-3 bg-green-500/10 rounded-full mb-4 ring-1 ring-green-500/20 shadow-lg shadow-green-500/10">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground">
            Transmission <br />
            <span className="text-green-500">Successful</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto font-medium">
            Order{" "}
            <span className="font-mono font-bold text-foreground">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>{" "}
            confirmed.
            <br /> We are prepping your gear for high-velocity dispatch.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Col: Details */}
          <div className="lg:col-span-2 space-y-6 animate-in slide-in-from-left-5 duration-700 delay-100">
            {/* Status Card */}
            <div className="bg-card/50 backdrop-blur-md border border-green-500/20 rounded-[2rem] p-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600" />
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <Truck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Estimated Delivery</h3>
                  <p className="text-2xl font-black tracking-tight">
                    {deliveryDateString}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Shipping to{" "}
                    <span className="font-semibold text-foreground">
                      {order.city}, {order.state}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Items Card */}
            <div className="bg-card border border-border/50 rounded-[2rem] p-8 shadow-sm">
              <h3 className="font-black text-xl uppercase tracking-tight italic mb-6 flex items-center gap-2">
                <Package className="w-5 h-5" /> Cargo Manifest
              </h3>
              <div className="space-y-6">
                {order.order_items.map((item: any) => (
                  <div key={item.id} className="flex gap-4 items-center group">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
                      {item.product?.main_image_url ? (
                        <NextImage
                          src={item.product.main_image_url}
                          layout="fill"
                          objectFit="cover"
                          loader={imageLoader}
                          alt={item.name_snapshot}
                          className="group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary">
                          <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate">
                        {item.name_snapshot}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="bg-muted px-2 py-0.5 rounded text-xs font-mono">
                          {item.size}
                        </span>
                        <div
                          className="w-3 h-3 rounded-full border border-border"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>x {item.quantity}</span>
                      </div>
                    </div>
                    <div className="font-mono font-bold">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-border/50 space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span>
                    {order.shipping_fee === 0
                      ? "Free"
                      : formatCurrency(order.shipping_fee)}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-black border-t border-border/50 pt-4 mt-2">
                  <span>Total Paid</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Actions & Address */}
          <div className="space-y-6 animate-in slide-in-from-right-5 duration-700 delay-200">
            {/* Shipping Info */}
            <div className="bg-card border border-border/50 rounded-[2rem] p-8">
              <h3 className="font-black text-xl uppercase tracking-tight italic mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5" /> Destination
              </h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="font-bold text-foreground text-base">
                  {order.shipping_name}
                </p>
                <p>{order.address_line1}</p>
                {order.address_line2 && <p>{order.address_line2}</p>}
                <p>
                  {order.city}, {order.state} {order.pincode}
                </p>
                <p>{order.country}</p>
                <p className="pt-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {order.email}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                asChild
                className="w-full h-14 rounded-xl font-black uppercase tracking-widest text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
              >
                <Link href="/shop">
                  Continue Shopping <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl border-dashed"
              >
                <Download className="mr-2 w-4 h-4" /> Download Receipt
              </Button>
            </div>

            <div className="bg-muted/30 rounded-xl p-4 text-xs text-center text-muted-foreground">
              <ShieldCheck className="w-4 h-4 mx-auto mb-2 opacity-50" />
              <p>A confirmation email has been sent to your inbox.</p>
              <p>
                Need help? Contact{" "}
                <span className="underline">support@flashhfashion.in</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

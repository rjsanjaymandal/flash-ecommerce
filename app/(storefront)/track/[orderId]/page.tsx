import { OrderTimeline } from "@/components/storefront/order-timeline";
import { TrackingTimeline } from "@/components/storefront/tracking-timeline";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, MapPin, Package, Truck } from "lucide-react";
import FlashImage from "@/components/ui/flash-image";

export const revalidate = 0;

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*, products(*))")
    .eq("id", orderId)
    .single();

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-muted/20 py-12">
      <div className="container max-w-3xl mx-auto px-4">
        <Button
          variant="ghost"
          className="mb-8 pl-0 hover:pl-2 transition-all"
          asChild
        >
          <Link href="/account/orders">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>

        <div className="bg-card rounded-2xl shadow-sm border overflow-hidden mb-8">
          <div className="p-6 md:p-8 bg-gradient-to-br from-primary/5 via-transparent to-transparent border-b">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                  Order #{order.id.slice(0, 8)}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Placed on{" "}
                  {order.created_at
                    ? new Date(order.created_at).toLocaleDateString()
                    : "N/A"}{" "}
                  at{" "}
                  {order.created_at
                    ? new Date(order.created_at).toLocaleTimeString()
                    : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(order.total)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-12">
            <OrderTimeline
              status={order.status || "pending"}
              created_at={order.created_at || new Date().toISOString()}
              updated_at={
                order.updated_at || order.created_at || new Date().toISOString()
              }
            />

            {order.tracking_number && (
              <div className="mt-12 pt-12 border-t border-zinc-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter">
                      Live Shipment History
                    </h3>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                      AWB: {order.tracking_number}
                    </p>
                  </div>
                </div>
                <div className="bg-zinc-50/50 rounded-3xl border border-zinc-100 overflow-hidden">
                  <TrackingTimeline awb={order.tracking_number} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl shadow-sm border p-6">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-primary" />
              Shipping Details
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">
                {order.shipping_name}
              </p>
              <p>{order.address_line1}</p>
              {order.address_line2 && <p>{order.address_line2}</p>}
              <p>
                {order.city}, {order.state} {order.pincode}
              </p>
              <p>{order.country}</p>
              <p className="pt-2">{order.phone}</p>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-sm border p-6">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Package className="h-4 w-4 text-primary" />
              Order Items
            </h3>
            <div className="space-y-4">
              {order.order_items.map((item: any) => (
                <div key={item.id} className="flex gap-3 text-sm">
                  <div className="h-12 w-12 rounded-md bg-muted border overflow-hidden shrink-0">
                    {item.products?.main_image_url && (
                      <div className="relative h-full w-full">
                        <FlashImage
                          src={item.products.main_image_url}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium line-clamp-1">
                      {item.products?.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {item.size} / {item.color} x {item.quantity}
                    </p>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(item.unit_price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            {order.discount_amount && order.discount_amount > 0 ? (
              <div className="border-t mt-4 pt-3 flex justify-between text-sm text-green-600 font-medium">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount_amount)}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

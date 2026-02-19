"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Printer,
  MapPin,
  User,
  Package,
  CreditCard,
  Calendar,
  Truck,
} from "lucide-react";
import { TrackingTimeline } from "@/components/storefront/tracking-timeline";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const STATUS_OPTIONS = [
  "pending",
  "confirmed_partial",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
];

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;

      const { data: orderData } = await supabase
        .from("orders")
        .select("*, profiles:user_id(*)")
        .eq("id", id as string)
        .single();

      const { data: itemsData } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id as string);

      if (orderData) setOrder(orderData);
      if (itemsData) setItems(itemsData);
      setIsLoading(false);
    };
    fetchOrder();
  }, [id, supabase]);

  // Mutation for Status
  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus as any })
        .eq("id", id as string);
      if (error) throw error;
      return newStatus;
    },
    onSuccess: (newStatus) => {
      setOrder((prev: any) => ({ ...prev, status: newStatus }));
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success(`Order status updated to ${newStatus}`);
    },
    onError: (_err) => toast.error("Failed to update status"),
  });

  // Mutation for Tracking Number
  const trackingMutation = useMutation({
    mutationFn: async (trackingNumber: string) => {
      const { error } = await supabase
        .from("orders")
        .update({ tracking_number: trackingNumber as any })
        .eq("id", id as string);
      if (error) throw error;
      return trackingNumber;
    },
    onSuccess: (trackingNumber) => {
      setOrder((prev: any) => ({ ...prev, tracking_number: trackingNumber }));
      toast.success("Tracking number updated");
    },
    onError: (_err) => toast.error("Failed to update tracking number"),
  });

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading order details...
      </div>
    );
  if (!order)
    return (
      <div className="p-8 text-center text-destructive">Order not found</div>
    );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "paid":
        return "default";
      case "shipped":
        return "secondary";
      case "delivered":
        return "secondary"; // Using secondary/outline for clean look, could be green if configured
      case "cancelled":
        return "destructive";
      case "confirmed_partial":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 print:p-0 print:pb-0 print:max-w-none">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9 border-slate-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-slate-900">
              Order #{order.id.slice(0, 8)}
              <Badge
                variant={
                  getStatusColor(order.status) as
                    | "default"
                    | "secondary"
                    | "destructive"
                    | "outline"
                }
                className="uppercase text-[10px] tracking-wider font-semibold rounded-md px-2 py-0.5"
              >
                {order.status}
              </Badge>
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(order.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={order.status}
            onValueChange={(val) => statusMutation.mutate(val)}
            disabled={statusMutation.isPending}
          >
            <SelectTrigger className="w-[160px] h-9 bg-white">
              <SelectValue placeholder="Update Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-9 gap-2 bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          >
            <Link href={`/admin/orders/${order.id}/invoice`} target="_blank">
              <Printer className="h-4 w-4" />
              Print Invoice
            </Link>
          </Button>
        </div>
      </div>

      {/* Print Header (Visible only on print) */}
      <div className="hidden print:block mb-8 border-b pb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">INVOICE</h1>
            <p className="text-slate-500 mt-1">Order #{order.id}</p>
          </div>
          <div className="text-right">
            <div className="font-bold text-xl text-indigo-600">Flash</div>
            <p className="text-sm text-slate-500">123 Commerce St, Tech City</p>
            <p className="text-sm text-slate-500">support@flash.com</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* LEFT COL: Items & Summary */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 bg-muted rounded-md border flex items-center justify-center text-xs text-muted-foreground">
                        IMG
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">
                          {item.name_snapshot || "Product"}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {item.size && (
                            <Badge
                              variant="outline"
                              className="text-[10px] h-5 px-1.5"
                            >
                              {item.size}
                            </Badge>
                          )}
                          {item.color && (
                            <Badge
                              variant="outline"
                              className="text-[10px] h-5 px-1.5"
                            >
                              {item.color}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(item.unit_price)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                      <p className="font-medium text-sm mt-1">
                        {formatCurrency(item.unit_price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex-col items-end gap-2 border-t bg-muted/20 p-6">
              <div className="flex justify-between w-full max-w-xs text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>
                  {formatCurrency(
                    order.subtotal || order.total - (order.shipping_fee || 0),
                  )}
                </span>
              </div>
              <div className="flex justify-between w-full max-w-xs text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatCurrency(order.shipping_fee || 0)}</span>
              </div>
              <Separator className="my-2 w-full max-w-xs" />
              <div className="flex justify-between w-full max-w-xs font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* RIGHT COL: Customer & Shipping */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-muted-foreground" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                  {(order.profiles?.name ||
                    order.shipping_name ||
                    "G")[0].toUpperCase()}
                </div>
                <div className="text-sm">
                  <div className="font-medium">
                    {order.profiles?.name || order.shipping_name || "Guest"}
                  </div>
                  <div className="text-muted-foreground break-all">
                    {order.profiles?.email || "No email"}
                  </div>
                  <div className="text-muted-foreground">{order.phone}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">
                {order.shipping_name}
              </p>
              <p>{order.address_line1}</p>
              {order.address_line2 && <p>{order.address_line2}</p>}
              <p>
                {order.city}, {order.state} {order.pincode}
              </p>
              <p>{order.country}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-4 w-4 text-muted-foreground" />
                Shipment Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  AWB / Tracking Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue={order.tracking_number}
                    placeholder="Enter AWB Number"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") {
                        trackingMutation.mutate(
                          (e.target as HTMLInputElement).value,
                        );
                      }
                    }}
                    id="tracking-number-input"
                  />
                  <Button
                    size="sm"
                    className="h-9 px-3"
                    onClick={() => {
                      const input = document.getElementById(
                        "tracking-number-input",
                      ) as HTMLInputElement;
                      trackingMutation.mutate(input.value);
                    }}
                    disabled={trackingMutation.isPending}
                  >
                    {trackingMutation.isPending ? "..." : "Save"}
                  </Button>
                </div>
                {order.tracking_number && (
                  <Link
                    href={`/account/orders/${order.id}`}
                    target="_blank"
                    className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1 mt-1"
                  >
                    View Customer Page
                  </Link>
                )}
                {order.tracking_number && (
                  <div className="mt-4 pt-4 border-t border-zinc-100">
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-4">
                      Live AWB History
                    </p>
                    <div className="bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden">
                      <TrackingTimeline
                        awb={order.tracking_number}
                        className="scale-90 origin-top -translate-y-2 -mb-8"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <div className="flex justify-between items-center bg-muted/50 p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-background">
                    {order.payment_method ||
                      (order.total > 0 ? "PREPAID" : "COD")}
                  </Badge>
                  <span className="text-muted-foreground uppercase text-[10px] font-bold">
                    Method
                  </span>
                </div>
                <Badge
                  variant={order.status === "paid" ? "default" : "secondary"}
                  className={
                    order.status === "paid"
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : ""
                  }
                >
                  {order.status?.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Paid Amount</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(order.paid_amount || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Due Amount</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(order.due_amount || 0)}
                  </span>
                </div>
                {order.payment_reference && (
                  <div className="pt-2 text-[10px] text-muted-foreground break-all border-t">
                    Ref: {order.payment_reference}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

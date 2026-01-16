"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function OrderStatusListener({
  orderId,
  initialStatus,
  paymentId,
  paymentOrderId,
  signature,
}: {
  orderId: string;
  initialStatus: string;
  paymentId?: string;
  paymentOrderId?: string;
  signature?: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // 1. Idempotency Check
    if (initialStatus === "paid") return;

    // 2. Active Verification (Auto-Reconciliation)
    // If we land here with payment metadata but the order is still "pending",
    // trigger a verification immediately.
    if (paymentId && paymentOrderId && signature) {
      console.log("[StatusListener] Triggering Active Verification...");
      fetch("/api/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_order_id: paymentOrderId,
          razorpay_signature: signature,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.verified) {
            toast.success("Transmission Confirmed! Syncing state...");
            router.refresh();
          }
        })
        .catch((err) =>
          console.error("[StatusListener] Active verification failed:", err)
        );
    }

    // 3. Realtime Subscription (Primary)
    const channel = supabase
      .channel(`order-status-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload: any) => {
          if (payload.new.status === "paid" && payload.old.status !== "paid") {
            toast.success("Payment Confirmed! Updating status...");
            router.refresh();
          }
        }
      )
      .subscribe();

    // 4. Polling Fallback (Backup)
    // In case Realtime fails, check every 8 seconds for 40 seconds
    let pollCount = 0;
    const interval = setInterval(async () => {
      pollCount++;
      if (pollCount > 5) {
        clearInterval(interval);
        return;
      }

      console.log(`[StatusListener] Polling Sync Check #${pollCount}`);
      const { data } = await supabase
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .single();

      if (data?.status === "paid") {
        toast.success("Verification Synchronized!");
        router.refresh();
        clearInterval(interval);
      }
    }, 8000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [
    orderId,
    initialStatus,
    supabase,
    router,
    paymentId,
    paymentOrderId,
    signature,
  ]);

  return null; // Invisible component
}

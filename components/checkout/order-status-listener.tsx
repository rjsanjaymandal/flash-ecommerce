"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function OrderStatusListener({
  orderId,
  initialStatus,
}: {
  orderId: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // If already paid, no need to listen
    if (initialStatus === "paid") return;

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
            router.refresh(); // Refresh server component to show "Paid" UI
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, initialStatus, supabase, router]);

  return null; // Invisible component
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell, BellOff, BellRing } from "lucide-react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushOptIn() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  async function checkSubscription() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribe() {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          (process.env as any).NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub }),
      });

      if (response.ok) {
        setSubscription(sub);
        toast.success("Notifications enabled!", {
          description: "You will now receive mission updates in real-time.",
        });
      } else {
        throw new Error("Failed to save subscription");
      }
    } catch (err) {
      console.error(err);
      toast.error("Subscription failed", {
        description: "Please ensure notifications are allowed in your browser.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function unsubscribe() {
    setIsLoading(true);
    try {
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);
        toast.info("Notifications disabled");
      }
    } catch (err) {
      console.error(err);
      toast.error("Unsubscribe failed");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isSupported) return null;

  return (
    <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
      <div className="h-10 w-10 bg-zinc-950 rounded-xl flex items-center justify-center">
        {subscription ? (
          <BellRing className="h-5 w-5 text-primary animate-pulse" />
        ) : (
          <Bell className="h-5 w-5 text-white/50" />
        )}
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-black uppercase tracking-tight">
          Mission Telemetry
        </h3>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
          {subscription ? "Transmission Active" : "Real-time updates disabled"}
        </p>
      </div>
      <Button
        variant={subscription ? "outline" : "default"}
        size="sm"
        onClick={subscription ? unsubscribe : subscribe}
        disabled={isLoading}
        className="rounded-xl uppercase font-black text-[9px] tracking-widest"
      >
        {isLoading ? "Processing..." : subscription ? "Disable" : "Enable"}
      </Button>
    </div>
  );
}

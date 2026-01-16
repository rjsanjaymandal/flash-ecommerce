"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Send, Loader2, Megaphone } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminNotificationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    url: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Broadcast Sent!", {
          description: data.message,
        });
        setFormData({ title: "", message: "", url: "" });
      } else {
        throw new Error(data.error || "Failed to send broadcast");
      }
    } catch (err: any) {
      toast.error("Mission Failed", {
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-12">
        <div className="h-12 w-12 bg-zinc-950 rounded-2xl flex items-center justify-center shadow-xl">
          <Megaphone className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Notification <span className="text-zinc-400">Command</span>
          </h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">
            Global Push Broadcast System
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] border-2 border-zinc-100 p-8 md:p-12 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)]"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label className="uppercase font-black text-[10px] tracking-widest text-zinc-400 ml-4">
              Transmission Title
            </Label>
            <Input
              required
              placeholder="e.g. FLASH DROPPED"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="h-14 rounded-2xl border-2 focus:ring-0 focus:border-zinc-950 transition-all font-bold"
            />
          </div>

          <div className="space-y-2">
            <Label className="uppercase font-black text-[10px] tracking-widest text-zinc-400 ml-4">
              Signal Content
            </Label>
            <Textarea
              required
              placeholder="Enter the transmission message..."
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="min-h-[120px] rounded-3xl border-2 focus:ring-0 focus:border-zinc-950 transition-all font-medium py-6"
            />
          </div>

          <div className="space-y-2">
            <Label className="uppercase font-black text-[10px] tracking-widest text-zinc-400 ml-4">
              Destination URL (Optional)
            </Label>
            <Input
              placeholder="e.g. /shop/new-arrivals"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              className="h-14 rounded-2xl border-2 focus:ring-0 focus:border-zinc-950 transition-all font-mono text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-16 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-xl disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Processing Transmission...
              </>
            ) : (
              <>
                Initialize Global Broadcast
                <Send className="ml-3 h-5 w-5" />
              </>
            )}
          </Button>
        </form>
      </motion.div>

      <div className="mt-12 p-8 bg-zinc-50 rounded-3xl border-2 border-zinc-100">
        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">
          Protocol Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              VAPID Encryption Active
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Service Worker Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

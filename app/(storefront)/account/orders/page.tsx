import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OrdersTab } from "@/components/account/orders-tab";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { BrandGlow } from "@/components/storefront/brand-glow";

export const revalidate = 0;

export default async function OrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl relative min-h-screen overflow-x-hidden">
      <BrandGlow className="top-0 right-0 opacity-30" size="lg" />

      <div className="mb-12">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-8 rounded-full font-black uppercase tracking-widest text-[10px] bg-zinc-50 border-2 border-zinc-100 hover:bg-zinc-100 transition-all"
        >
          <Link href="/account" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <span className="text-zinc-400 font-black tracking-[0.4em] uppercase text-[10px]">
              Transmission History
            </span>
            <h1 className="text-4xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8] italic">
              MY <span className="text-zinc-200">ORDERS</span>
            </h1>
          </div>
          <p className="text-zinc-500 font-medium text-sm max-w-xs md:text-right uppercase tracking-widest italic">
            Monitor all your active and historical transmissions in the Flash
            network.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border-2 border-zinc-100 shadow-2xl overflow-hidden p-6 md:p-10">
        <OrdersTab orders={orders || []} />
      </div>
    </div>
  );
}

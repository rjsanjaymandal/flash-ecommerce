"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  ArrowUpRight,
  Activity,
  MessageSquare,
  Mail,
  Zap,
  Clock,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RevenueChart } from "@/components/admin/analytics/revenue-chart";
import { CategoryPieChart } from "@/components/admin/analytics/category-pie";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { type Order } from "@/lib/services/order-service";

interface DashboardStats {
  totalRevenue: number;
  revenueGrowth: number;
  averageOrderValue: number;
  totalOrders: number;
  orderGrowth: number;
  totalProducts: number;
}

interface DashboardOrder extends Order {}

interface DashboardActivity {
  id: string;
  type: "order" | "review" | "newsletter";
  title: string;
  description: string;
  time: string;
}

interface DashboardProduct {
  id: string;
  name: string;
  sale_count: number;
  main_image_url: string | null;
  categories?: {
    name: string;
  };
}

interface DashboardClientProps {
  stats: DashboardStats;
  recentOrders: DashboardOrder[];
  chartData: { name: string; total: number }[];
  categoryData: { name: string; value: number }[];
  activity?: DashboardActivity[];
  topProducts?: DashboardProduct[];
  waitlistStats?: { count: number; potentialRevenue: number };
}

export function DashboardClient({
  stats: initialStats,
  recentOrders: initialOrders,
  chartData,
  categoryData,
  activity: initialActivity = [],
  topProducts = [],
  waitlistStats,
}: DashboardClientProps) {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState(initialStats);
  const [recentOrders, setRecentOrders] = useState(initialOrders);
  const [activity, setActivity] = useState(initialActivity);

  // Real-time Sound Effect (optional)
  // const playNotification = () => new Audio('/sounds/ping.mp3').play().catch(() => {})

  useEffect(() => {
    setMounted(true);

    const supabase = createClient();

    // 1. ORDERS CHANNEL (Revenue, Stats, Activity)
    const orderChannel = supabase
      .channel("admin-dashboard-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const newOrder = payload.new as any;

          // Update Aggregate Stats
          setStats((prev) => ({
            ...prev,
            totalOrders: prev.totalOrders + 1,
            totalRevenue: prev.totalRevenue + (newOrder.total || 0),
            averageOrderValue:
              (prev.totalRevenue + (newOrder.total || 0)) /
              (prev.totalOrders + 1),
          }));

          // Add to Recent Orders
          setRecentOrders((prev) => [
            {
              id: newOrder.id,
              total: newOrder.total,
              status: newOrder.status || "pending",
              shipping_name: newOrder.shipping_name || "New Customer",
              created_at: newOrder.created_at || new Date().toISOString(),
            } as any,
            ...prev.slice(0, 4),
          ]);

          // Add to Activity Feed
          setActivity((prev) => [
            {
              id: `act-${Date.now()}`,
              type: "order",
              title: `New Order: ₹${newOrder.total}`,
              description: `Order #${newOrder.id.slice(0, 8)} received.`,
              time: new Date().toISOString(),
            },
            ...prev.slice(0, 9),
          ]);

          toast.success(`New Order: ₹${newOrder.total}`);
        }
      )
      .subscribe();

    // 2. PRODUCTS CHANNEL (Stock, Sales, Top Items)
    const productChannel = supabase
      .channel("admin-dashboard-products")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "products" },
        (payload) => {
          const updatedProduct = payload.new as any;

          // If sale_count changed, likely a sale
          if (updatedProduct.sale_count > (payload.old as any).sale_count) {
            // Update Top Products List if currently visible
            // (Note: accurate resorted list requires re-fetch, but we can patch local state for "Live" feel)
            // This is a simplified "Enterprise" patch
          }
        }
      )
      .subscribe();

    // 3. PROFILES CHANNEL (New Users)
    const profileChannel = supabase
      .channel("admin-dashboard-profiles")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "profiles" },
        (payload) => {
          setActivity((prev) => [
            {
              id: `act-user-${Date.now()}`,
              type: "newsletter", // Reusing icon for generic user
              title: `New User Signup`,
              description: `Someone just joined the ecosystem.`,
              time: new Date().toISOString(),
            },
            ...prev.slice(0, 9),
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(productChannel);
      supabase.removeChannel(profileChannel);
    };
  }, []);

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 bg-zinc-50/30 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <h2 className="text-3xl font-black tracking-tight uppercase italic flex items-center gap-3">
            <Zap className="h-8 w-8 text-primary fill-primary animate-pulse" />
            COMMAND{" "}
            <span className="text-muted-foreground font-light">CENTER</span>
          </h2>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-black uppercase tracking-widest animate-pulse"
            >
              ● System Online
            </Badge>
            <p className="text-muted-foreground text-xs font-medium">
              Intelligence feed active and synced.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex rounded-full border-2 font-bold uppercase tracking-widest text-[10px] h-10 px-6"
            asChild
          >
            <Link href="/admin/orders">Order History</Link>
          </Button>
          <Button
            size="sm"
            className="rounded-full shadow-xl shadow-primary/20 font-bold uppercase tracking-widest text-[10px] h-10 px-6"
          >
            Export Report
          </Button>
        </motion.div>
      </div>

      {/* Dynamic Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Revenue",
            value: `₹${stats.totalRevenue.toLocaleString()}`,
            growth: stats.revenueGrowth,
            icon: DollarSign,
            color: "emerald",
          },
          {
            title: "Avg. Order",
            value: `₹${Math.round(stats.averageOrderValue || 0).toLocaleString()}`,
            icon: ArrowUpRight,
            color: "blue",
            sub: "Ticket Size",
          },
          {
            title: "Total Orders",
            value: stats.totalOrders,
            growth: stats.orderGrowth,
            icon: ShoppingCart,
            color: "violet",
          },
          {
            title: "Active Catalog",
            value: stats.totalProducts,
            icon: Package,
            color: "amber",
            sub: "Live Items",
          },
          {
            title: "Waitlist Demand",
            value: waitlistStats?.count || 0,
            icon: Clock,
            color: "rose",
            sub: `Potential: ₹${(waitlistStats?.potentialRevenue || 0).toLocaleString()}`,
          },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-2 hover:border-primary/20 transition-all duration-500 group relative overflow-hidden h-full">
              <div
                className={cn(
                  "absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full opacity-[0.03] group-hover:scale-150 transition-transform duration-700",
                  item.color === "emerald" && "bg-emerald-500",
                  item.color === "blue" && "bg-blue-500",
                  item.color === "violet" && "bg-violet-500",
                  item.color === "amber" && "bg-amber-500",
                  item.color === "rose" && "bg-rose-500"
                )}
              />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  {item.title}
                </CardTitle>
                <div
                  className={cn(
                    "h-8 w-8 rounded-xl flex items-center justify-center border-2 transition-transform group-hover:rotate-12",
                    item.color === "emerald" &&
                      "bg-emerald-50 border-emerald-100 text-emerald-600",
                    item.color === "blue" &&
                      "bg-blue-50 border-blue-100 text-blue-600",
                    item.color === "violet" &&
                      "bg-violet-50 border-violet-100 text-violet-600",
                    item.color === "amber" &&
                      "bg-amber-50 border-amber-100 text-amber-600",
                    item.color === "rose" &&
                      "bg-rose-50 border-rose-100 text-rose-600"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-black italic tracking-tighter">
                  {item.value}
                </div>
                {item.growth !== undefined ? (
                  <p
                    className={cn(
                      "text-[10px] font-black uppercase tracking-tighter mt-1 flex items-center gap-1",
                      item.growth >= 0 ? "text-emerald-500" : "text-rose-500"
                    )}
                  >
                    {item.growth >= 0 ? (
                      <ArrowUpRight className="h-2.5 w-2.5" />
                    ) : (
                      <ArrowUpRight className="h-2.5 w-2.5 rotate-90" />
                    )}
                    {Math.abs(item.growth).toFixed(1)}% vs last month
                  </p>
                ) : (
                  <p className="text-[10px] font-black uppercase tracking-tighter mt-1 text-muted-foreground">
                    {item.sub}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart - Enhanced Glassmorphism */}
        <Card className="col-span-full lg:col-span-4 border-2 overflow-hidden bg-white/50 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black uppercase tracking-tighter italic">
                Growth Dynamics
              </CardTitle>
              <CardDescription>
                Performance trends for the current period.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge
                variant="secondary"
                className="rounded-full bg-zinc-100 text-zinc-600 font-bold uppercase text-[9px]"
              >
                2025
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            <RevenueChart data={chartData} />
          </CardContent>
        </Card>

        {/* Intelligence Feed - Premium List UI */}
        <Card className="col-span-full lg:col-span-3 border-2 bg-zinc-900 text-white overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
            <div>
              <CardTitle className="text-lg font-black uppercase tracking-tighter italic text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Live Signals
              </CardTitle>
              <CardDescription className="text-zinc-500">
                Real-time ecosystem events.
              </CardDescription>
            </div>
            <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
          </CardHeader>
          <CardContent className="flex-1 overflow-auto max-h-[400px] scrollbar-hide pt-6">
            <div className="space-y-6">
              {activity.length === 0 ? (
                <div className="text-center text-zinc-600 py-20 flex flex-col items-center gap-4">
                  <Zap className="h-10 w-10 opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-widest italic">
                    Monitoring in Progress...
                  </p>
                </div>
              ) : (
                activity.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-4 group cursor-default"
                  >
                    <div
                      className={cn(
                        "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border transition-all group-hover:scale-110 group-hover:border-white/20",
                        item.type === "order" &&
                          "bg-primary/20 border-primary/30 text-primary",
                        item.type === "review" &&
                          "bg-amber-500/20 border-amber-500/30 text-amber-500",
                        item.type === "newsletter" &&
                          "bg-blue-500/20 border-blue-500/30 text-blue-500"
                      )}
                    >
                      {item.type === "order" && (
                        <ShoppingCart className="h-5 w-5" />
                      )}
                      {item.type === "review" && (
                        <MessageSquare className="h-5 w-5" />
                      )}
                      {item.type === "newsletter" && (
                        <Mail className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 border-b border-white/5 pb-4">
                      <p className="text-sm font-black italic uppercase leading-none truncate group-hover:text-primary transition-colors">
                        {item.title}
                      </p>
                      <p className="text-xs text-zinc-500 truncate font-medium mt-1.5">
                        {item.description}
                      </p>
                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-zinc-700" />
                        {mounted
                          ? formatDistanceToNow(new Date(item.time), {
                              addSuffix: true,
                            })
                          : "Just now"}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
          <div className="p-4 bg-white/5 border-t border-white/10">
            <Button
              variant="ghost"
              className="w-full text-zinc-400 hover:text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-[0.2em] h-8"
            >
              View Intelligence Report
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Orders - Clean Management UI */}
        <Card className="col-span-full lg:col-span-4 border-2 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-zinc-50/50">
            <div>
              <CardTitle className="text-lg font-black uppercase tracking-tighter italic">
                Recent Transmissions
              </CardTitle>
              <CardDescription>Latest order signals received.</CardDescription>
            </div>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="font-bold border-2 rounded-full uppercase tracking-widest text-[10px] h-8 px-4 pr-3"
            >
              <Link href="/admin/orders" className="flex items-center gap-1">
                Log Book <ArrowUpRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="border-b-0 hover:bg-transparent">
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] px-6 h-12 text-muted-foreground">
                    Order
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] h-12 text-muted-foreground text-center">
                    Identity
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] h-12 text-muted-foreground text-center">
                    Status
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] pr-6 h-12 text-muted-foreground">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="hover:bg-zinc-50 transition-colors border-b group"
                  >
                    <TableCell className="font-mono text-[11px] text-zinc-400 group-hover:text-primary transition-colors flex items-center gap-2 px-6 py-4">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-200 group-hover:bg-primary transition-colors" />
                      #{order.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <span className="text-xs font-black uppercase italic tracking-tight">
                        {order.profiles?.name ||
                          order.shipping_name ||
                          "Anonymous"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          "uppercase text-[9px] font-bold px-3 py-0.5 rounded-full border-2",
                          order.status === "paid" &&
                            "bg-emerald-50 text-emerald-600 border-emerald-100",
                          order.status === "pending" &&
                            "bg-amber-50 text-amber-600 border-amber-100",
                          order.status === "shipped" &&
                            "bg-blue-50 text-blue-600 border-blue-100",
                          order.status === "delivered" &&
                            "bg-zinc-50 text-zinc-600 border-zinc-100"
                        )}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-black italic pr-6 text-sm py-4">
                      ₹{order.total.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Hot Products & Vibe Share */}
        <div className="col-span-full lg:col-span-3 space-y-6">
          <Card className="border-2 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-black uppercase tracking-tighter italic">
                Hot Inventory
              </CardTitle>
              <CardDescription>Top performing drops.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-xs font-bold uppercase italic tracking-widest">
                  Awaiting Data...
                </p>
              ) : (
                topProducts.map((product, i) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 group"
                  >
                    <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden border-2 group-hover:border-primary transition-colors relative">
                      {product.main_image_url ? (
                        <Image
                          src={product.main_image_url}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center">
                          <Package className="h-4 w-4 opacity-20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-black uppercase truncate italic group-hover:text-primary transition-colors">
                          {product.name}
                        </p>
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {product.sale_count} Sales
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className="text-[8px] h-4 py-0 font-black uppercase tracking-widest"
                        >
                          {product.categories?.name}
                        </Badge>
                        <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-1000 ease-out"
                            style={{
                              width: `${Math.min((product.sale_count / (topProducts[0]?.sale_count || 1)) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-2 overflow-hidden bg-zinc-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-black uppercase tracking-tighter italic">
                Vibe Share
              </CardTitle>
              <CardDescription>
                Category performance distribution.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center -mb-8">
              <CategoryPieChart data={categoryData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

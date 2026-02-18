"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SystemCard } from "@/components/admin/system-card";
import {
  IndianRupee,
  Package,
  ShoppingCart,
  ArrowUpRight,
  Activity,
  Mail,
  Zap,
  Clock,
  Loader2,
  TrendingUp,
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
import FlashImage from "@/components/ui/flash-image";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { type Order } from "@/lib/services/order-service";
import { findAndRecoverAbandonedCarts } from "@/app/actions/recovery-actions";
import { type AuditLog } from "@/lib/services/audit-service";

interface DashboardStats {
  totalRevenue: number;
  revenueGrowth: number;
  averageOrderValue: number;
  totalOrders: number;
  orderGrowth: number;
  totalProducts: number;
}

type DashboardOrder = Order;

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
  auditLogs?: AuditLog[];
  systemHealth?: { database: string; latency: string; status: string };
}

export function DashboardClient({
  stats: initialStats,
  recentOrders: initialOrders,
  chartData,
  categoryData,
  activity: initialActivity = [],
  topProducts = [],
  waitlistStats,
  auditLogs: initialAuditLogs = [],
  systemHealth,
}: DashboardClientProps) {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState(initialStats);
  const [recentOrders, setRecentOrders] = useState(initialOrders);
  const [activity, setActivity] = useState(initialActivity);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);
  const [isRecovering, setIsRecovering] = useState(false);

  const handleRecovery = async () => {
    setIsRecovering(true);
    try {
      const result = await findAndRecoverAbandonedCarts();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.message);
      }
    } catch (err) {
      toast.error("Failed to run recovery");
    } finally {
      setIsRecovering(false);
    }
  };

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
        (_payload) => {
          const newOrder = _payload.new as Order;

          // Update Aggregate Stats
          setStats((prev: DashboardStats) => ({
            ...prev,
            totalOrders: prev.totalOrders + 1,
            totalRevenue: prev.totalRevenue + (newOrder.total || 0),
            averageOrderValue:
              (prev.totalRevenue + (newOrder.total || 0)) /
              (prev.totalOrders + 1),
          }));

          // Add to Recent Orders
          setRecentOrders((prev: DashboardOrder[]) => [
            {
              id: newOrder.id,
              total: newOrder.total,
              status: newOrder.status || "pending",
              shipping_name: newOrder.shipping_name || "New Customer",
              created_at: newOrder.created_at || new Date().toISOString(),
            } as DashboardOrder,
            ...prev.slice(0, 4),
          ]);

          // Add to Activity Feed
          setActivity((prev: DashboardActivity[]) => [
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
        },
      )
      .subscribe();

    // 2. PRODUCTS CHANNEL (Stock, Sales, Top Items)
    const productChannel = supabase
      .channel("admin-dashboard-products")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "products" },
        (_payload) => {
          const updatedProduct = _payload.new as any;

          // If sale_count changed, likely a sale
          if (updatedProduct.sale_count > (_payload.old as any).sale_count) {
            // Update Top Products List if currently visible
            // (Note: accurate resorted list requires re-fetch, but we can patch local state for "Live" feel)
            // This is a simplified "Enterprise" patch
          }
        },
      )
      .subscribe();

    // 4. AUDIT CHANNEL
    const auditChannel = supabase
      .channel("admin-audit-logs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "admin_audit_logs" },
        (_payload) => {
          setAuditLogs((prev: AuditLog[]) => [
            _payload.new as AuditLog,
            ...prev.slice(0, 5),
          ]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(productChannel);
      supabase.removeChannel(auditChannel);
    };
  }, []);

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 bg-zinc-950 min-h-screen admin-theme">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <h2 className="text-2xl font-black tracking-[0.2em] uppercase flex items-center gap-3">
            <Zap className="h-6 w-6 text-brand-rust fill-brand-rust" />
            COMMAND <span className="text-zinc-600 font-light">CENTER</span>
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0 border-zinc-800",
                systemHealth?.status === "healthy"
                  ? "bg-emerald-500/5 text-emerald-500"
                  : "bg-amber-500/5 text-amber-500",
              )}
            >
              {systemHealth?.status === "healthy"
                ? "Live Signal: Active"
                : "Signal Degraded"}
            </Badge>
            {systemHealth && (
              <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900/50 px-3 py-1 border border-zinc-800">
                <span>Latency: {systemHealth.latency}</span>
                <span className="h-1 w-1 bg-zinc-800" />
                <span>DB Status: {systemHealth.database}</span>
              </div>
            )}
            <p className="hidden lg:block text-muted-foreground text-xs font-medium">
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
            onClick={handleRecovery}
            disabled={isRecovering}
            variant="outline"
            size="sm"
            className="hidden sm:flex rounded-none border-zinc-800 font-bold uppercase tracking-widest text-[9px] h-10 px-6 gap-2 bg-zinc-900/50"
          >
            {isRecovering ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Mail className="h-3 w-3 text-zinc-500" />
            )}
            {isRecovering ? "Syncing..." : "Recover Carts"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex rounded-none border-zinc-800 font-bold uppercase tracking-widest text-[9px] h-10 px-6 bg-zinc-900/50"
            asChild
          >
            <Link href="/admin/orders">Order Log</Link>
          </Button>
          <Button
            size="sm"
            className="rounded-none bg-white text-black hover:bg-zinc-200 font-bold uppercase tracking-widest text-[9px] h-10 px-6 transition-all"
          >
            Output Export
          </Button>
        </motion.div>
      </div>
      {/* Dynamic Stats Grid */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Revenue",
            value: `₹${stats.totalRevenue.toLocaleString()}`,
            growth: stats.revenueGrowth,
            icon: <IndianRupee className="h-4 w-4" />,
            color: "emerald",
            sub: "Total Earnings",
          },
          {
            title: "Avg. Order",
            value: `₹${Math.round(stats.averageOrderValue || 0).toLocaleString()}`,
            icon: <TrendingUp className="h-4 w-4" />,
            color: "blue",
            sub: "Ticket Size",
          },
          {
            title: "Orders",
            value: stats.totalOrders,
            growth: stats.orderGrowth,
            icon: <ShoppingCart className="h-4 w-4" />,
            color: "violet",
            sub: "Total Processed",
          },
          {
            title: "Catalog",
            value: stats.totalProducts,
            icon: <Package className="h-4 w-4" />,
            color: "amber",
            sub: "Active SKUs",
          },
        ].map((item, _i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: _i * 0.1 }}
          >
            <SystemCard
              title={item.title}
              subtitle={item.sub}
              icon={item.icon}
              className="h-full"
            >
              <div className="flex items-end justify-between">
                <div className="text-3xl font-black tracking-tighter text-white">
                  {item.value}
                </div>
              </div>
              {item.growth !== undefined && (
                <div
                  className={cn(
                    "mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider",
                    item.growth >= 0 ? "text-emerald-600" : "text-rose-600",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full",
                      item.growth >= 0 ? "bg-emerald-100" : "bg-rose-100",
                    )}
                  >
                    <ArrowUpRight
                      className={cn("h-3 w-3", item.growth < 0 && "rotate-90")}
                    />
                  </span>
                  {Math.abs(item.growth).toFixed(1)}% vs cycle
                </div>
              )}
            </SystemCard>
          </motion.div>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart - Enhanced Glassmorphism */}
        <div className="col-span-full lg:col-span-4">
          <SystemCard
            title="Growth Dynamics"
            subtitle="Performance trends for the current period"
            icon={<Zap className="h-4 w-4" />}
            className="h-full"
            action={
              <Badge
                variant="secondary"
                className="rounded-full bg-slate-100 text-slate-600 font-bold uppercase text-[9px] dark:bg-slate-800 dark:text-slate-400"
              >
                SESSION 26
              </Badge>
            }
          >
            <RevenueChart data={chartData} />
          </SystemCard>
        </div>

        {/* Intelligence Feed - Premium List UI */}
        <div className="col-span-full lg:col-span-3">
          <SystemCard
            title="Admin Audit Trail"
            subtitle="Recent administrative actions"
            icon={<Activity className="h-4 w-4 text-primary" />}
            className="h-full flex flex-col"
            action={
              <Badge variant="outline" className="text-[10px] uppercase">
                Secure
              </Badge>
            }
          >
            <div className="overflow-auto max-h-[400px] scrollbar-hide -mx-2 px-2">
              <div className="space-y-4">
                {auditLogs.length === 0 ? (
                  <div className="text-center text-zinc-600 py-20 flex flex-col items-center gap-4">
                    <Clock className="h-10 w-10 opacity-20" />
                    <p className="text-sm font-bold uppercase tracking-widest italic">
                      No Recent Logs
                    </p>
                  </div>
                ) : (
                  auditLogs.map((log, i) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-3 text-xs group"
                    >
                      <div
                        className={cn(
                          "h-8 w-8 shrink-0 rounded flex items-center justify-center border",
                          log.action_type === "CREATE" &&
                            "bg-emerald-50 text-emerald-600 border-emerald-100",
                          log.action_type === "UPDATE" &&
                            "bg-blue-50 text-blue-600 border-blue-100",
                          log.action_type === "DELETE" &&
                            "bg-rose-50 text-rose-600 border-rose-100",
                        )}
                      >
                        <Package className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold leading-tight">
                          <span className="uppercase text-muted-foreground">
                            {log.action_type}
                          </span>{" "}
                          {log.table_name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          ByID: {log.record_id.slice(0, 8)} •{" "}
                          {log.admin?.email || "System"}
                        </p>
                        <p className="text-[9px] text-zinc-500 font-black uppercase mt-1">
                          {mounted
                            ? formatDistanceToNow(
                                new Date(log.created_at || new Date()),
                              )
                            : "..."}{" "}
                          ago
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </SystemCard>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Orders - Clean Management UI */}
        <div className="col-span-full lg:col-span-4">
          <SystemCard
            title="Recent Transmissions"
            subtitle="Latest order signals received"
            icon={<Package className="h-4 w-4" />}
            className="h-full p-0"
            action={
              <Button
                asChild
                size="sm"
                variant="outline"
                className="font-bold border rounded-full uppercase tracking-widest text-[10px] h-7 px-4"
              >
                <Link href="/admin/orders" className="flex items-center gap-1">
                  Log Book <ArrowUpRight className="h-3 w-3" />
                </Link>
              </Button>
            }
          >
            <div className="overflow-hidden -mx-6 -my-6">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                  <TableRow className="border-b-0 hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] px-6 h-10 text-muted-foreground">
                      Order
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] h-10 text-muted-foreground text-center">
                      Identity
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] h-10 text-muted-foreground text-center">
                      Status
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] pr-6 h-10 text-muted-foreground">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/50 group"
                    >
                      <TableCell className="font-mono text-[11px] text-zinc-500 group-hover:text-primary transition-colors flex items-center gap-2 px-6 py-4">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 group-hover:bg-primary transition-colors" />
                        #{order.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <span className="text-xs font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300">
                          {order.profiles?.name ||
                            order.shipping_name ||
                            "Anonymous"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "uppercase text-[9px] font-bold px-2 py-0.5 rounded-md border",
                            order.status === "paid" &&
                              "bg-emerald-50 text-emerald-600 border-emerald-200",
                            order.status === "pending" &&
                              "bg-amber-50 text-amber-600 border-amber-200",
                            order.status === "shipped" &&
                              "bg-blue-50 text-blue-600 border-blue-200",
                            order.status === "delivered" &&
                              "bg-zinc-50 text-zinc-600 border-zinc-200",
                          )}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-black italic pr-6 text-sm py-4 tabular-nums">
                        ₹{order.total.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SystemCard>
        </div>

        {/* Hot Products & Vibe Share */}
        <div className="col-span-full lg:col-span-3 space-y-6">
          <SystemCard
            title="Hot Inventory"
            subtitle="Top performing drops"
            icon={<Zap className="h-4 w-4 text-amber-500" />}
          >
            <div className="space-y-4">
              {topProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-xs font-bold uppercase italic tracking-widest">
                  Awaiting Data...
                </p>
              ) : (
                topProducts.map((product, _i) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 group"
                  >
                    <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 relative shadow-sm">
                      {product.main_image_url ? (
                        <FlashImage
                          src={product.main_image_url}
                          alt={product.name}
                          fill
                          resizeMode="cover"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="h-full w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Package className="h-4 w-4 opacity-20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-black uppercase truncate italic group-hover:text-primary transition-colors">
                          {product.name}
                        </p>
                        <span className="text-[9px] font-black text-zinc-500 uppercase">
                          {product.sale_count} Units
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="secondary"
                          className="text-[8px] h-4 py-0 font-bold uppercase tracking-widest bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        >
                          {product.categories?.name}
                        </Badge>
                        <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
            </div>
          </SystemCard>

          <SystemCard
            title="Vibe Share"
            subtitle="Category performance"
            icon={<Clock className="h-4 w-4 text-violet-500" />}
          >
            <div className="flex justify-center -my-4">
              <CategoryPieChart data={categoryData} />
            </div>
          </SystemCard>
        </div>
      </div>
    </div>
  );
}

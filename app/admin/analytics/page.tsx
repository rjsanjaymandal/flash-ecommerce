"use client";

import { useState, useTransition, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  DollarSign,
  Users,
  ShoppingBag,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { RevenueChart } from "@/components/admin/analytics/revenue-chart";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
  const [range, setRange] = useState("30");
  const [isPending, startTransition] = useTransition();
  const [metrics, setMetrics] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(range));

      // 1. Summary
      const { data: summary } = await supabase.rpc("get_analytics_summary", {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

      // 2. Chart
      const { data: sales } = await supabase.rpc("get_sales_over_time", {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        interval_val: parseInt(range) <= 2 ? "hour" : "day",
      });

      // 3. Top Products
      const { data: top } = await supabase.rpc("get_top_products_by_revenue", {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        limit_val: 5,
      });

      setMetrics(summary?.[0] || {});
      setChartData(
        (sales || []).map((s: any) => ({
          name: new Date(s.date_bucket).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: parseInt(range) <= 2 ? "numeric" : undefined,
          }),
          total: s.total_sales,
        }))
      );
      setTopProducts(top || []);
      setLoading(false);
    };

    fetchData();
  }, [range]);

  const kpiCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(metrics?.total_revenue || 0),
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Total Orders",
      value: metrics?.total_orders || 0,
      icon: ShoppingBag,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Average Order Value",
      value: formatCurrency(metrics?.average_order_value || 0),
      icon: TrendingUp,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      title: "Returning Rate",
      value: `${Math.round(metrics?.returning_customer_percentage || 0)}%`,
      icon: Users,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 min-h-screen bg-zinc-50/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight italic">
            Analytics Studio
          </h2>
          <p className="text-muted-foreground font-medium">
            Deep dive into store performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[180px] font-bold">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 3 Months</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpiCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-2 hover:border-primary/20 transition-all">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-black uppercase tracking-wider text-muted-foreground">
                      {card.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${card.bg}`}>
                      <card.icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-black italic tracking-tighter">
                      {card.value}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-7">
            <Card className="col-span-4 border-2">
              <CardHeader>
                <CardTitle className="font-black uppercase italic">
                  Revenue Over Time
                </CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <RevenueChart data={chartData} />
              </CardContent>
            </Card>

            <Card className="col-span-3 border-2">
              <CardHeader>
                <CardTitle className="font-black uppercase italic">
                  Top Products (Revenue)
                </CardTitle>
                <CardDescription>
                  Best performing items this period.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {topProducts.map((product, i) => (
                    <div
                      key={product.product_id}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="font-mono text-muted-foreground text-sm w-4">
                          0{i + 1}
                        </div>
                        <div>
                          <p className="font-bold text-sm truncate max-w-[150px] group-hover:text-primary transition-colors">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.units_sold} units sold
                          </p>
                        </div>
                      </div>
                      <div className="font-black italic">
                        {formatCurrency(product.revenue)}
                      </div>
                    </div>
                  ))}
                  {topProducts.length === 0 && (
                    <p className="text-center text-muted-foreground py-10 font-bold uppercase text-xs">
                      No sales yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

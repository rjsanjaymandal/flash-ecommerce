import {
  getStats,
  getMonthlyRevenue,
  getOrders,
  getSalesByCategory,
  getRecentActivity,
  getTopProducts,
} from "@/lib/services/order-service";
import { getWaitlistStats } from "@/app/actions/admin-preorder";
import { DashboardClient } from "./dashboard-client";
import { requireAdmin } from "@/lib/auth/utils";

export const revalidate = 0;

export default async function AdminDashboard() {
  await requireAdmin();

  const [
    stats,
    chartData,
    categoryData,
    { data: recentOrders },
    activity,
    topProducts,
    waitlistStats,
  ] = await Promise.all([
    getStats(),
    getMonthlyRevenue(),
    getSalesByCategory(),
    getOrders({ limit: 5 }),
    getRecentActivity(8),
    getTopProducts(5),
    getWaitlistStats(),
  ]);

  return (
    <DashboardClient
      stats={stats}
      chartData={chartData}
      categoryData={categoryData}
      recentOrders={recentOrders}
      activity={activity}
      topProducts={topProducts.map((product) => ({
        ...product,
        sale_count: 0, // Placeholder as we don't have this metric yet
        categories: product.categories || undefined,
      }))}
      waitlistStats={waitlistStats}
    />
  );
}

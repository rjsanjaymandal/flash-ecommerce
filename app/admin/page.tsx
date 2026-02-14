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
    auditLogs,
    systemHealth,
  ] = await Promise.all([
    getStats(),
    getMonthlyRevenue(),
    getSalesByCategory(),
    getOrders({ limit: 5 }),
    getRecentActivity(8),
    getTopProducts(5),
    getWaitlistStats(),
    import("@/lib/services/audit-service").then((mod) =>
      mod.getRecentAuditLogs(6),
    ),
    import("@/lib/services/audit-service").then((mod) => mod.getSystemHealth()),
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
        sale_count: (product as any).sale_count || 0,
        categories: product.categories || undefined,
      }))}
      waitlistStats={waitlistStats}
      auditLogs={auditLogs}
      systemHealth={systemHealth}
    />
  );
}

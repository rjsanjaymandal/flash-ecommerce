import { getStats, getMonthlyRevenue, getOrders, getSalesByCategory, getRecentActivity, getTopProducts } from '@/lib/services/order-service' 
import { getWaitlistStats } from '@/app/actions/admin-preorder'
import { DashboardClient } from './dashboard-client'

export const revalidate = 0

export default async function AdminDashboard() {
  const [stats, chartData, categoryData, { data: recentOrders }, activity, topProducts, waitlistStats] = await Promise.all([
    getStats(),
    getMonthlyRevenue(),
    getSalesByCategory(),
    getOrders({ limit: 5 }),
    getRecentActivity(8),
    getTopProducts(5),
    getWaitlistStats()
  ])

  return (
    <DashboardClient 
        stats={stats} 
        chartData={chartData} 
        categoryData={categoryData} 
        recentOrders={recentOrders} 
        activity={activity}
        topProducts={topProducts}
        waitlistStats={waitlistStats}
    />
  )
}

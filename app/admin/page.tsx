import { getStats, getMonthlyRevenue, getOrders, getSalesByCategory, getRecentActivity } from '@/lib/services/order-service' 
import { DashboardClient } from './dashboard-client'

export const revalidate = 0

export default async function AdminDashboard() {
  const stats = await getStats()
  const chartData = await getMonthlyRevenue()
  const categoryData = await getSalesByCategory()
  const { data: recentOrders } = await getOrders({ limit: 5 })
  const activity = await getRecentActivity(8)

  return <DashboardClient stats={stats} chartData={chartData} categoryData={categoryData} recentOrders={recentOrders} activity={activity} />
}

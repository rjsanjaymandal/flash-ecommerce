import { getStats, getMonthlyRevenue, getOrders } from '@/lib/services/order-service' 
import { DashboardClient } from './dashboard-client'

export const revalidate = 0

export default async function AdminDashboard() {
  const stats = await getStats()
  const chartData = await getMonthlyRevenue()
  const { data: recentOrders } = await getOrders({ limit: 5 })

  return <DashboardClient stats={stats} chartData={chartData} recentOrders={recentOrders} />
}

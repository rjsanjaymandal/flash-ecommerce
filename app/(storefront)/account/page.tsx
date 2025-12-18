import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProducts } from "@/lib/services/product-service"
import { AccountClient } from "@/components/account/account-client"

export default async function AccountPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
      redirect('/login')
  }

  // Parallel data fetching
  const [profileData, ordersData, trendingData] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      getProducts({ limit: 4, sort: 'trending', is_active: true })
  ])

  const profile = profileData.data
  const orders = ordersData.data || []
  const recommendations = trendingData.data || []

  return (
    <AccountClient 
        user={user} 
        profile={profile} 
        orders={orders} 
        recommendations={recommendations} 
    />
  )
}

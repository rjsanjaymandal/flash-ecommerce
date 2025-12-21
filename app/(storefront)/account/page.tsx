import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProducts, getWaitlistedProducts } from "@/lib/services/product-service"
import { AccountClient } from "@/components/account/account-client"

export default async function AccountPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
      redirect('/login')
  }

  // Parallel data fetching
  const [profileData, ordersData, addressesData, waitlistData] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }),
      getWaitlistedProducts(user.id)
  ])

  const profile = profileData.data
  const orders = ordersData.data || []
  const addresses = addressesData.data || []
  const waitlistedProducts = waitlistData || []

  return (
    <AccountClient 
        user={user} 
        profile={profile!} 
        orders={orders} 
        addresses={addresses}
        waitlist={waitlistData}
    />
  )
}

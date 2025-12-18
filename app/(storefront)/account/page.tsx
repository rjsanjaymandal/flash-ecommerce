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
  const [profileData, ordersData, trendingData, addressesData, waitlistData] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      getProducts({ limit: 4, sort: 'trending', is_active: true }),
      supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }),
      getWaitlistedProducts(user.id)
  ])

  const profile = profileData.data
  const orders = ordersData.data || []
  const recommendations = trendingData.data || []
  const addresses = addressesData.data || []
  const waitlistedProducts = (await Promise.all([profileData, ordersData, trendingData, addressesData, getWaitlistedProducts(user.id)]))[4] as any[] || []
  
  // Wait, I messed up the destructuring above in the previous step because I added it to the array but didn't update the destructuring var name in line 16.
  // I need to correct the destructuring in the previous Logic or just use the array index.
  // Actually, I can just fix the Promise.all line in a cleaner way.
  // Let me re-do the Promise.all logic in one go with proper naming.
  
  // Actually the previous tool call replaced lines 19-21. 
  // Line 16 is: const [profileData, ordersData, trendingData, addressesData] = ...
  // So the 5th element is ignored.
  // I should update line 16 as well. I'll do that now.

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

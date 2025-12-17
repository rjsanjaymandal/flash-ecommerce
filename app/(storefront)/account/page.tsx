import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileTab } from "@/components/account/profile-tab"
import { OrdersTab } from "@/components/account/orders-tab"
import { WishlistTab } from "@/components/account/wishlist-tab"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { SignOutButton } from "@/components/account/sign-out-button"

export default async function AccountPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
      redirect('/login')
  }

  // Parallel data fetching
  const [profileData, ordersData] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  ])

  const profile = profileData.data
  const orders = ordersData.data || []

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in slide-in-from-top-4 duration-500">
            <div>
                <h1 className="text-4xl font-black tracking-tight mb-2">My Dashboard</h1>
                <p className="text-muted-foreground text-lg">
                    Welcome back, <span className="font-bold text-foreground">{profile?.name || user.email?.split('@')[0]}</span>
                </p>
            </div>
            <SignOutButton />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-8 animate-in fade-in duration-700">
            <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 scrollbar-hide">
                <TabsList className="bg-muted/50 p-1 rounded-full inline-flex h-auto w-full md:w-auto justify-start md:justify-center">
                <TabsTrigger value="overview" className="rounded-full px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                    Overview & Orders
                </TabsTrigger>
                <TabsTrigger value="profile" className="rounded-full px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                    Profile Settings
                </TabsTrigger>
                <TabsTrigger value="wishlist" className="rounded-full px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                   Saved Items
                </TabsTrigger>
            </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
                    <OrdersTab orders={orders} />
                </div>
            </TabsContent>

            <TabsContent value="profile">
                <div className="max-w-2xl">
                     <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
                     <ProfileTab user={user} profile={profile} />
                </div>
            </TabsContent>
            
            <TabsContent value="wishlist">
                 <div>
                    <h2 className="text-2xl font-bold mb-6">Your Wishlist</h2>
                    <WishlistTab />
                </div>
            </TabsContent>
        </Tabs>
    </div>
  )
}

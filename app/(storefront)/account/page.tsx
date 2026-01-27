import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getWaitlistedProducts } from "@/lib/services/product-service";
import { AccountClient } from "@/components/account/account-client";
import { Database, Tables } from "@/types/supabase";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Parallel data fetching
  const [profileData, ordersData, addressesData, waitlistData] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false }),
      getWaitlistedProducts(user.id),
    ]);

  const profile = profileData.data;
  const orders = ordersData.data || [];
  const addresses = addressesData.data || [];
  const waitlistedProducts = waitlistData || [];

  // If we have a user but no profile, something is wrong with DB sync
  // but we can still show the account client with a placeholder profile
  const safeProfile: Tables<"profiles"> = profile || {
    id: user.id,
    name: user.email?.split("@")[0] || "User",
    role: "customer" as Database["public"]["Enums"]["user_role"],
    loyalty_points: 0,
    pronouns: null,
    fit_preference: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <AccountClient
      user={user}
      profile={safeProfile}
      orders={orders}
      addresses={addresses}
      waitlist={waitlistedProducts}
    />
  );
}

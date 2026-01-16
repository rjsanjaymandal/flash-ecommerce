import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { OrderDetails } from "@/components/account/order-details";

export default async function OrderPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch Order & Verify Ownership
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id) // Security Check
    .single();

  if (!order) {
    notFound();
  }

  // Fetch Items with Product Details (Joined)
  const { data: items } = await supabase
    .from("order_items")
    .select(
      `
            *,
            products (
                name,
                main_image_url,
                slug,
                description
            )
        `
    )
    .eq("order_id", order.id);

  return (
    <div className="min-h-screen bg-background">
      <OrderDetails order={order} items={items || []} />
    </div>
  );
}

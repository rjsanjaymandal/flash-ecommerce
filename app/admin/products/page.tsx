import { getProductsSecure } from "@/lib/services/product-service";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProductsClient } from "./products-client";

export const revalidate = 0; // Ensure fresh data on every request for admin
// Rebuild trigger: Force update for new preorder service logic

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.q || "";

  const adminClient = createAdminClient();
  const { data: products, meta } = await getProductsSecure(
    {
      page,
      search,
      limit: 10,
      sort: "newest",
    },
    adminClient,
  );

  const typedProducts = (products || []).map((p) => ({
    ...p,
    created_at: p.created_at || new Date().toISOString(),
    is_active: p.is_active || false,
    is_carousel_featured: !!p.is_carousel_featured,
    category_id: p.category_id || undefined,
    product_stock: p.product_stock?.map((s) => ({
      ...s,
      quantity: s.quantity || 0,
      product_id: s.product_id || null,
    })),
  }));

  return <ProductsClient initialProducts={typedProducts} meta={meta} />;
}

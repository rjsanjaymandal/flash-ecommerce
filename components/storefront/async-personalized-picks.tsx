import { getProducts } from "@/lib/services/product-service";
import { PersonalizedPicks } from "@/components/storefront/personalized-picks";

export async function AsyncPersonalizedPicks() {
  const { data: picks } = await getProducts({
    is_active: true,
    limit: 100,
    sort: "random",
  });

  return <PersonalizedPicks products={picks || []} />;
}

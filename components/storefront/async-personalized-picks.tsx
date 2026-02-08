import { getProducts, type Product } from "@/lib/services/product-service";
import { PersonalizedPicks } from "@/components/storefront/personalized-picks";

export async function AsyncPersonalizedPicks() {
  let picks: Product[] | null = [];
  try {
    const { data } = await getProducts({
      is_active: true,
      limit: 100,
      sort: "random",
    });
    picks = data;
  } catch (error) {
    console.error("[AsyncPersonalizedPicks] Failed to fetch:", error);
  }

  return <PersonalizedPicks products={picks || []} />;
}

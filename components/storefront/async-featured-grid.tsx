import {
  getFeaturedProducts,
  type Product,
} from "@/lib/services/product-service";
import { FeaturedGrid } from "@/components/storefront/featured-grid";

export async function AsyncFeaturedGrid() {
  let products: Product[] = [];
  try {
    products = await getFeaturedProducts();
  } catch (error) {
    console.error("[AsyncFeaturedGrid] Failed to fetch:", error);
  }

  return (
    <FeaturedGrid
      products={products || []}
      title="NEW ARRIVALS"
      subtitle="The latest drops and freshest fits, curated just for you."
      badge="Just In"
    />
  );
}

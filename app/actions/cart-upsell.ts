'use server'

import { getFeaturedProducts, Product } from "@/lib/services/product-service"
import { createStaticClient } from "@/lib/supabase/server"

function normalizeProduct(product: Product): Product {
  return { ...product, total_stock: product.total_stock ?? 0 };
}

export async function getUpsellProducts(
  categoryIds: string[] = [],
  inCartIds: string[] = [],
): Promise<Product[]> {
  const supabase = createStaticClient();

  let products: Product[] = [];

  // 1. Fetch products from the same categories (Affinity)
  if (categoryIds.length > 0) {
    const { data: categoryProducts } = await supabase
      .from("products")
      .select("*, categories(name), product_stock(*)")
      .in("category_id", categoryIds)
      .eq("status", "active")
      .not("id", "in", `(${(inCartIds.length > 0 ? inCartIds : ["00000000-0000-0000-0000-000000000000"]).join(",")})`)
      .limit(20);

    if (categoryProducts) {
      products = (categoryProducts as Product[])
        .map(normalizeProduct)
        .filter((p) => p.product_stock?.some((s) => (s.quantity ?? 0) > 0));
    }
  }

  // 2. Complementary Logic: If we have items, look for complementary tags
  if (products.length < 8 && inCartIds.length > 0) {
    // Get tags of items in cart
    const { data: cartProducts } = await supabase
      .from("products")
      .select("expression_tags")
      .in("id", inCartIds);

    const allTags = Array.from(
      new Set(cartProducts?.flatMap((p) => p.expression_tags || []) || []),
    );

    if (allTags.length > 0) {
      const { data: complementary } = await supabase
        .from("products")
        .select("*, categories(name), product_stock(*)")
        .contains("expression_tags", allTags)
        .eq("status", "active")
        .not("id", "in", `(${(inCartIds.concat(products.map((p) => p.id))).join(",")})`)
        .limit(10);

      if (complementary) {
        products = [...products, ...(complementary as Product[]).map(normalizeProduct)].filter(
          (p) => p.product_stock?.some((s) => (s.quantity ?? 0) > 0),
        );
      }
    }
  }

  // 3. Fallback to featured
  if (products.length < 4) {
    const featured = await getFeaturedProducts();
    const additional = featured.filter((p) => {
      const isInCart = inCartIds.includes(p.id);
      const isAlreadySuggested = products.some((prev) => prev.id === p.id);
      const hasStock = p.product_stock?.some((s) => (s.quantity ?? 0) > 0);
      return !isInCart && !isAlreadySuggested && hasStock;
    });
    products = [...products, ...additional];
  }

  // Final limit and return
  return products.slice(0, 10);
}

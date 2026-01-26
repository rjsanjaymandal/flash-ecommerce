'use server'

import { getFeaturedProducts, Product } from "@/lib/services/product-service"
import { createStaticClient } from "@/lib/supabase/server"

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
      .eq("is_active", true)
      .not("id", "in", `(${inCartIds.length > 0 ? inCartIds.join(",") : "00000000-0000-0000-0000-000000000000"})`)
      .limit(20);

    if (categoryProducts) {
      products = categoryProducts.filter((p) =>
        p.product_stock?.some((s: any) => s.quantity > 0),
      );
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
        .eq("is_active", true)
        .not("id", "in", `(${(inCartIds.concat(products.map((p) => p.id))).join(",")})`)
        .limit(10);

      if (complementary) {
        products = [...products, ...complementary].filter((p) =>
          p.product_stock?.some((s: any) => s.quantity > 0),
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
      const hasStock = p.product_stock?.some((s: any) => s.quantity > 0);
      return !isInCart && !isAlreadySuggested && hasStock;
    });
    products = [...products, ...additional];
  }

  // Final limit and return
  return products.slice(0, 10);
}

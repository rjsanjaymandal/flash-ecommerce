"use server";

import { getProducts, ProductFilter } from "@/lib/services/product-service";

export async function fetchMoreProducts(page: number, params: any) {
  try {
    const limit = 24; // Standard grid size per page (increased from 12 for 4-col grid)
    const filter: ProductFilter = {
      is_active: true,
      category_id: params.category,
      sort: params.sort,
      min_price: params.min_price ? Number(params.min_price) : undefined,
      max_price: params.max_price ? Number(params.max_price) : undefined,
      size: params.size,
      color: params.color,
      search: params.q,
      page: page,
      limit: limit,
    };

    const { data, meta } = await getProducts(filter);
    
    // Artificial delay for smooth UX (optional, remove for speed)
    // await new Promise((resolve) => setTimeout(resolve, 500));

    return { success: true, data, meta };
  } catch (error) {
    console.error("Error fetching more products:", error);
    return { success: false, error: "Failed to load products" };
  }
}

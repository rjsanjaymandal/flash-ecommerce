import { createClient } from "@/lib/supabase/server";
import { getLinearCategories } from "@/lib/services/category-service";
import { getProductColors } from "@/lib/services/color-service";
import EditProductPageClient from "../edit-product-page";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const supabase = await createClient();

  // Fetch all needed data on Server
  const [categories, colors, { data: product }, { data: stock }] =
    await Promise.all([
      getLinearCategories(),
      getProductColors(),
      supabase.from("products").select("*").eq("id", id).single(),
      supabase.from("product_stock").select("*").eq("product_id", id),
    ]);

  if (!product) {
    notFound();
  }

  // Create color map
  const colorMap: Record<string, string> = {};
  colors.forEach((c) => {
    colorMap[c.name] = c.hex_code;
  });

  return (
    <EditProductPageClient
      product={product}
      stock={stock || []}
      categories={categories || []}
      colorOptions={colors.map((c) => c.name)}
      colorMap={colorMap}
    />
  );
}

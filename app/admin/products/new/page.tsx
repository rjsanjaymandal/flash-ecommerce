import { getLinearCategories } from "@/lib/services/category-service";
import { getProductColors } from "@/lib/services/color-service";
import CreateProductPageClient from "../create-product-page";

export const revalidate = 0;

export default async function NewProductPage() {
  const [categories, colors] = await Promise.all([
    getLinearCategories(),
    getProductColors(),
  ]);

  // Create color map
  const colorMap: Record<string, string> = {};
  colors.forEach((c) => {
    colorMap[c.name] = c.hex_code;
  });

  return (
    <CreateProductPageClient
      categories={categories || []}
      colorOptions={colors.map((c) => c.name)}
      colorMap={colorMap}
    />
  );
}

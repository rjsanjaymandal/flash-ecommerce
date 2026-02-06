import { getProductColors } from "@/lib/services/color-service";
import ColorsClient from "./colors-client";

export const metadata = {
  title: "Color Management | Admin",
};

export default async function ColorsPage() {
  const initialColors = await getProductColors();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Attributes: Colors
          </h2>
          <p className="text-muted-foreground">
            Manage product color variants and their visual hex codes.
          </p>
        </div>
      </div>
      <ColorsClient initialColors={initialColors} />
    </div>
  );
}

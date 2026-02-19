"use client";

import { ProductForm } from "@/components/admin/products/product-form";
import { ProductFormValues } from "@/lib/validations/product";
import { updateProduct } from "@/lib/services/product-service";
import { slugify } from "@/lib/slugify";
import { useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import { toast } from "sonner";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tables } from "@/types/supabase";
import { Category } from "@/types/store-types";
import { cn } from "@/lib/utils";

export default function EditProductPageClient({
  product,
  stock,
  categories,
  colorOptions,
  colorMap,
}: {
  product: Tables<"products">;
  stock: Tables<"product_stock">[];
  categories: Category[];
  colorOptions: string[];
  colorMap?: Record<string, string>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Transform DB data to Form Data
  const initialData: ProductFormValues = useMemo(
    () => ({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: Number(product.price), // Ensure number
      category_id: product.category_id || "",
      main_image_url: product.main_image_url || "",
      gallery_image_urls:
        product.gallery_image_urls && product.gallery_image_urls.length > 0
          ? product.gallery_image_urls
          : product.main_image_url
            ? [product.main_image_url]
            : [],
      expression_tags: product.expression_tags || [],
      is_active: product.is_active ?? true,
      is_carousel_featured: product.is_carousel_featured ?? false,
      original_price: product.original_price,
      status: (product.status as "draft" | "active" | "archived") || "draft",
      cost_price: Number(product.cost_price) || 0,
      sku: product.sku || "",
      track_quantity: true, // Defaulting to true as DB doesn't have this col yet, assuming always track for now or add col later.
      seo_title: product.seo_title || "",
      seo_description: product.seo_description || "",
      variants: stock.map((s) => ({
        size: s.size,
        color: s.color,
        fit: s.fit || "Regular",
        quantity: s.quantity ?? 0,
        price_addon: (s as any).price_addon ?? 0,
        cost_price: (s as any).cost_price ?? 0,
        sku: (s as any).sku || "",
      })),
      fit_options: (product as any).fit_options || [],
    }),
    [product, stock],
  );

  const handleSubmit = (data: ProductFormValues) => {
    startTransition(async () => {
      try {
        const result = await updateProduct(product.id, {
          ...data,
          slug: data.slug || slugify(data.name),
          price: data.price,
        });

        if (result.success) {
          toast.success("Product updated successfully");
          router.push("/admin/products");
        } else {
          toast.error("Failed to update product: " + result.error);
        }
      } catch {
        toast.error("System error occurred. Please check logs.");
      }
    });
  };

  const isFeatured = product.is_carousel_featured;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20 animate-in fade-in duration-500">
      <div
        className={cn(
          "flex items-center justify-between gap-4 py-6 px-6 rounded-2xl border transition-all duration-500 shadow-sm",
          isFeatured
            ? "bg-amber-500/5 border-amber-500/30 shadow-amber-500/5"
            : "bg-card border-border",
        )}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Edit Product
              </h1>
              {isFeatured && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest animate-in zoom-in-50 duration-500 shadow-sm border border-amber-200/50 dark:border-amber-500/20">
                  <Sparkles className="h-3 w-3" />
                  Featured in Carousel
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Update product details and stock.
            </p>
          </div>
        </div>

        {isFeatured && (
          <div className="hidden md:block">
            <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-500/20 shadow-xl shadow-amber-500/10 rotate-3">
              <Sparkles className="h-6 w-6 text-amber-500" />
            </div>
          </div>
        )}
      </div>

      <ProductForm
        initialData={initialData}
        categories={categories}
        colorOptions={colorOptions}
        colorMap={colorMap}
        isLoading={isPending}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}

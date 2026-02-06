"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductFormValues } from "@/lib/validations/product";
import { Category } from "@/types/store-types";
import { toast } from "sonner";
import { ContextualSaveBar } from "./form/contextual-save-bar";
import { ProductHeader } from "./form/product-header";
import { ProductBasicInfo } from "./form/product-basic-info";
import { ProductMedia } from "./form/product-media";
import { ProductPricing } from "./form/product-pricing";
import { ProductInventory } from "./form/product-inventory";
import { ProductVariants } from "./form/product-variants";
import { ProductSEO } from "./form/product-seo";
import { ProductOrganization } from "./form/product-organization";

interface ProductFormProps {
  initialData?: ProductFormValues & { id?: string };
  categories: Category[];
  colorOptions: string[];
  colorMap?: Record<string, string>;
  isLoading: boolean;
  onSubmit: (data: ProductFormValues) => void;
  onCancel: () => void;
}

export function ProductForm({
  initialData,
  categories,
  colorOptions,
  colorMap,
  isLoading,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  // 1. Form Initialization
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      name: "",
      slug: "",
      description: "",
      status: "draft",
      price: 0,
      original_price: null,
      cost_price: 0,
      sku: "",
      track_quantity: true,
      category_id: "",
      main_image_url: "",
      gallery_image_urls: [],
      expression_tags: [],
      is_active: true,
      is_carousel_featured: false,
      color_options: [],
      size_options: [],
      fit_options: ["Regular", "Oversized"],
      variants: [],
      seo_title: "",
      seo_description: "",
    },
  });

  const { reset, watch, handleSubmit } = form;
  const [isUploading, setIsUploading] = useState(false);

  // 2. Handle Initial Data Updates
  useEffect(() => {
    if (initialData) {
      // Cast to ensure type compatibility (any missing new fields will use default from schema if parsed,
      // but here we are resetting form with data. We might need to fill defaults for new fields if existing data lacks them.)
      const formData = {
        ...initialData,
        status:
          initialData.status || (initialData.is_active ? "active" : "draft"),
        // Ensure defaults for new fields if they are undefined
        seo_title: initialData.seo_title || "",
        seo_description: initialData.seo_description || "",
        cost_price: initialData.cost_price || 0,
        sku: initialData.sku || "",
        track_quantity: initialData.track_quantity ?? true,
      };
      reset(formData as ProductFormValues);
    }
  }, [initialData, reset]);

  // 3. Auto-Save Logic (Basic Implementation)
  useEffect(() => {
    const subscription = watch((value) => {
      if (!initialData) {
        // Only auto-save drafts for new products to avoid overwriting live data accidentally
        localStorage.setItem("product-form-draft", JSON.stringify(value));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, initialData]);

  // Load draft on mount if new product
  useEffect(() => {
    if (!initialData) {
      const draft = localStorage.getItem("product-form-draft");
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          // confirm before restoring? or just silent restore?
          // Silent restore is risky if schema changed. Let's just log for now or simple toast.
          // For now, let's skip auto-restore to avoid conflicts during this migration phase.
        } catch (e) {}
      }
    }
  }, [initialData]);

  const handleFormSubmit = async (data: ProductFormValues) => {
    // Clear draft on successful submit
    localStorage.removeItem("product-form-draft");

    // Sync legacy is_active with status
    data.is_active = data.status === "active";

    onSubmit(data);
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-8 pb-10"
      >
        <ProductHeader
          isUploading={isUploading}
          isLoading={isLoading}
          onDiscard={onCancel}
        />

        <div className="flex flex-col xl:flex-row gap-8">
          {/* Main Content (Left Column) */}
          <div className="flex-1 space-y-8">
            <ProductBasicInfo />
            <ProductMedia />
            <ProductVariants colorOptions={colorOptions} />
            <ProductPricing />
            <ProductInventory />
            <ProductSEO />
          </div>

          {/* Sidebar (Right Column) */}
          <div className="w-full xl:w-[350px] space-y-8">
            <ProductOrganization categories={categories} />
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

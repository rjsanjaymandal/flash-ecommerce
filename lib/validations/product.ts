import { z } from "zod"

// Updated variant schema with new inventory fields
export const variantSchema = z.object({
  size: z.string().default("Standard"),
  color: z.string().default("Standard"),
  fit: z.string().default("Regular"),
  quantity: z.number().min(0, "Quantity must be 0 or more"),
  sku: z.string().optional(),
  cost_price: z.number().min(0, "Cost must be 0 or more").default(0),
})

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  original_price: z.number().min(0, "Compare at price must be 0 or more").nullable().optional(),
  cost_price: z.number().min(0, "Cost must be 0 or more").default(0),
  sku: z.string().optional(),
  track_quantity: z.boolean().default(true),
  category_id: z.string().min(1, "Category is required"),
  main_image_url: z.string().min(1, "Main image is required"),
  gallery_image_urls: z.array(z.string()),
  images: z.object({
    thumbnail: z.string(),
    mobile: z.string(),
    desktop: z.string()
  }).optional(),
  expression_tags: z.array(z.string()),
  // is_active kept for backward compatibility if needed, but UI uses status
  is_active: z.boolean().default(true), 
  is_carousel_featured: z.boolean().default(false),
  color_options: z.array(z.string()).optional(),
  size_options: z.array(z.string()).optional(),
  fit_options: z.array(z.string()).default([]),
  variants: z.array(variantSchema),
  // SEO Fields
  seo_title: z.string().max(70, "Meta title should be under 70 chars").optional(),
  seo_description: z.string().max(320, "Meta description should be under 320 chars").optional(),
})

export type ProductFormValues = z.infer<typeof productSchema>

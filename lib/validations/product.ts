import { z } from "zod"

export const variantSchema = z.object({
  size: z.string().min(1, "Size is required"),
  color: z.string().min(1, "Color is required"),
  quantity: z.number().min(0, "Quantity must be 0 or more"),
})

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  category_id: z.string().min(1, "Category is required"),
  main_image_url: z.string().min(1, "Main image is required"),
  gallery_image_urls: z.array(z.string()),
  is_active: z.boolean().default(true),
  variants: z.array(variantSchema).default([])
})

export type ProductFormValues = z.infer<typeof productSchema>

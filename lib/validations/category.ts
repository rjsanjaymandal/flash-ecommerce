import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional().nullable(),
  parent_id: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  is_active: z.boolean(),
});

export type CategoryData = z.infer<typeof categorySchema>;

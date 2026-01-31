import { createAdminClient } from "@/lib/supabase/admin";
import { Database } from "@/types/supabase";
import { cache } from "react";
import { z } from "zod";

export type Coupon = Database["public"]["Tables"]["coupons"]["Row"];
export type InsertCoupon = Database["public"]["Tables"]["coupons"]["Insert"];
export type UpdateCoupon = Database["public"]["Tables"]["coupons"]["Update"];

// Zod Schema for Validation
export const couponSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .regex(/^[A-Z0-9_-]+$/, "Code must be alphanumeric (uppercase)")
    .transform((val) => val.toUpperCase()),
  discount_type: z.enum(["percentage", "fixed"]),
  value: z.coerce.number().min(0, "Value must be positive"),
  min_order_amount: z.coerce.number().min(0).optional(),
  max_uses: z.coerce.number().min(1).optional().nullable(),
  expires_at: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

export type CouponFormValues = z.infer<typeof couponSchema>;

/**
 * Get all coupons (paginated)
 */
export const getAdminCoupons = cache(
  async ({
    page = 1,
    limit = 10,
    search,
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const supabase = createAdminClient();
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    let query = supabase
      .from("coupons")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(start, end);

    if (search) {
      query = query.ilike("code", `%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching admin coupons:", error);
      throw new Error("Failed to fetch coupons");
    }

    return {
      coupons: data as Coupon[],
      totalPages: count ? Math.ceil(count / limit) : 0,
      totalCount: count || 0,
    };
  }
);

/**
 * Get single coupon by ID
 */
export const getAdminCoupon = cache(async (id: string) => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching coupon ${id}:`, error);
    return null;
  }

  return data as Coupon;
});

// Actions moved to app/actions/coupon-actions.ts

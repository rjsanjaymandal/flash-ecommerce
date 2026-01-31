"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { CouponFormValues, InsertCoupon, UpdateCoupon } from "@/lib/services/admin-coupon-service";

/**
 * Create a new coupon
 */
export async function createCoupon(values: CouponFormValues) {
  const supabase = createAdminClient();

  const payload: InsertCoupon = {
    code: values.code,
    discount_type: values.discount_type,
    value: values.value,
    min_order_amount: values.min_order_amount || 0,
    max_uses: values.max_uses || null,
    expires_at: values.expires_at || null,
    active: values.active,
    used_count: 0,
  };

  const { data, error } = await supabase
    .from("coupons")
    .insert(payload)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Coupon code already exists" };
    }
    console.error("Error creating coupon:", error);
    return { error: "Failed to create coupon" };
  }

  return { success: true, data };
}

/**
 * Update an existing coupon
 */
export async function updateCoupon(id: string, values: CouponFormValues) {
  const supabase = createAdminClient();

  const payload: UpdateCoupon = {
    code: values.code,
    discount_type: values.discount_type,
    value: values.value,
    min_order_amount: values.min_order_amount || 0,
    max_uses: values.max_uses || null,
    expires_at: values.expires_at || null,
    active: values.active,
  };

  const { data, error } = await supabase
    .from("coupons")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Coupon code already exists" };
    }
    console.error("Error updating coupon:", error);
    return { error: "Failed to update coupon" };
  }

  return { success: true, data };
}

/**
 * Delete a coupon
 */
export async function deleteCoupon(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);

  if (error) {
    if (error.code === '23503') {
      return { error: "Cannot delete this coupon because it has been used in orders. Please deactivate it instead." };
    }
    console.error("Error deleting coupon:", JSON.stringify(error, null, 2));
    return { error: `Failed to delete coupon: ${error.message || 'Unknown error'}` };
  }

  return { success: true };
}

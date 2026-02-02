-- 1. ENHANCE BLOG: SEO Fields
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- 2. ENHANCE COUPONS: Atomic Redemption
-- Assuming a 'coupons' table allows us to track usage count. 
-- Schema inferred: active (bool), code (text), usage_limit (int), usage_count (int).

CREATE OR REPLACE FUNCTION redeem_coupon(p_code TEXT, p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_coupon RECORD;
  v_usgae_count INTEGER;
BEGIN
  -- Lock the row for update
  SELECT * INTO v_coupon FROM public.coupons 
  WHERE code = p_code 
  AND active = true 
  ORDER BY id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired coupon');
  END IF;

  -- Check Global Limit
  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.usage_count >= v_coupon.usage_limit THEN
    RETURN jsonb_build_object('success', false, 'error', 'Coupon usage limit reached');
  END IF;

  -- (Optional: Check Per-User Limit via coupon_usages table if it existed, skipping for now)

  -- Increment Usage
  UPDATE public.coupons
  SET usage_count = usage_count + 1
  WHERE id = v_coupon.id;

  RETURN jsonb_build_object('success', true, 'discount_type', v_coupon.discount_type, 'discount_value', v_coupon.discount_value);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

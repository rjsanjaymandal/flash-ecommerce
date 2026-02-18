-- Database Stability Fix
-- Updates function search paths to 'public, extensions' to ensure they can find tables
-- while still satisfying the Supabase Linter requirement for a fixed search_path.

-- 1. RE-HARDEN FUNCTIONS WITH STABLE PATH
ALTER FUNCTION public.is_admin() SET search_path = public, extensions;
ALTER FUNCTION public.check_rate_limit(text, integer, integer) SET search_path = public, extensions;
ALTER FUNCTION public.refresh_product_rating(uuid) SET search_path = public, extensions;
ALTER FUNCTION public.on_review_change() SET search_path = public, extensions;
ALTER FUNCTION public.notify_admins_on_new_profile() SET search_path = public, extensions;
ALTER FUNCTION public.sync_product_total_stock() SET search_path = public, extensions;
ALTER FUNCTION public.redeem_coupon(text, uuid) SET search_path = public, extensions;
ALTER FUNCTION public.get_waitlist_summary(integer, integer) SET search_path = public, extensions;
ALTER FUNCTION public.get_waitlist_summary_count() SET search_path = public, extensions;
ALTER FUNCTION public.restock_order(uuid, text) SET search_path = public, extensions;
ALTER FUNCTION public.decrement_stock(uuid, text, text, integer) SET search_path = public, extensions;
ALTER FUNCTION public.reserve_stock(uuid) SET search_path = public, extensions;
ALTER FUNCTION public.search_products_v2(text, integer) SET search_path = public, extensions;
ALTER FUNCTION public.process_payment(uuid, text) SET search_path = public, extensions;
ALTER FUNCTION public.get_trending_products(integer) SET search_path = public, extensions;
ALTER FUNCTION public.update_product_total_stock() SET search_path = public, extensions;
ALTER FUNCTION public.get_sales_over_time(text, text, text) SET search_path = public, extensions;
ALTER FUNCTION public.get_top_products_by_revenue(text, text, integer) SET search_path = public, extensions;
ALTER FUNCTION public.prevent_role_update() SET search_path = public, extensions;
ALTER FUNCTION public.handle_new_vote() SET search_path = public, extensions;
ALTER FUNCTION public.handle_remove_vote() SET search_path = public, extensions;
ALTER FUNCTION public.process_payment_v2(uuid, text) SET search_path = public, extensions;
ALTER FUNCTION public.finalize_payment_v3(uuid, text, numeric) SET search_path = public, extensions;
ALTER FUNCTION public.finalize_payment_v4(uuid, text, numeric) SET search_path = public, extensions;
ALTER FUNCTION public.get_analytics_summary(text, text) SET search_path = public, extensions;
ALTER FUNCTION public.finalize_payment_v5(uuid, text, numeric, text) SET search_path = public, extensions;
ALTER FUNCTION public.update_blog_post_updated_at() SET search_path = public, extensions;
ALTER FUNCTION public.increment_product_sale(uuid, integer) SET search_path = public, extensions;
ALTER FUNCTION public.in_stock(public.products) SET search_path = public, extensions;

-- 2. ENSURE RLS POLICIES USE QUALIFIED FUNCTIONS
-- (Already handled in previous migrations by using public.is_admin())

-- Database Security & Hygiene Hardening
-- Addresses Supabase Linter Warnings (Search Path, Extension Location, Overly Permissive RLS)

-- 1. ISOLATE EXTENSIONS
CREATE SCHEMA IF NOT EXISTS extensions;
-- Move pg_trgm to extensions schema if it's in public
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
        ALTER EXTENSION pg_trgm SET SCHEMA extensions;
    END IF;
END $$;

-- 2. HARDEN FUNCTION SEARCH PATHS
-- Standard practice: SET search_path = '' and use fully qualified names
-- This prevents "search path hijacking" attacks.

ALTER FUNCTION public.is_admin() SET search_path = '';
ALTER FUNCTION public.check_rate_limit(text, integer, integer) SET search_path = '';
ALTER FUNCTION public.refresh_product_rating(uuid) SET search_path = '';
ALTER FUNCTION public.on_review_change() SET search_path = '';
ALTER FUNCTION public.notify_admins_on_new_profile() SET search_path = '';
ALTER FUNCTION public.sync_product_total_stock() SET search_path = '';
ALTER FUNCTION public.redeem_coupon(text, uuid) SET search_path = '';
ALTER FUNCTION public.get_waitlist_summary(integer, integer) SET search_path = '';
ALTER FUNCTION public.get_waitlist_summary_count() SET search_path = '';
ALTER FUNCTION public.restock_order(uuid, text) SET search_path = '';
ALTER FUNCTION public.decrement_stock(uuid, text, text, integer) SET search_path = '';
ALTER FUNCTION public.reserve_stock(uuid) SET search_path = '';
ALTER FUNCTION public.search_products_v2(text, integer) SET search_path = '';
ALTER FUNCTION public.process_payment(uuid, text) SET search_path = '';
ALTER FUNCTION public.get_trending_products(integer) SET search_path = '';
ALTER FUNCTION public.update_product_total_stock() SET search_path = '';
ALTER FUNCTION public.get_sales_over_time(text, text, text) SET search_path = '';
ALTER FUNCTION public.get_top_products_by_revenue(text, text, integer) SET search_path = '';
ALTER FUNCTION public.prevent_role_update() SET search_path = '';
ALTER FUNCTION public.handle_new_vote() SET search_path = '';
ALTER FUNCTION public.handle_remove_vote() SET search_path = '';
ALTER FUNCTION public.process_payment_v2(uuid, text) SET search_path = '';
ALTER FUNCTION public.finalize_payment_v3(uuid, text, numeric) SET search_path = '';
ALTER FUNCTION public.finalize_payment_v4(uuid, text, numeric) SET search_path = '';
ALTER FUNCTION public.get_analytics_summary(text, text) SET search_path = '';
ALTER FUNCTION public.finalize_payment_v5(uuid, text, numeric, text) SET search_path = '';
ALTER FUNCTION public.update_blog_post_updated_at() SET search_path = '';
ALTER FUNCTION public.increment_product_sale(uuid, integer) SET search_path = '';
ALTER FUNCTION public.in_stock(public.products) SET search_path = '';


-- 3. TIGHTEN OVERLY PERMISSIVE RLS POLICIES

-- orders: Enable insert for everyone -> Authenticated only
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders" 
ON public.orders FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- order_items: Enable insert for everyone -> via order ownership
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
CREATE POLICY "Users can insert own order items"
ON public.order_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);

-- notifications: Service Role can manage all notifications -> Service Role Only
DROP POLICY IF EXISTS "Service Role can manage all notifications" ON public.notifications;
CREATE POLICY "Service Role can manage all notifications"
ON public.notifications FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- newsletter_subscribers: Clean up duplicate / permissive policies
DROP POLICY IF EXISTS "Anon Insert Newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow public newsletter subscription" ON public.newsletter_subscribers;
CREATE POLICY "Allow public newsletter subscription"
ON public.newsletter_subscribers FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- preorders: Guests can insert preorders -> Anon/Authenticated only
DROP POLICY IF EXISTS "Guests can insert preorders" ON public.preorders;
DROP POLICY IF EXISTS "Allow public preorders" ON public.preorders;
CREATE POLICY "Allow public preorders"
ON public.preorders FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- feedback: Clean up duplicate / permissive policies
DROP POLICY IF EXISTS "Anon Insert Feedback" ON public.feedback;
DROP POLICY IF EXISTS "Allow anyone to insert feedback" ON public.feedback;
DROP POLICY IF EXISTS "Allow public feedback submission" ON public.feedback;
CREATE POLICY "Allow public feedback submission"
ON public.feedback FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- content_globals: Restrict to admins
DROP POLICY IF EXISTS "Public can insert globals" ON public.content_globals;
DROP POLICY IF EXISTS "Public can update globals" ON public.content_globals;
DROP POLICY IF EXISTS "Admins can manage globals" ON public.content_globals;
CREATE POLICY "Admins can manage globals"
ON public.content_globals FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- rate_limits: Option A (Server-only access)
DROP POLICY IF EXISTS "service_only_access" ON public.rate_limits;
CREATE POLICY "service_only_access" ON public.rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Revoke direct access from anon/authenticated
REVOKE ALL ON public.rate_limits FROM anon, authenticated;

-- Re-grant permissions for safety
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT USAGE ON SCHEMA extensions TO anon, authenticated;

-- ==========================================
-- FINAL DATABASE SANITY SYNC
-- ==========================================

-- 1. BASE SECURITY
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_role public.user_role;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  RETURN v_role = 'admin'::public.user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- 2. FORCE RE-APPLY ADMIN POLICIES (DROPPING OLD ONES FIRST)
-- Profiles
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Orders
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Order Items
DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;
CREATE POLICY "Admins can manage all order items" ON public.order_items FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Products
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;
CREATE POLICY "Admins can manage all products" ON public.products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Categories
DROP POLICY IF EXISTS "Admins can manage all categories" ON public.categories;
CREATE POLICY "Admins can manage all categories" ON public.categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 3. ENSURE PERMISSIONS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 4. VERIFY CORE ANALYTICS SCHEMAS
-- (Re-running the latest one to be sure)
-- get_analytics_summary
DROP FUNCTION IF EXISTS public.get_analytics_summary(TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.get_analytics_summary(start_date TEXT, end_date TEXT) 
RETURNS TABLE (
  total_revenue NUMERIC, total_orders INTEGER, average_order_value NUMERIC, 
  returning_customer_percentage NUMERIC, prev_revenue NUMERIC, prev_orders INTEGER, prev_returning_percentage NUMERIC
) AS $$
DECLARE
  v_start_date TIMESTAMPTZ := start_date::TIMESTAMPTZ;
  v_end_date TIMESTAMPTZ := end_date::TIMESTAMPTZ;
  v_interval INTERVAL := v_end_date - v_start_date;
  v_prev_start_date TIMESTAMPTZ := v_start_date - v_interval;
BEGIN
  RETURN QUERY
  WITH current_orders AS (SELECT total, user_id FROM public.orders WHERE created_at BETWEEN v_start_date AND v_end_date AND status != 'cancelled'),
  prev_orders_table AS (SELECT total, user_id FROM public.orders WHERE created_at BETWEEN v_prev_start_date AND v_start_date AND status != 'cancelled'),
  current_summary AS (SELECT COALESCE(SUM(total), 0) as rev, COUNT(*)::INTEGER as ords, COUNT(DISTINCT user_id) as users FROM current_orders),
  prev_summary AS (SELECT COALESCE(SUM(total), 0) as rev, COUNT(*)::INTEGER as ords, COUNT(DISTINCT user_id) as users FROM prev_orders_table),
  current_returning AS (SELECT COUNT(*)::NUMERIC as ret_count FROM (SELECT user_id FROM public.orders WHERE status != 'cancelled' AND user_id IN (SELECT DISTINCT user_id FROM current_orders WHERE user_id IS NOT NULL) GROUP BY user_id HAVING COUNT(*) > 1) r),
  prev_returning AS (SELECT COUNT(*)::NUMERIC as ret_count FROM (SELECT user_id FROM public.orders WHERE status != 'cancelled' AND user_id IN (SELECT DISTINCT user_id FROM prev_orders_table WHERE user_id IS NOT NULL) GROUP BY user_id HAVING COUNT(*) > 1) r)
  SELECT c.rev, c.ords, CASE WHEN c.ords > 0 THEN c.rev / c.ords ELSE 0 END, CASE WHEN c.users > 0 THEN (cr.ret_count / c.users::NUMERIC) * 100 ELSE 0 END, p.rev, p.ords, CASE WHEN p.users > 0 THEN (pr.ret_count / p.users::NUMERIC) * 100 ELSE 0 END
  FROM current_summary c, prev_summary p, current_returning cr, prev_returning pr;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- get_order_status_distribution
DROP FUNCTION IF EXISTS public.get_order_status_distribution(TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.get_order_status_distribution(start_date TEXT, end_date TEXT)
RETURNS TABLE (status TEXT, count INTEGER) AS $$
BEGIN
  RETURN QUERY SELECT o.status::TEXT, COUNT(*)::INTEGER FROM public.orders o WHERE o.created_at BETWEEN start_date::TIMESTAMPTZ AND end_date::TIMESTAMPTZ AND o.status != 'cancelled' GROUP BY o.status ORDER BY 2 DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

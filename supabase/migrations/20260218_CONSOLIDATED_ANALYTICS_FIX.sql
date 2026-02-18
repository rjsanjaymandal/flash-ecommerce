-- ==========================================
-- CONSOLIDATED DASHBOARD & ANALYTICS FIX
-- Date: 2026-02-18
-- ==========================================

-- 1. RE-HARDEN IS_ADMIN (SECURITY DEFINER to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_role public.user_role;
BEGIN
  SELECT role INTO v_role 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  RETURN v_role = 'admin'::public.user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- 2. FIX PROFILES RLS RECURSION
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read Own Profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins View All Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin Manage Profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

CREATE POLICY "profiles_read_own" 
ON public.profiles FOR SELECT 
TO authenticated, anon
USING (id = auth.uid());

CREATE POLICY "profiles_admin_all"
ON public.profiles FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 3. ADVANCED ANALYTICS SUMMARY (With Period-over-Period Growth)
DROP FUNCTION IF EXISTS public.get_analytics_summary(TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.get_analytics_summary(
  start_date TEXT,
  end_date TEXT
) 
RETURNS TABLE (
  total_revenue NUMERIC,
  total_orders INTEGER,
  average_order_value NUMERIC,
  returning_customer_percentage NUMERIC,
  prev_revenue NUMERIC,
  prev_orders INTEGER,
  prev_returning_percentage NUMERIC
) AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
  v_end_date TIMESTAMPTZ;
  v_prev_start_date TIMESTAMPTZ;
  v_interval INTERVAL;
BEGIN
  v_start_date := start_date::TIMESTAMPTZ;
  v_end_date := end_date::TIMESTAMPTZ;
  v_interval := v_end_date - v_start_date;
  v_prev_start_date := v_start_date - v_interval;

  RETURN QUERY
  WITH current_orders AS (
      SELECT total, user_id
      FROM public.orders
      WHERE created_at BETWEEN v_start_date AND v_end_date
      AND status != 'cancelled'
  ),
  prev_orders_table AS (
      SELECT total, user_id
      FROM public.orders
      WHERE created_at BETWEEN v_prev_start_date AND v_start_date
      AND status != 'cancelled'
  ),
  current_summary AS (
      SELECT 
        COALESCE(SUM(total), 0) as rev,
        COUNT(*)::INTEGER as ords,
        COUNT(DISTINCT user_id) as users
      FROM current_orders
  ),
  prev_summary AS (
      SELECT 
        COALESCE(SUM(total), 0) as rev,
        COUNT(*)::INTEGER as ords,
        COUNT(DISTINCT user_id) as users
      FROM prev_orders_table
  ),
  current_returning AS (
      SELECT COUNT(*)::NUMERIC as ret_count
      FROM (
          SELECT user_id
          FROM public.orders
          WHERE status != 'cancelled'
          AND user_id IN (SELECT DISTINCT user_id FROM current_orders WHERE user_id IS NOT NULL)
          GROUP BY user_id
          HAVING COUNT(*) > 1
      ) r
  ),
  prev_returning AS (
      SELECT COUNT(*)::NUMERIC as ret_count
      FROM (
          SELECT user_id
          FROM public.orders
          WHERE status != 'cancelled'
          AND user_id IN (SELECT DISTINCT user_id FROM prev_orders_table WHERE user_id IS NOT NULL)
          GROUP BY user_id
          HAVING COUNT(*) > 1
      ) r
  )
  SELECT 
    c.rev,
    c.ords,
    CASE WHEN c.ords > 0 THEN c.rev / c.ords ELSE 0 END,
    CASE WHEN c.users > 0 THEN (cr.ret_count / c.users::NUMERIC) * 100 ELSE 0 END,
    p.rev,
    p.ords,
    CASE WHEN p.users > 0 THEN (pr.ret_count / p.users::NUMERIC) * 100 ELSE 0 END
  FROM current_summary c, prev_summary p, current_returning cr, prev_returning pr;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- 4. SALES OVER TIME (Historical Trends)
DROP FUNCTION IF EXISTS public.get_sales_over_time(TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.get_sales_over_time(
  start_date TEXT,
  end_date TEXT,
  interval_val TEXT DEFAULT 'day'
)
RETURNS TABLE (
  date_bucket TEXT,
  total_sales NUMERIC,
  order_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_char(date_trunc(interval_val, created_at), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    COALESCE(SUM(total), 0),
    COUNT(*)::INTEGER
  FROM public.orders
  WHERE created_at BETWEEN start_date::TIMESTAMPTZ AND end_date::TIMESTAMPTZ
  AND status != 'cancelled'
  GROUP BY 1
  ORDER BY 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- 5. SALES BY CATEGORY (Pie Chart Data)
DROP FUNCTION IF EXISTS public.get_sales_by_category(TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.get_sales_by_category(
  start_date TEXT,
  end_date TEXT
)
RETURNS TABLE (
  name TEXT,
  value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.name as category_name,
    SUM(oi.unit_price * oi.quantity) as revenue
  FROM public.order_items oi
  JOIN public.orders o ON oi.order_id = o.id
  JOIN public.products p ON oi.product_id = p.id
  JOIN public.categories c ON p.category_id = c.id
  WHERE o.created_at BETWEEN start_date::TIMESTAMPTZ AND end_date::TIMESTAMPTZ
  AND o.status != 'cancelled'
  GROUP BY c.name
  ORDER BY revenue DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- 6. TOP PRODUCTS ENRICHED (Hot Inventory)
DROP FUNCTION IF EXISTS public.get_top_products_by_revenue(TEXT, TEXT, INTEGER);
CREATE OR REPLACE FUNCTION public.get_top_products_by_revenue(
  start_date TEXT,
  end_date TEXT,
  limit_val INTEGER DEFAULT 5
)
RETURNS TABLE (
  product_id UUID,
  name TEXT,
  revenue NUMERIC,
  units_sold INTEGER,
  main_image_url TEXT,
  category_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oi.product_id,
    MAX(p.name) as product_name, 
    SUM(oi.unit_price * oi.quantity) as product_revenue,
    SUM(oi.quantity)::INTEGER as total_units,
    MAX(p.main_image_url) as image,
    MAX(c.name) as cat
  FROM public.order_items oi
  JOIN public.orders o ON oi.order_id = o.id
  LEFT JOIN public.products p ON oi.product_id = p.id
  LEFT JOIN public.categories c ON p.category_id = c.id
  WHERE o.created_at BETWEEN start_date::TIMESTAMPTZ AND end_date::TIMESTAMPTZ
  AND o.status != 'cancelled'
  GROUP BY oi.product_id
  ORDER BY product_revenue DESC
  LIMIT limit_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- 7. ORDER PIPELINE DISTRIBUTION (Donut/Pipeline Visuals)
DROP FUNCTION IF EXISTS public.get_order_status_distribution(TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.get_order_status_distribution(
  start_date TEXT,
  end_date TEXT
)
RETURNS TABLE (
  status TEXT,
  count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.status::TEXT,
    COUNT(*)::INTEGER
  FROM public.orders o
  WHERE o.created_at BETWEEN start_date::TIMESTAMPTZ AND end_date::TIMESTAMPTZ
  AND o.status != 'cancelled'
  GROUP BY o.status
  ORDER BY 2 DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- 8. PERMISSIONS
GRANT EXECUTE ON FUNCTION public.get_analytics_summary(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_over_time(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_by_category(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_products_by_revenue(TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_order_status_distribution(TEXT, TEXT) TO authenticated;

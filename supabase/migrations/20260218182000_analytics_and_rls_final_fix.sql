-- Final Analytics & RLS Stability Fix
-- Goal: Break ANY remaining recursion and ensure RPCs can find tables.

-- 1. RE-HARDEN IS_ADMIN (Ensure it's super-clean)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_role public.user_role;
BEGIN
  -- Security Definer bypasses RLS, but we must use a qualified name
  SELECT role INTO v_role 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  RETURN v_role = 'admin'::public.user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- 2. BREAK PROFILES RECURSION ONCE AND FOR ALL
-- We avoid calling is_admin() inside the profiles SELECT policy if possible,
-- OR we ensure it's the ONLY policy used for admins.
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read Own Profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins View All Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin Manage Profiles" ON public.profiles;

-- Policy 1: Everyone can see their own profile (Fundamental)
CREATE POLICY "profiles_read_own" 
ON public.profiles FOR SELECT 
TO authenticated, anon
USING (id = auth.uid());

-- Policy 2: Admins can see all profiles (Uses the SECURITY DEFINER function)
-- This function bypasses RLS, so it shouldn't recurse.
CREATE POLICY "profiles_admin_all"
ON public.profiles FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 3. RE-DECLARE ANALYTICS WITH ABSOLUTE PATHS
-- (Ensures no "relation not found" even in complex joins)

CREATE OR REPLACE FUNCTION public.get_analytics_summary(
  start_date TEXT,
  end_date TEXT
) 
RETURNS TABLE (
  total_revenue NUMERIC,
  total_orders INTEGER,
  average_order_value NUMERIC,
  returning_customer_percentage NUMERIC
) AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
  v_end_date TIMESTAMPTZ;
BEGIN
  v_start_date := start_date::TIMESTAMPTZ;
  v_end_date := end_date::TIMESTAMPTZ;

  RETURN QUERY
  WITH base_orders AS (
      SELECT total, user_id
      FROM public.orders
      WHERE created_at BETWEEN v_start_date AND v_end_date
      AND status IN ('paid', 'confirmed_partial')
  ),
  summary AS (
      SELECT 
        COALESCE(SUM(total), 0) as rev,
        COUNT(*)::INTEGER as ords,
        COUNT(DISTINCT user_id) as users
      FROM base_orders
  ),
  returning_customers AS (
      SELECT COUNT(*)::NUMERIC as ret_count
      FROM (
          SELECT user_id
          FROM public.orders
          WHERE status IN ('paid', 'confirmed_partial')
          AND user_id IN (SELECT DISTINCT user_id FROM base_orders)
          GROUP BY user_id
          HAVING COUNT(*) > 1
      ) r
  )
  SELECT 
    s.rev,
    s.ords,
    CASE WHEN s.ords > 0 THEN s.rev / s.ords ELSE 0 END,
    CASE WHEN s.users > 0 THEN (ret.ret_count / s.users::NUMERIC) * 100 ELSE 0 END
  FROM summary s, returning_customers ret;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

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
  AND status IN ('paid', 'confirmed_partial')
  GROUP BY 1
  ORDER BY 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

CREATE OR REPLACE FUNCTION public.get_top_products_by_revenue(
  start_date TEXT,
  end_date TEXT,
  limit_val INTEGER DEFAULT 5
)
RETURNS TABLE (
  product_id UUID,
  name TEXT,
  revenue NUMERIC,
  units_sold INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oi.product_id,
    MAX(p.name) as product_name, 
    SUM(oi.unit_price * oi.quantity) as product_revenue,
    SUM(oi.quantity)::INTEGER as total_units
  FROM public.order_items oi
  JOIN public.orders o ON oi.order_id = o.id
  LEFT JOIN public.products p ON oi.product_id = p.id
  WHERE o.created_at BETWEEN start_date::TIMESTAMPTZ AND end_date::TIMESTAMPTZ
  AND o.status IN ('paid', 'confirmed_partial')
  GROUP BY oi.product_id
  ORDER BY product_revenue DESC
  LIMIT limit_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- Final Step: Grant Execute
GRANT EXECUTE ON FUNCTION public.get_analytics_summary(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_over_time(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_products_by_revenue(TEXT, TEXT, INTEGER) TO authenticated;

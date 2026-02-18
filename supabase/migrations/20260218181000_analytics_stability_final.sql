-- Analytics & RLS Stability Fix
-- 1. Update RLS policies to use public.is_admin() (Prevents recursion and improves performance)

-- Orders
DROP POLICY IF EXISTS "Admins can see all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admin Manage Orders" ON public.orders;

CREATE POLICY "Admins can manage all orders"
ON public.orders FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Order Items
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Admin Manage Order Items" ON public.order_items;

CREATE POLICY "Admins can manage all order items"
ON public.order_items FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Products
DROP POLICY IF EXISTS "Admins can do everything on products" ON public.products;
DROP POLICY IF EXISTS "Admin Write Products" ON public.products;

CREATE POLICY "Admins can manage all products"
ON public.products FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Categories
DROP POLICY IF EXISTS "Admins can do everything on categories" ON public.categories;
DROP POLICY IF EXISTS "Admin Write Categories" ON public.categories;
DROP POLICY IF EXISTS "Admin Full Access Categories" ON public.categories;

CREATE POLICY "Admins can manage all categories"
ON public.categories FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 2. RE-DECLARE ANALYTICS FUNCTIONS WITH FULL QUALIFICATION
-- This ensures they work even with SET search_path = '' or restricted paths.

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
  v_total_revenue NUMERIC;
  v_total_orders INTEGER;
  v_unique_customers INTEGER;
  v_returning_customers INTEGER;
BEGIN
  v_start_date := start_date::TIMESTAMPTZ;
  v_end_date := end_date::TIMESTAMPTZ;

  SELECT 
    COALESCE(SUM(total), 0), 
    COUNT(*)
  INTO v_total_revenue, v_total_orders
  FROM public.orders
  WHERE created_at BETWEEN v_start_date AND v_end_date
  AND status IN ('paid', 'confirmed_partial');

  SELECT COUNT(DISTINCT user_id) INTO v_unique_customers
  FROM public.orders
  WHERE created_at BETWEEN v_start_date AND v_end_date 
  AND status IN ('paid', 'confirmed_partial');

  SELECT COUNT(*) INTO v_returning_customers FROM (
    SELECT user_id
    FROM public.orders
    WHERE user_id IN (
      SELECT DISTINCT user_id FROM public.orders 
      WHERE created_at BETWEEN v_start_date AND v_end_date 
      AND status IN ('paid', 'confirmed_partial')
    )
    AND status IN ('paid', 'confirmed_partial')
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) as recurring;

  RETURN QUERY SELECT 
    v_total_revenue,
    v_total_orders,
    CASE WHEN v_total_orders > 0 THEN v_total_revenue / v_total_orders ELSE 0 END,
    CASE WHEN v_unique_customers > 0 THEN (v_returning_customers::NUMERIC / v_unique_customers::NUMERIC) * 100 ELSE 0 END;
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
DECLARE
  v_start_date TIMESTAMPTZ;
  v_end_date TIMESTAMPTZ;
BEGIN
  v_start_date := start_date::TIMESTAMPTZ;
  v_end_date := end_date::TIMESTAMPTZ;

  RETURN QUERY
  SELECT 
    to_char(date_trunc(interval_val, created_at), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    SUM(total),
    COUNT(*)::INTEGER
  FROM public.orders
  WHERE created_at BETWEEN v_start_date AND v_end_date
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
DECLARE
  v_start_date TIMESTAMPTZ;
  v_end_date TIMESTAMPTZ;
BEGIN
  v_start_date := start_date::TIMESTAMPTZ;
  v_end_date := end_date::TIMESTAMPTZ;

  RETURN QUERY
  SELECT 
    oi.product_id,
    MAX(p.name) as name, 
    SUM(oi.unit_price * oi.quantity) as revenue,
    SUM(oi.quantity)::INTEGER as units_sold
  FROM public.order_items oi
  JOIN public.orders o ON oi.order_id = o.id
  LEFT JOIN public.products p ON oi.product_id = p.id
  WHERE o.created_at BETWEEN v_start_date AND v_end_date
  AND o.status IN ('paid', 'confirmed_partial')
  GROUP BY oi.product_id
  ORDER BY revenue DESC
  LIMIT limit_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- Re-grant execute permissions just in case
GRANT EXECUTE ON FUNCTION public.get_analytics_summary(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_over_time(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_products_by_revenue(TEXT, TEXT, INTEGER) TO authenticated;

-- 3. WAITLIST STABILITY
CREATE OR REPLACE FUNCTION public.get_waitlist_summary(
  page INT DEFAULT 1,
  page_limit INT DEFAULT 10
)
RETURNS TABLE (
  product_id UUID,
  product_name TEXT,
  thumbnail TEXT,
  waitlist_count BIGINT,
  last_activity TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.product_id,
    p.name as product_name,
    p.main_image_url as thumbnail,
    count(w.id) as waitlist_count,
    max(w.created_at) as last_activity
  FROM public.preorders w
  JOIN public.products p ON w.product_id = p.id
  GROUP BY w.product_id, p.name, p.main_image_url
  ORDER BY waitlist_count DESC
  LIMIT page_limit
  OFFSET (page - 1) * page_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

CREATE OR REPLACE FUNCTION public.get_waitlist_summary_count()
RETURNS BIGINT AS $$
BEGIN
  RETURN (SELECT count(DISTINCT product_id) FROM public.preorders);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

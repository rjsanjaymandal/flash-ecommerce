-- Final Analytics & RLS Stability Fix (V2 - Dynamic Data)
-- Goal: Include more statuses to reflect real-time activity and break any recursion.

-- 1. RE-HARDEN IS_ADMIN
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

-- 2. RE-DECLARE ANALYTICS WITH BROADER STATUSES
-- We include 'pending', 'paid', 'shipped', 'delivered', 'confirmed_partial'
-- We exclude only 'cancelled'

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
      AND status != 'cancelled'
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
          WHERE status != 'cancelled'
          AND user_id IN (SELECT DISTINCT user_id FROM base_orders WHERE user_id IS NOT NULL)
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
  AND status != 'cancelled'
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
  AND o.status != 'cancelled'
  GROUP BY oi.product_id
  ORDER BY product_revenue DESC
  LIMIT limit_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- Final Step: Grant Execute
GRANT EXECUTE ON FUNCTION public.get_analytics_summary(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_over_time(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_products_by_revenue(TEXT, TEXT, INTEGER) TO authenticated;

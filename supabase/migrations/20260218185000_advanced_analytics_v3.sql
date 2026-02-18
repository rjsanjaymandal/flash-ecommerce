-- Advanced Analytics & Intelligence (V3)
-- Goal: Provide Period-over-Period (PoP) growth metrics and pipeline visualization.

-- 1. ENHANCED ANALYTICS SUMMARY (With Comparison)
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
  prev_orders INTEGER
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
      SELECT total
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
        COUNT(*)::INTEGER as ords
      FROM prev_orders_table
  ),
  returning_customers AS (
      SELECT COUNT(*)::NUMERIC as ret_count
      FROM (
          SELECT user_id
          FROM public.orders
          WHERE status != 'cancelled'
          AND user_id IN (SELECT DISTINCT user_id FROM current_orders WHERE user_id IS NOT NULL)
          GROUP BY user_id
          HAVING COUNT(*) > 1
      ) r
  )
  SELECT 
    c.rev,
    c.ords,
    CASE WHEN c.ords > 0 THEN c.rev / c.ords ELSE 0 END,
    CASE WHEN c.users > 0 THEN (ret.ret_count / c.users::NUMERIC) * 100 ELSE 0 END,
    p.rev,
    p.ords
  FROM current_summary c, prev_summary p, returning_customers ret;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- 2. ORDER STATUS DISTRIBUTION (Pipeline Tracking)
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

-- Update Permissions
GRANT EXECUTE ON FUNCTION public.get_analytics_summary(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_order_status_distribution(TEXT, TEXT) TO authenticated;

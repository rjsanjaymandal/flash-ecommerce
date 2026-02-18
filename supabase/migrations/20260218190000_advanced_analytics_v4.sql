-- Advanced Analytics & Intelligence (V4)
-- Goal: Enhanced Period-over-Period (PoP) metrics including returning rates.

-- 1. ENHANCED ANALYTICS SUMMARY (With Customer Comparison)
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

-- Ensure permissions
GRANT EXECUTE ON FUNCTION public.get_analytics_summary(TEXT, TEXT) TO authenticated;

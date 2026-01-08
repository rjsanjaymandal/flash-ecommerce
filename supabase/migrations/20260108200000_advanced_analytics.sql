-- Analytics RPCs for Admin Dashboard

-- 1. Get Summary Metrics (Total, AOV, Returning Rate)
CREATE OR REPLACE FUNCTION get_analytics_summary(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
) 
RETURNS TABLE (
  total_revenue NUMERIC,
  total_orders INTEGER,
  average_order_value NUMERIC,
  returning_customer_percentage NUMERIC
) AS $$
DECLARE
  v_total_revenue NUMERIC;
  v_total_orders INTEGER;
  v_unique_customers INTEGER;
  v_returning_customers INTEGER;
BEGIN
  -- Base Aggregates
  SELECT 
    COALESCE(SUM(total), 0), 
    COUNT(*)
  INTO v_total_revenue, v_total_orders
  FROM orders
  WHERE created_at BETWEEN start_date AND end_date
  AND status = 'paid';

  -- Returning Customers Logic: 
  -- Count users who placed an order in this period AND have > 1 order total (lifetime)
  -- Or strictly > 1 order in this period? Usually "Returning" means they are not first-timers.
  -- Let's define Returning as: Users in this set who have a previous order before this set OR multiple in this set.
  -- Simpler proxy: Count users with > 1 order in orders table? 
  -- Accurate Metric: Of the unique users who ordered in this period, how many have > 1 order total?
  
  WITH period_users AS (
    SELECT DISTINCT user_id FROM orders 
    WHERE created_at BETWEEN start_date AND end_date 
    AND status = 'paid' 
    AND user_id IS NOT NULL
  )
  SELECT COUNT(*) INTO v_unique_customers FROM period_users;

  SELECT COUNT(DISTINCT user_id) 
  INTO v_returning_customers
  FROM orders 
  WHERE user_id IN (SELECT user_id FROM period_users)
  AND status = 'paid'
  GROUP BY user_id
  HAVING COUNT(*) > 1;

  RETURN QUERY SELECT 
    v_total_revenue,
    v_total_orders,
    CASE WHEN v_total_orders > 0 THEN v_total_revenue / v_total_orders ELSE 0 END,
    CASE WHEN v_unique_customers > 0 THEN (v_returning_customers::NUMERIC / v_unique_customers::NUMERIC) * 100 ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_analytics_summary(TIMESTAMPTZ, TIMESTAMPTZ) TO service_role;


-- 2. Sales Over Time (Area Chart Data)
CREATE OR REPLACE FUNCTION get_sales_over_time(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  interval_val TEXT DEFAULT 'day' -- 'day', 'hour', 'week'
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
    SUM(total),
    COUNT(*)::INTEGER
  FROM orders
  WHERE created_at BETWEEN start_date AND end_date
  AND status = 'paid'
  GROUP BY 1
  ORDER BY 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_sales_over_time(TIMESTAMPTZ, TIMESTAMPTZ, TEXT) TO service_role;


-- 3. Top Products by Revenue
CREATE OR REPLACE FUNCTION get_top_products_by_revenue(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
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
    MAX(p.name) as name, -- Aggregate name (should be same)
    SUM(oi.unit_price * oi.quantity) as revenue,
    SUM(oi.quantity)::INTEGER as units_sold
  FROM order_items oi
  JOIN orders o ON oi.order_id = o.id
  LEFT JOIN products p ON oi.product_id = p.id
  WHERE o.created_at BETWEEN start_date AND end_date
  AND o.status = 'paid'
  GROUP BY oi.product_id
  ORDER BY revenue DESC
  LIMIT limit_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_top_products_by_revenue(TIMESTAMPTZ, TIMESTAMPTZ, INTEGER) TO service_role;

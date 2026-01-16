-- Migration: Update Analytics RPCs for Partial COD Support
-- Purpose: Include 'confirmed_partial' status in revenue and order metrics.

-- 1. Update get_analytics_summary
CREATE OR REPLACE FUNCTION get_analytics_summary(
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

  -- Base Aggregates (Included Paid and Confirmed Partial)
  SELECT 
    COALESCE(SUM(total), 0), 
    COUNT(*)
  INTO v_total_revenue, v_total_orders
  FROM orders
  WHERE created_at BETWEEN v_start_date AND v_end_date
  AND status IN ('paid', 'confirmed_partial');

  -- 1. Unique Customers in Period
  SELECT COUNT(DISTINCT user_id) INTO v_unique_customers
  FROM orders
  WHERE created_at BETWEEN v_start_date AND v_end_date 
  AND status IN ('paid', 'confirmed_partial');

  -- 2. Returning Customers (Active in period, >1 Lifetime Order)
  SELECT COUNT(*) INTO v_returning_customers FROM (
    SELECT user_id
    FROM orders
    WHERE user_id IN (
      SELECT DISTINCT user_id FROM orders 
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update get_sales_over_time
CREATE OR REPLACE FUNCTION get_sales_over_time(
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
  FROM orders
  WHERE created_at BETWEEN v_start_date AND v_end_date
  AND status IN ('paid', 'confirmed_partial')
  GROUP BY 1
  ORDER BY 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update get_top_products_by_revenue
CREATE OR REPLACE FUNCTION get_top_products_by_revenue(
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
  FROM order_items oi
  JOIN orders o ON oi.order_id = o.id
  LEFT JOIN products p ON oi.product_id = p.id
  WHERE o.created_at BETWEEN v_start_date AND v_end_date
  AND o.status IN ('paid', 'confirmed_partial')
  GROUP BY oi.product_id
  ORDER BY revenue DESC
  LIMIT limit_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

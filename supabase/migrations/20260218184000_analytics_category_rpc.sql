-- Analytics Expansion: Sales by Category RPC
-- Goal: Provide range-filterable category revenue for the unified dashboard.

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

GRANT EXECUTE ON FUNCTION public.get_sales_by_category(TEXT, TEXT) TO authenticated;

-- Enrich get_top_products_by_revenue with metadata
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

GRANT EXECUTE ON FUNCTION public.get_top_products_by_revenue(TEXT, TEXT, INTEGER) TO authenticated;

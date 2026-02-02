-- Waitlist Analytics RPC
-- Efficiently aggregates preorder counts per product

CREATE OR REPLACE FUNCTION get_waitlist_summary(
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
DECLARE
  v_offset INT;
BEGIN
  v_offset := (page - 1) * page_limit;
  
  RETURN QUERY
  SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.main_image_url AS thumbnail,
    COUNT(po.user_id) AS waitlist_count,
    MAX(po.created_at) AS last_activity
  FROM 
    public.preorders po
  JOIN 
    public.products p ON po.product_id = p.id
  GROUP BY 
    p.id, p.name, p.main_image_url
  ORDER BY 
    waitlist_count DESC, last_activity DESC
  LIMIT page_limit
  OFFSET v_offset;
END;
$$ LANGUAGE plpgsql;

-- Also a helper to get total count of waitlisted products (items that have at least 1 waiter)
CREATE OR REPLACE FUNCTION get_waitlist_summary_count()
RETURNS BIGINT AS $$
  SELECT COUNT(DISTINCT product_id) FROM public.preorders;
$$ LANGUAGE sql;


-- Upgrade Search RPC to use pg_trgm similarity for robust fuzzy ranking
-- Handles typos and partial matches with high accuracy
-- VERSION 2: Includes total_stock and other essential metadata for list views

DROP FUNCTION IF EXISTS search_products_v2(TEXT, INTEGER);

CREATE OR REPLACE FUNCTION search_products_v2(
  query_text TEXT,
  limit_val INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  price DECIMAL,
  original_price DECIMAL,
  main_image_url TEXT,
  category_name TEXT,
  total_stock INTEGER,
  size_options TEXT[],
  color_options TEXT[],
  average_rating NUMERIC,
  review_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    p.price,
    p.original_price,
    p.main_image_url,
    c.name as category_name,
    p.total_stock,
    p.size_options,
    p.color_options,
    COALESCE(r.avg_rating, 0) as average_rating,
    COALESCE(r.review_count, 0) as review_count
  FROM
    products p
  LEFT JOIN
    categories c ON p.category_id = c.id
  LEFT JOIN (
    SELECT 
        product_id,
        AVG(rating)::numeric(3,2) as avg_rating,
        COUNT(*) as review_count
    FROM 
        reviews
    GROUP BY 
        product_id
  ) r ON p.id = r.product_id
  WHERE
    p.is_active = true
    AND (
      similarity(p.name, query_text) > 0.2
      OR
      to_tsvector('english', p.name || ' ' || COALESCE(p.description, '') || ' ' || COALESCE(c.name, '')) @@ websearch_to_tsquery('english', query_text)
      OR
      p.expression_tags @> ARRAY[query_text]
    )
  ORDER BY
    similarity(p.name, query_text) DESC,
    ts_rank(to_tsvector('english', p.name), websearch_to_tsquery('english', query_text)) DESC,
    p.price DESC
  LIMIT limit_val;
END;
$$;

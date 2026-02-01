-- Enterprise Phase 2: Advanced Search & Intelligence

-- 1. Full-Text Search Setup
-- Add a generated column that combines name, description, and category for searchable text
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(name, '')), 'A') || 
  setweight(to_tsvector('english', coalesce(description, '')), 'B')
  -- We could join categories here but keeping it simple for now (perf)
) STORED;

-- Create GIN Index for lightning-fast text search
CREATE INDEX IF NOT EXISTS idx_products_search ON public.products USING GIN (search_vector);

-- 2. Advanced Search RPC
-- Use DROP FUNCTION to handle potential signature changes or conflicts
DROP FUNCTION IF EXISTS search_products_v2(TEXT, INTEGER);

CREATE OR REPLACE FUNCTION search_products_v2(
  query_text TEXT, 
  limit_val INTEGER DEFAULT 5
) 
RETURNS TABLE (
  id UUID,
  name TEXT,
  price DECIMAL,
  main_image_url TEXT,
  slug TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.price,
    p.main_image_url,
    p.slug,
    ts_rank(p.search_vector, websearch_to_tsquery('english', query_text)) as rank
  FROM public.products p
  WHERE 
    p.is_active = true 
    AND (
      p.search_vector @@ websearch_to_tsquery('english', query_text)
      OR
      p.name ILIKE '%' || query_text || '%' -- Fallback for partial matches
    )
  ORDER BY rank DESC, p.sale_count DESC
  LIMIT limit_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION search_products_v2(TEXT, INTEGER) TO public;

-- 3. Trending Products Algorithm
-- Score = (Sales * 2) + (Review Count * 0.5) + (Average Rating * 10)
DROP FUNCTION IF EXISTS get_trending_products(INTEGER);

CREATE OR REPLACE FUNCTION get_trending_products(limit_val INTEGER DEFAULT 10)
RETURNS SETOF public.products AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.products
  WHERE is_active = true
  ORDER BY (
    (coalesce(sale_count, 0) * 2.0) + 
    (coalesce(review_count, 0) * 0.5) + 
    (coalesce(average_rating, 0) * 10.0)
  ) DESC
  LIMIT limit_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_trending_products(INTEGER) TO public;

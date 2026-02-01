-- Enable the pg_trgm extension for fuzzy string matching (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create a robust search function using websearch_to_tsquery for natural language search
-- and also ILIKE for partial matches as a fallback

-- CRITICAL: Drop first because return type might have changed from previous migration
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
  main_image_url TEXT,
  category_name TEXT
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
    p.main_image_url,
    c.name as category_name
  FROM
    products p
  LEFT JOIN
    categories c ON p.category_id = c.id
  WHERE
    p.is_active = true
    AND (
      -- 1. Full Text Search match (English dictionary)
      to_tsvector('english', p.name || ' ' || COALESCE(p.description, '') || ' ' || COALESCE(c.name, '')) @@ websearch_to_tsquery('english', query_text)
      OR
      -- 2. Simple ILIKE match for partial words (e.g. "shir" -> "Shirt")
      p.name ILIKE '%' || query_text || '%'
      OR
      c.name ILIKE '%' || query_text || '%'
    )
  ORDER BY
    -- Prioritize exact Full Text Rank
    ts_rank(to_tsvector('english', p.name), websearch_to_tsquery('english', query_text)) DESC,
    -- Then price descending (optional, or sales count if available)
    p.price DESC
  LIMIT limit_val;
END;
$$;

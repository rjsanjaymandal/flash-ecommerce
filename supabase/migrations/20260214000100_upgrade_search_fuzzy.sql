-- Upgrade Search RPC to use pg_trgm similarity for robust fuzzy ranking
-- Handles typos and partial matches with high accuracy

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
  -- Set similarity threshold if needed (Postgres default is 0.3)
  -- SET LOCAL pg_trgm.similarity_threshold = 0.2;

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
      -- 1. Trigram similarity (Fuzzy match)
      similarity(p.name, query_text) > 0.2
      OR
      -- 2. Full Text Search match (Keyword match)
      to_tsvector('english', p.name || ' ' || COALESCE(p.description, '') || ' ' || COALESCE(c.name, '')) @@ websearch_to_tsquery('english', query_text)
      OR
      -- 3. Array overlap for tags (Exact tag match)
      p.expression_tags @> ARRAY[query_text]
    )
  ORDER BY
    -- Prioritize by similarity score first
    similarity(p.name, query_text) DESC,
    -- Then by Full Text Rank
    ts_rank(to_tsvector('english', p.name), websearch_to_tsquery('english', query_text)) DESC,
    p.price DESC
  LIMIT limit_val;
END;
$$;

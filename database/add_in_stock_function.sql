-- Computed column function for sorting by stock status
-- Allows sorting by "in_stock" in Supabase queries
CREATE OR REPLACE FUNCTION in_stock(product_row products) 
RETURNS boolean AS $$ 
  SELECT EXISTS (
    SELECT 1 
    FROM product_stock 
    WHERE product_id = product_row.id 
    AND quantity > 0
  ); 
$$ LANGUAGE sql STABLE;

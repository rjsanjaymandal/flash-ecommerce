-- Add a generated column for full text search if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS search_vector tsvector 
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(name, '')), 'A') || 
  setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(slug, '')), 'C')
) STORED;

-- Create a GIN index for fast searching
CREATE INDEX IF NOT EXISTS products_search_idx ON products USING GIN (search_vector);

-- Function to help with search queries (optional, but good for RPC if needed later, though we will try to use client-side query building first)

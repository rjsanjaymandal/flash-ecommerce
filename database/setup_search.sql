-- Enable the pg_trgm extension if not already enabled (optional but usually pre-installed on Supabase)
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create the GIN index for Full Text Search on the 'name' column
-- Using 'english' configuration as requested.
CREATE INDEX IF NOT EXISTS products_name_search_idx ON products USING GIN (to_tsvector('english', name));

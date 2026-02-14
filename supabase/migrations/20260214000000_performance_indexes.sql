-- Phase 2 Performance Optimization Indexes
-- Target: Speed up product filtering, searching, and related product lookups.

-- 1. Index for active status and categories (extremely common filters)
CREATE INDEX IF NOT EXISTS idx_products_status_category ON products (status, category_id) WHERE status = 'active';

-- 2. Index for carousel featured items
CREATE INDEX IF NOT EXISTS idx_products_carousel ON products (is_carousel_featured) WHERE is_carousel_featured = true;

-- 3. GIN index for expression_tags (Overlaps search)
-- Requires pg_trgm for ilike but for overlaps it uses standard GIN
CREATE INDEX IF NOT EXISTS idx_products_tags_gin ON products USING GIN (expression_tags);

-- 4. Index for sorting by created_at (Newest first)
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at DESC);

-- 5. Index for total_stock (Availability sorting)
CREATE INDEX IF NOT EXISTS idx_products_total_stock ON products (total_stock DESC);

-- 6. Composite index for product_stock (Size/Color lookups)
CREATE INDEX IF NOT EXISTS idx_product_stock_lookup ON product_stock (product_id, size, color);

-- 7. Index for slug lookups (Product details)
CREATE INDEX IF NOT EXISTS idx_products_slug ON products (slug);

-- 8. GIN index for text search optimization on name and tags
-- This helps with the .or() query used in applyProductFilters
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_tags_trgm ON products USING gin (expression_tags gin_trgm_ops);

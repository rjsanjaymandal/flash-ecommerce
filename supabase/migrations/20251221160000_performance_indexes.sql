-- Optimizing frequent lookups with B-Tree Indexes

-- 1. Products Table: Filter by Category and Status (Homepage)
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
-- Composite index for common "Active products in Category" query
CREATE INDEX IF NOT EXISTS idx_products_active_category ON products(is_active, category_id);

-- 2. Orders Table: User History (Account Page)
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- 3. Reviews Table: Product Reviews (Product Page)
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
-- Composite for "Approved Reviews for Product"
CREATE INDEX IF NOT EXISTS idx_reviews_product_approved ON reviews(product_id, is_approved);

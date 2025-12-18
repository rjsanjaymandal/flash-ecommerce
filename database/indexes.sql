-- Composite index for filtering products (Category + Activity + Sorting by Price)
CREATE INDEX IF NOT EXISTS products_filter_idx ON products (category_id, is_active, price);

-- Index for User Orders sorted by date (Dashboard performance)
CREATE INDEX IF NOT EXISTS orders_user_date_idx ON orders (user_id, created_at DESC);

-- Index for joined inventory lookups
CREATE INDEX IF NOT EXISTS product_stock_pid_idx ON product_stock (product_id);

-- Index for admin product search/filtering independent of full text search (if needed for table views)
CREATE INDEX IF NOT EXISTS products_created_at_idx ON products (created_at DESC);

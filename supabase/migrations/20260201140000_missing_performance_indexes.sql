-- Performance Indexes for Order Items (Critical for Order History & details)
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Performance Indexes for Reverse Lookups (Analytics / "Who added this to cart?")
-- Note: Forward lookups by user_id are covered by existing composite UNIQUE constraints.
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id ON wishlist_items(product_id);

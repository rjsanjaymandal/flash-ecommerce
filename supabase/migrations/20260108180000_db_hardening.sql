-- Database Hardening: Performance Indexes

-- 1. Product Stock: Critical for 'reserve_stock' locking performance
-- We typically query by (product_id, size, color) or just (product_id)
CREATE INDEX IF NOT EXISTS idx_stock_lookup_composite 
ON public.product_stock (product_id, size, color);

-- 2. Cart Items: Critical for cart operations and sync
CREATE INDEX IF NOT EXISTS idx_cart_items_user_lookup 
ON public.cart_items (user_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_product_lookup 
ON public.cart_items (product_id);

-- 3. Notifications: Critical for the new Navbar Bell query (get unread)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON public.notifications (user_id, is_read);

-- 4. Order Items: Critical for 'reserve_stock' loop (fetching items by order_id)
CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
ON public.order_items (order_id);

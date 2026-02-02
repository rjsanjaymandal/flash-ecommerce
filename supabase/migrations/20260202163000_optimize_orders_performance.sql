-- Optimizing Order Queries
-- Most common access patterns:
-- 1. "Recent Orders": ORDER BY created_at DESC
-- 2. "Pending Orders": WHERE status = 'paid' / 'pending' ORDER BY created_at DESC

CREATE INDEX IF NOT EXISTS idx_orders_created_at 
ON public.orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_status 
ON public.orders(status);

-- Composite index for filtering + sorting (Covering Index)
-- "Show me all PAID orders sorted by DATE"
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at 
ON public.orders(status, created_at DESC);

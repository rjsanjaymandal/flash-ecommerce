-- Create a new migration to add price_addon to product_stock
ALTER TABLE public.product_stock ADD COLUMN IF NOT EXISTS price_addon NUMERIC(10, 2) DEFAULT 0;

-- Migration: Fix Product Schema Holes
-- Description: Adds sku, barcode, cost_price to 'products' table for simple products.

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS sku text,
ADD COLUMN IF NOT EXISTS barcode text,
ADD COLUMN IF NOT EXISTS cost_price numeric DEFAULT 0;

-- Optional: Index for SKU
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);

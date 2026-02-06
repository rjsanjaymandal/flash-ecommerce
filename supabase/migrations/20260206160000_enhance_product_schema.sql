-- Migration: Enhance Product Schema for Shopify-style Form
-- Description: Adds status, SEO fields, and inventory cost/tracking.

-- 1. Enhance 'products' table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('draft', 'active', 'archived')) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS seo_title text,
ADD COLUMN IF NOT EXISTS seo_description text;

-- Helper to migrate existing is_active to status
UPDATE public.products
SET status = CASE 
    WHEN is_active = true THEN 'active'
    ELSE 'draft'
END
WHERE status = 'draft'; -- Only update if still default

-- 2. Enhance 'product_stock' table (Variants)
ALTER TABLE public.product_stock
ADD COLUMN IF NOT EXISTS sku text,
ADD COLUMN IF NOT EXISTS barcode text,
ADD COLUMN IF NOT EXISTS cost_price numeric DEFAULT 0;

-- 3. Add Indexes for new searchable fields usually helps
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_product_stock_sku ON public.product_stock(sku);

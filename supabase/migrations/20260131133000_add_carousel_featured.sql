-- Add carousel marketing flag to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_carousel_featured BOOLEAN DEFAULT false;

-- Index for performance in carousel queries
CREATE INDEX IF NOT EXISTS idx_products_is_carousel_featured ON public.products(is_carousel_featured) WHERE is_active = true;

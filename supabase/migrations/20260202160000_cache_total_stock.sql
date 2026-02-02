-- Add total_stock column to products for O(1) sorting and filtering
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS total_stock INTEGER DEFAULT 0;

-- Function to calculate and update total_stock for a product
CREATE OR REPLACE FUNCTION public.sync_product_total_stock()
RETURNS TRIGGER AS $$
DECLARE
  v_product_id UUID;
  v_total INTEGER;
BEGIN
  -- Determine product_id based on operation
  IF (TG_OP = 'DELETE') THEN
    v_product_id := OLD.product_id;
  ELSE
    v_product_id := NEW.product_id;
  END IF;

  -- Calculate new total
  SELECT COALESCE(SUM(quantity), 0) INTO v_total
  FROM public.product_stock
  WHERE product_id = v_product_id;

  -- Update product
  UPDATE public.products
  SET total_stock = v_total
  WHERE id = v_product_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for INSERT/UPDATE/DELETE on product_stock
DROP TRIGGER IF EXISTS trg_sync_total_stock ON public.product_stock;

CREATE TRIGGER trg_sync_total_stock
  AFTER INSERT OR UPDATE OR DELETE ON public.product_stock
  FOR EACH ROW
  EXECUTE PROCEDURE public.sync_product_total_stock();

-- Backfill existing data
UPDATE public.products p
SET total_stock = (
  SELECT COALESCE(SUM(quantity), 0)
  FROM public.product_stock ps
  WHERE ps.product_id = p.id
);

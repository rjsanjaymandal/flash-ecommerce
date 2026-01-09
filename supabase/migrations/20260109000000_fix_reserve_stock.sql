-- Fix reserve_stock to handle NULL vs Empty String interchangeably
-- This prevents "Failed to reserve inventory" when the DB has NULL but client sends "" or vice-versa

CREATE OR REPLACE FUNCTION reserve_stock(p_order_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_item RECORD;
  v_updated_rows INTEGER;
BEGIN
  -- Loop through items and decrement
  FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id LOOP
    
    UPDATE public.product_stock 
    SET quantity = quantity - v_item.quantity
    WHERE product_id = v_item.product_id 
    -- Robust comparison: treat NULL and '' as equivalent
    AND COALESCE(size, '') = COALESCE(v_item.size, '')
    AND COALESCE(color, '') = COALESCE(v_item.color, '')
    AND quantity >= v_item.quantity;

    GET DIAGNOSTICS v_updated_rows = ROW_COUNT;

    IF v_updated_rows = 0 THEN
      -- Detailed error for debugging
      RAISE EXCEPTION 'Insufficient stock for Product: %, Size: %, Color: %', 
        v_item.product_id, 
        COALESCE(v_item.size, 'N/A'), 
        COALESCE(v_item.color, 'N/A');
    END IF;

    -- Update product sale count
    UPDATE public.products 
    SET sale_count = sale_count + v_item.quantity
    WHERE id = v_item.product_id;
    
  END LOOP;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION reserve_stock(UUID) TO service_role;

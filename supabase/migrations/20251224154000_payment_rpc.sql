-- Atomic Payment Processing RPC
-- Handles: Stock decrement, Order status update, Loyalty points awarding
-- Ensures data consistency and prevents race conditions

CREATE OR REPLACE FUNCTION process_payment(
  p_order_id UUID,
  p_payment_id TEXT
) RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_points INTEGER;
  v_updated_rows INTEGER;
BEGIN
  -- 1. Get Order & Lock for Update to prevent concurrent processing
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  
  -- If order doesn't exist, fail
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  -- 2. Idempotency Check: If already paid, just return success
  IF v_order.status = 'paid' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already processed');
  END IF;

  -- 3. Decrement Stock for all items in the order
  -- We loop through order items and update corresponding stock records
  FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id LOOP
    
    -- Attempt to decrement stock. 
    -- We match on product_id, size, and color (consistent with schema)
    UPDATE public.product_stock 
    SET quantity = quantity - v_item.quantity
    WHERE product_id = v_item.product_id 
    AND (size = v_item.size OR (size IS NULL AND v_item.size IS NULL))
    AND (color = v_item.color OR (color IS NULL AND v_item.color IS NULL))
    AND quantity >= v_item.quantity;

    GET DIAGNOSTICS v_updated_rows = ROW_COUNT;

    -- If no row was updated, it means insufficient stock or record not found
    IF v_updated_rows = 0 THEN
      RAISE EXCEPTION 'Insufficient stock for product % (size %, color %)', 
        v_item.product_id, COALESCE(v_item.size, 'N/A'), COALESCE(v_item.color, 'N/A');
    END IF;
    -- 4. Increment sale_count on product
    UPDATE public.products 
    SET sale_count = sale_count + v_item.quantity
    WHERE id = v_item.product_id;
  END LOOP;

  -- 5. Update Order Status
  UPDATE public.orders 
  SET 
    status = 'paid', 
    payment_reference = p_payment_id,
    updated_at = now()
  WHERE id = p_order_id;

  -- 6. Award Loyalty Points
  -- 1 point per 100 currency units (e.g. INR)
  IF v_order.user_id IS NOT NULL AND v_order.total >= 100 THEN
    v_points := floor(v_order.total / 100);
    IF v_points > 0 THEN
      UPDATE public.profiles 
      SET 
        loyalty_points = COALESCE(loyalty_points, 0) + v_points,
        updated_at = now()
      WHERE id = v_order.user_id;
    END IF;
  END IF;

  RETURN jsonb_build_object('success', true);

EXCEPTION WHEN OTHERS THEN
  -- All changes are automatically rolled back on exception
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access ONLY to service_role for maximum security
-- Since this handles stock and points without internal owner checks
REVOKE ALL ON FUNCTION process_payment(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION process_payment(UUID, TEXT) TO service_role;

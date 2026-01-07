-- 1. Create function to reserve stock (Called at Order Creation)
-- This ensures stock is held immediately when the user attempts to pay
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
    AND (size = v_item.size OR (size IS NULL AND v_item.size IS NULL))
    AND (color = v_item.color OR (color IS NULL AND v_item.color IS NULL))
    AND quantity >= v_item.quantity;

    GET DIAGNOSTICS v_updated_rows = ROW_COUNT;

    IF v_updated_rows = 0 THEN
      RAISE EXCEPTION 'Insufficient stock for product %', v_item.product_id;
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


-- 2. Update process_payment to remove stock decrement (it's already done)
CREATE OR REPLACE FUNCTION process_payment(
  p_order_id UUID,
  p_payment_id TEXT
) RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_points INTEGER;
BEGIN
  -- Get Order
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  IF v_order.status = 'paid' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already processed');
  END IF;

  -- NOTE: Stock decrement is now handled by reserve_stock at creation time.
  -- We proceed directly to status update.

  -- Update Order Status
  UPDATE public.orders 
  SET 
    status = 'paid', 
    payment_reference = p_payment_id,
    updated_at = now()
  WHERE id = p_order_id;

  -- Award Loyalty Points
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

  -- Create Notification
  IF v_order.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, action_url)
    VALUES (
      v_order.user_id,
      'Order Confirmed', 
      'Your order #' || substring(p_order_id::text, 1, 8) || ' has been paid successfully.',
      '/account/orders/' || p_order_id
    );
  END IF;

  RETURN jsonb_build_object('success', true);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION process_payment(UUID, TEXT) TO service_role;

-- Fix Double Decrement Bug in process_payment
-- Previously, both reserve_stock (at creation) and process_payment (at payment) decremented stock.
-- This caused valid payments to fail database processing ("Insufficient Stock") because it was already taken.
-- We now remove stock decrement from process_payment.

CREATE OR REPLACE FUNCTION process_payment(
  p_order_id UUID,
  p_payment_id TEXT
) RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_points INTEGER;
BEGIN
  -- 1. Get Order & Lock
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  -- 2. Idempotency Check
  IF v_order.status = 'paid' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already processed');
  END IF;

  -- 3. REMOVED STOCK DECREMENT LOGIC
  -- Stock is reserved at order creation via reserve_stock().
  -- We assume 'pending' orders hold the stock.
  -- If we implement auto-cancellation, that process handles restocking.

  -- 4. Update Order Status
  UPDATE public.orders 
  SET 
    status = 'paid', 
    payment_reference = p_payment_id,
    updated_at = now()
  WHERE id = p_order_id;

  -- 5. Award Loyalty Points
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

  -- 6. Create Notification
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

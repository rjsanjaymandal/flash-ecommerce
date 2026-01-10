-- Payment Processing V2
-- Replaces process_payment to ensure the 'Double Decrement' bug is fixed.
-- This function DOES NOT decrement stock (stock is reserved at order creation).
-- It only updates status, awards points, and notifies.

CREATE OR REPLACE FUNCTION process_payment_v2(
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

  -- 3. Update Order Status (Mark as PAID)
  UPDATE public.orders 
  SET 
    status = 'paid', 
    payment_reference = p_payment_id,
    updated_at = now()
  WHERE id = p_order_id;

  -- 4. Award Loyalty Points (1 point per 100 currency units)
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

  -- 5. Create In-App Notification
  IF v_order.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, action_url, type)
    VALUES (
      v_order.user_id,
      'Order Confirmed', 
      'Your order #' || substring(p_order_id::text, 1, 8) || ' has been paid successfully.',
      '/order/confirmation/' || p_order_id,
      'success'
    );
  END IF;

  RETURN jsonb_build_object('success', true);

EXCEPTION WHEN OTHERS THEN
  -- Log error for debugging
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION process_payment_v2(UUID, TEXT) TO service_role;

-- Migration: Master Payment Engine v5 (Enterprise Scalability)
-- Purpose: Unified logic for Prepaid, COD, and Partial COD.

-- 1. Order Lifecycle Events Audit Table
CREATE TABLE IF NOT EXISTS order_lifecycle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- e.g., 'STATE_CHANGE', 'PAYMENT_RECEIVED', 'RESTOCK'
  old_status TEXT,
  new_status TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Master Payment Engine RPC v5
CREATE OR REPLACE FUNCTION finalize_payment_v5(
  p_order_id UUID,
  p_payment_id TEXT,
  p_amount_paid_paise NUMERIC, -- amount in paise (e.g. 10000 for ₹100)
  p_method TEXT DEFAULT 'PREPAID' -- 'PREPAID', 'PARTIAL_COD', 'COD'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_total_rupees NUMERIC;
  v_amount_paid_rupees NUMERIC;
  v_user_id UUID;
  v_old_status TEXT;
  v_new_status TEXT;
  v_due_amount_rupees NUMERIC;
  v_points_to_award INT;
BEGIN
  -- 1. Lock and Verify Order
  SELECT total, user_id, status
  INTO v_order_total_rupees, v_user_id, v_old_status
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Order not found');
  END IF;

  -- 2. Idempotency Check
  IF v_old_status IN ('paid', 'confirmed_partial', 'shipped', 'delivered') AND p_method != 'COD' THEN
    RETURN json_build_object('success', true, 'message', 'Order already processed');
  END IF;

  v_amount_paid_rupees := p_amount_paid_paise / 100.0;

  -- 3. Determine New Status and Due Amount
  IF p_method = 'PREPAID' THEN
      v_new_status := 'paid';
      v_due_amount_rupees := 0;
  ELSIF p_method = 'PARTIAL_COD' THEN
      v_new_status := 'confirmed_partial';
      v_due_amount_rupees := v_order_total_rupees - v_amount_paid_rupees;
  ELSIF p_method = 'COD' THEN
      v_new_status := 'pending'; -- Standard COD might start as pending or confirmed based on business logic
      v_due_amount_rupees := v_order_total_rupees;
  ELSE
      RETURN json_build_object('success', false, 'error', 'Invalid payment method');
  END IF;

  -- 4. Atomic Update
  UPDATE orders
  SET 
    status = v_new_status::order_status,
    payment_method = p_method,
    paid_amount = v_amount_paid_rupees,
    due_amount = v_due_amount_rupees,
    payment_reference = p_payment_id,
    updated_at = NOW()
  WHERE id = p_order_id;

  -- 5. Audit Log (Lifecycle Event)
  INSERT INTO order_lifecycle_events (order_id, event_type, old_status, new_status, metadata)
  VALUES (
    p_order_id, 
    'PAYMENT_FINALIZATION', 
    v_old_status, 
    v_new_status, 
    jsonb_build_object('method', p_method, 'paid', v_amount_paid_rupees, 'due', v_due_amount_rupees, 'ref', p_payment_id)
  );

  -- 6. Loyalty Points (Only on total confirmed or prepaid)
  -- For Partial COD, we award points now as they have committed.
  IF v_user_id IS NOT NULL AND v_order_total_rupees >= 100 THEN
    v_points_to_award := FLOOR(v_order_total_rupees / 100);
    IF v_points_to_award > 0 THEN
      UPDATE profiles
      SET loyalty_points = COALESCE(loyalty_points, 0) + v_points_to_award
      WHERE id = v_user_id;
    END IF;
  END IF;

  -- 7. Notifications
  IF v_user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, action_url)
    VALUES (
      v_user_id,
      CASE WHEN v_new_status = 'paid' THEN 'Order Paid' ELSE 'Order Confirmed (Partial COD)' END,
      'Order #' || SUBSTRING(p_order_id::TEXT, 1, 8) || ' is ' || v_new_status || '.',
      'success',
      '/order/confirmation/' || p_order_id
    );
  END IF;

  RETURN json_build_object('success', true, 'status', v_new_status, 'due', v_due_amount_rupees);

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

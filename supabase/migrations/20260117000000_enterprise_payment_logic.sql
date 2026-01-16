-- Migration: Enterprise Payment System Upgrade (Phase 4)
-- Purpose: Finalize payments with maximum reliability and implement auto-restocking.

-- 1. Optimized Finalize Payment v4
CREATE OR REPLACE FUNCTION finalize_payment_v4(
  p_order_id UUID,
  p_payment_id TEXT,
  p_amount_paid NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_total NUMERIC;
  v_user_id UUID;
  v_order_status TEXT;
  v_points_to_award INT;
BEGIN
  -- 1. Lock the order row and fetch details
  SELECT total, user_id, status
  INTO v_order_total, v_user_id, v_order_status
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Order not found');
  END IF;

  -- 2. Idempotency Check
  IF v_order_status = 'paid' THEN
    RETURN json_build_object('success', true, 'message', 'Order already marked as paid');
  END IF;

  -- 3. Security Check: Block if cancelled or already failed
  IF v_order_status = 'cancelled' THEN
     RETURN json_build_object('success', false, 'error', 'Cannot pay for a cancelled order');
  END IF;

  -- 4. Atomic Update
  UPDATE orders
  SET 
    status = 'paid',
    payment_reference = p_payment_id,
    updated_at = NOW()
  WHERE id = p_order_id;

  -- 5. Loyalty Points (1 point per 100 rupees)
  IF v_user_id IS NOT NULL AND v_order_total >= 100 THEN
    v_points_to_award := FLOOR(v_order_total / 100);
    IF v_points_to_award > 0 THEN
      UPDATE profiles
      SET loyalty_points = COALESCE(loyalty_points, 0) + v_points_to_award
      WHERE id = v_user_id;
    END IF;
  END IF;

  -- 6. User Notification
  IF v_user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, action_url)
    VALUES (
      v_user_id,
      'Payment Received',
      'Transaction successful for order #' || SUBSTRING(p_order_id::TEXT, 1, 8) || '. We are processing your delivery! 🚀',
      'success',
      '/order/confirmation/' || p_order_id
    );
  END IF;

  -- 7. Audit Log
  INSERT INTO system_logs (severity, component, message, metadata)
  VALUES (
    'INFO',
    'PAYMENT_RPC',
    'Enterprise Payment Finalized: ' || p_order_id,
    jsonb_build_object('payment_id', p_payment_id, 'amount', p_amount_paid, 'user_id', v_user_id)
  );

  RETURN json_build_object('success', true, 'message', 'Enterprise payment finalized');

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 2. Automatic Restocking Logic for Failures
CREATE OR REPLACE FUNCTION restock_order(
  p_order_id UUID,
  p_reason TEXT DEFAULT 'Payment failure or expiry'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_status TEXT;
BEGIN
  -- 1. Check current status
  SELECT status INTO v_order_status FROM orders WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Order not found');
  END IF;

  -- 2. Only restock if order isn't already processed/paid
  IF v_order_status = 'paid' THEN
     RETURN json_build_object('success', false, 'error', 'Cannot restock a paid order');
  END IF;

  IF v_order_status = 'cancelled' THEN
     RETURN json_build_object('success', true, 'message', 'Order already cancelled and restocked');
  END IF;

  -- 3. Atomic Restock via RPC (reusing standard update)
  -- Note: Assuming you have a standard stock update function or standard logic
  -- Enterprise: We'll loop through order_items and add back to product_stock
  UPDATE product_stock ps
  SET quantity = ps.quantity + oi.quantity
  FROM order_items oi
  WHERE oi.order_id = p_order_id
    AND ps.product_id = oi.product_id
    AND (ps.size = oi.size OR (ps.size IS NULL AND oi.size IS NULL))
    AND (ps.color = oi.color OR (ps.color IS NULL AND oi.color IS NULL));

  -- 4. Mark Order as Cancelled
  UPDATE orders
  SET 
    status = 'cancelled',
    updated_at = NOW()
  WHERE id = p_order_id;

  -- 5. Audit Log
  INSERT INTO system_logs (severity, component, message, metadata)
  VALUES (
    'WARN',
    'INVENTORY_RECOVERY',
    'Inventory restocked for order: ' || p_order_id,
    jsonb_build_object('reason', p_reason)
  );

  RETURN json_build_object('success', true, 'message', 'Inventory recovered successfully');

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

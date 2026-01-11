-- Migration: Finalize Payment v3 (Atomic Transaction)
-- Purpose: Handle payments atomically to prevent partial state updates.

create or replace function finalize_payment_v3(
  p_order_id uuid,
  p_payment_id text,
  p_amount_paid numeric -- Passed from Razorpay verification for double-check (optional logs)
)
returns json
language plpgsql
security definer
as $$
declare
  v_order_total numeric;
  v_user_id uuid;
  v_current_points int;
  v_points_to_award int;
  v_order_status text;
begin
  -- 1. Lock and Get Order Details
  select total, user_id, status
  into v_order_total, v_user_id, v_order_status
  from orders
  where id = p_order_id
  for update; -- Lock row to prevent race conditions

  if not found then
    return json_build_object('success', false, 'error', 'Order not found');
  end if;

  -- 2. Idempotency Check
  if v_order_status = 'paid' then
    return json_build_object('success', true, 'message', 'Order already paid');
  end if;

  -- 3. Update Order Status
  update orders
  set 
    status = 'paid',
    payment_reference = p_payment_id,
    updated_at = now()
  where id = p_order_id;

  -- 4. Award Loyalty Points (1 point per 100 rupees)
  if v_user_id is not null and v_order_total >= 100 then
    v_points_to_award := floor(v_order_total / 100);
    
    if v_points_to_award > 0 then
      update profiles
      set loyalty_points = coalesce(loyalty_points, 0) + v_points_to_award
      where id = v_user_id;
    end if;
  end if;

  -- 5. Create Notification
  if v_user_id is not null then
    insert into notifications (user_id, title, message, type, action_url)
    values (
      v_user_id,
      'Order Confirmed',
      'Your order #' || substring(p_order_id::text, 1, 8) || ' is successfully paid. 🚀',
      'success',
      '/order/confirmation/' || p_order_id
    );
  end if;

  return json_build_object('success', true, 'message', 'Payment finalized successfully');

exception when others then
  return json_build_object('success', false, 'error', SQLERRM);
end;
$$;

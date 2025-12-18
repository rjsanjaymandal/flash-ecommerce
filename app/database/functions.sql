-- Database Function: Atomic Stock Decrement
-- Run this in your Supabase SQL Editor to create the function.

create or replace function decrement_stock(
  p_product_id uuid,
  p_size text,
  p_color text,
  p_quantity int
)
returns void
language plpgsql
security definer
as $$
declare
  current_qty int;
begin
  -- Lock the row for update to prevent race conditions
  select quantity into current_qty
  from product_stock
  where product_id = p_product_id
  and size = p_size
  and color = p_color
  for update;

  -- Check if record exists
  if not found then
    raise exception 'Stock record not found for Product: %, Size: %, Color: %', p_product_id, p_size, p_color;
  end if;

  -- Check for sufficient stock
  if current_qty < p_quantity then
    raise exception 'Insufficient stock. Available: %, Requested: %', current_qty, p_quantity;
  end if;

  -- Perform the update
  update product_stock
  set quantity = quantity - p_quantity
  where product_id = p_product_id
  and size = p_size
  and color = p_color;
end;
$$;

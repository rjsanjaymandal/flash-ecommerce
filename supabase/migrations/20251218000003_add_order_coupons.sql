alter table orders
add column coupon_code text,
add column discount_amount numeric default 0;

comment on column orders.discount_amount is 'The total discount amount applied to the order';

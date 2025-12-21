-- Enable RLS on all tables
alter table "public"."products" enable row level security;
alter table "public"."categories" enable row level security;
alter table "public"."reviews" enable row level security;
alter table "public"."profiles" enable row level security;
alter table "public"."orders" enable row level security;
alter table "public"."order_items" enable row level security;
alter table "public"."cart_items" enable row level security;
alter table "public"."wishlist_items" enable row level security;
alter table "public"."addresses" enable row level security;
alter table "public"."product_stock" enable row level security;
alter table "public"."content_hero" enable row level security;
alter table "public"."content_globals" enable row level security;
alter table "public"."coupons" enable row level security;
alter table "public"."newsletter_subscribers" enable row level security;
alter table "public"."feedback" enable row level security;

-- HELPER FUNCTIONS
create or replace function is_admin()
returns boolean as $$
begin
  return (select role from public.profiles where id = auth.uid()) = 'admin';
end;
$$ language plpgsql security definer;

-- POLICIES

-- Products & Categories (Public Read, Admin Write)
create policy "Public Read Products" on "public"."products" for select using (true);
create policy "Admin Write Products" on "public"."products" for all using (is_admin());

create policy "Public Read Categories" on "public"."categories" for select using (true);
create policy "Admin Write Categories" on "public"."categories" for all using (is_admin());

create policy "Public Read Stock" on "public"."product_stock" for select using (true);
create policy "Admin Write Stock" on "public"."product_stock" for all using (is_admin());

-- Content (Public Read, Admin Write)
create policy "Public Read Hero" on "public"."content_hero" for select using (true);
create policy "Admin Write Hero" on "public"."content_hero" for all using (is_admin());

create policy "Public Read Globals" on "public"."content_globals" for select using (true);
create policy "Admin Write Globals" on "public"."content_globals" for all using (is_admin());

-- Reviews (Public Read, Authenticated Insert Own, Admin All)
create policy "Public Read Reviews" on "public"."reviews" for select using (true);
create policy "Users Insert Reviews" on "public"."reviews" for insert with check (auth.uid() = user_id);
-- Users can update their own reviews (e.g. edit content) if needed, currently not implemented but safe to allow
create policy "Users Update Own Reviews" on "public"."reviews" for update using (auth.uid() = user_id);
create policy "Admin Manage Reviews" on "public"."reviews" for all using (is_admin());

-- Profiles (Read Own, Admin All)
-- We might need Public Read if we show user profiles, but for now strict.
create policy "Read Own Profile" on "public"."profiles" for select using (auth.uid() = id);
create policy "Update Own Profile" on "public"."profiles" for update using (auth.uid() = id);
create policy "Admin Manage Profiles" on "public"."profiles" for all using (is_admin());

-- Orders (Read Own, Admin All)
create policy "Read Own Orders" on "public"."orders" for select using (auth.uid() = user_id);
create policy "Insert Own Orders" on "public"."orders" for insert with check (auth.uid() = user_id);
create policy "Admin Manage Orders" on "public"."orders" for all using (is_admin());

create policy "Read Own Order Items" on "public"."order_items" for select using (
    exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
create policy "Insert Own Order Items" on "public"."order_items" for insert with check (
    exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
create policy "Admin Manage Order Items" on "public"."order_items" for all using (is_admin());

-- Cart & Wishlist (Own Only)
create policy "Manage Own Cart" on "public"."cart_items" for all using (auth.uid() = user_id);
create policy "Manage Own Wishlist" on "public"."wishlist_items" for all using (auth.uid() = user_id);

-- Addresses (Own Only)
create policy "Manage Own Addresses" on "public"."addresses" for all using (auth.uid() = user_id);

-- Coupons (Public Read, Admin Write)
create policy "Public Read Coupons" on "public"."coupons" for select using (true);
create policy "Admin Manage Coupons" on "public"."coupons" for all using (is_admin());

-- Newsletter & Feedback (Anon Insert, Admin Read)
create policy "Anon Insert Newsletter" on "public"."newsletter_subscribers" for insert with check (true);
create policy "Admin Manage Newsletter" on "public"."newsletter_subscribers" for all using (is_admin());

create policy "Anon Insert Feedback" on "public"."feedback" for insert with check (true);
create policy "Admin Manage Feedback" on "public"."feedback" for all using (is_admin());

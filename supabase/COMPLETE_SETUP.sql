-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES Table (Extends auth.users)
create type public.user_role as enum ('user', 'admin');
create type public.fit_preference_type as enum ('oversized', 'regular', 'fitted');

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  pronouns text,
  fit_preference public.fit_preference_type,
  role public.user_role default 'user'::public.user_role,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. CATEGORIES Table
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. PRODUCTS Table
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references public.categories(id),
  name text not null,
  slug text unique not null,
  description text,
  price numeric not null,
  expression_tags text[], -- e.g. ['masc', 'fem']
  size_options text[],    -- e.g. ['S', 'M', 'L']
  color_options text[],
  main_image_url text,
  gallery_image_urls text[],
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. PRODUCT STOCK Table
create table public.product_stock (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade,
  size text not null,
  color text not null,
  quantity int default 0,
  unique (product_id, size, color)
);

-- 5. ORDERS Table
create type public.order_status as enum ('pending', 'paid', 'shipped', 'delivered', 'cancelled');

create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id), -- Nullable for guest checkout if needed
  status public.order_status default 'pending'::public.order_status,
  subtotal numeric not null,
  shipping_fee numeric default 0,
  total numeric not null,
  payment_provider text,
  payment_reference text,
  shipping_name text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  pincode text,
  country text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. ORDER ITEMS Table
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  name_snapshot text,
  size text,
  color text,
  quantity int not null,
  unit_price numeric not null
);

-- 7. FEEDBACK Table
create table public.feedback (
  id uuid default uuid_generate_v4() primary key,
  topic text,
  email text,
  message text,
  created_at timestamptz default now()
);

-- Row Level Security (RLS)

-- Profiles: 
-- Users can see their own profile. Public can't see profiles (mostly).
-- Admins can see all.
alter table public.profiles enable row level security;

create policy "Users can view own profile" 
on public.profiles for select 
using (auth.uid() = id);

create policy "Users can update own profile" 
on public.profiles for update 
using (auth.uid() = id);

create policy "Admins can view all profiles" 
on public.profiles for select 
using (
  exists (
    select 1 from public.profiles 
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- Categories: Public read active. Admin all.
alter table public.categories enable row level security;

create policy "Public can read active categories" 
on public.categories for select 
using (is_active = true);

create policy "Admins can do everything on categories" 
on public.categories for all 
using (
  exists (
    select 1 from public.profiles 
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- Products: Public read active. Admin all.
alter table public.products enable row level security;

create policy "Public can read active products" 
on public.products for select 
using (is_active = true);

create policy "Admins can do everything on products" 
on public.products for all 
using (
  exists (
    select 1 from public.profiles 
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- Stock: Public read (or minimal for availability). Admin all.
alter table public.product_stock enable row level security;

create policy "Public can read stock" 
on public.product_stock for select 
using (true);

create policy "Admins can do everything on stock" 
on public.product_stock for all 
using (
  exists (
    select 1 from public.profiles 
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- Orders: Users read own. Admins all.
alter table public.orders enable row level security;

create policy "Users can see own orders" 
on public.orders for select 
using (auth.uid() = user_id);

create policy "Users can insert own orders" 
on public.orders for insert 
with check (auth.uid() = user_id);

create policy "Admins can see all orders" 
on public.orders for select 
using (
  exists (
    select 1 from public.profiles 
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

create policy "Admins can update orders" 
on public.orders for update 
using (
  exists (
    select 1 from public.profiles 
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- Order Items: Users read own (via order). Admins all.
alter table public.order_items enable row level security;

create policy "Users can see own order items" 
on public.order_items for select 
using (
  exists (
    select 1 from public.orders 
    where orders.id = order_items.order_id and orders.user_id = auth.uid()
  )
);

create policy "Users can insert own order items"
on public.order_items for insert
with check (
  exists (
    select 1 from public.orders 
    where orders.id = order_items.order_id and orders.user_id = auth.uid()
  )
);

-- Triggers for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_profiles_updated_at before update on public.profiles for each row execute procedure update_updated_at_column();
create trigger update_categories_updated_at before update on public.categories for each row execute procedure update_updated_at_column();
create trigger update_products_updated_at before update on public.products for each row execute procedure update_updated_at_column();
create trigger update_orders_updated_at before update on public.orders for each row execute procedure update_updated_at_column();

-- Function to handle new user signup with AUTO-ADMIN logic
create or replace function public.handle_new_user()
returns trigger as $$
declare
  is_admin boolean;
begin
  -- Auto-assign admin role to specific email
  if new.email = 'rjsanjaymandal@gmail.com' then
    insert into public.profiles (id, name, role)
    values (new.id, new.raw_user_meta_data->>'full_name', 'admin');
  else
    insert into public.profiles (id, name, role)
    values (new.id, new.raw_user_meta_data->>'full_name', 'user');
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create product images bucket if not exists (This often requires API, but sometimes works in SQL Editor in Supabase)
insert into storage.buckets (id, name, public) values ('products', 'products', true) on conflict do nothing;

create policy "Public Access" on storage.objects for select using ( bucket_id = 'products' );
create policy "Admin Upload" on storage.objects for insert with check ( bucket_id = 'products' and (select role from public.profiles where id = auth.uid()) = 'admin' );

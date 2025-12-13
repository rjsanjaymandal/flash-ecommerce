-- FIX INFINITE RECURSION IN RLS

-- 1. Create a helper function to check admin status securely
-- "SECURITY DEFINER" means this function runs with elevated privileges (bypassing RLS),
-- allowing it to check the role without triggering the "Check who is admin" policy loop.
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles 
    where id = auth.uid() 
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 2. Drop the broken recursive policy
drop policy if exists "Admins can view all profiles" on public.profiles;

-- 3. Create the new policy using the secure function
create policy "Admins can view all profiles" 
on public.profiles for select 
using (
  public.is_admin()
);

-- 4. Apply this to other tables too for safety/cleanliness (Optional but recommended)
drop policy if exists "Admins can do everything on categories" on public.categories;
create policy "Admins can do everything on categories" on public.categories for all using ( public.is_admin() );

drop policy if exists "Admins can do everything on products" on public.products;
create policy "Admins can do everything on products" on public.products for all using ( public.is_admin() );

drop policy if exists "Admins can do everything on stock" on public.product_stock;
create policy "Admins can do everything on stock" on public.product_stock for all using ( public.is_admin() );

drop policy if exists "Admins can see all orders" on public.orders;
create policy "Admins can see all orders" on public.orders for select using ( public.is_admin() );

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders" on public.orders for update using ( public.is_admin() );

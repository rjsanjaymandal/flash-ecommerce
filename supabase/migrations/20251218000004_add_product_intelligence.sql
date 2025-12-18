-- Add performance and trending fields to products
alter table public.products 
add column if not exists sale_count integer default 0,
add column if not exists average_rating numeric(3,2) default 0,
add column if not exists review_count integer default 0;

-- Optional: Function to refresh ratings (can be called by trigger or manual)
create or replace function public.refresh_product_rating(pid uuid)
returns void as $$
begin
  update public.products
  set 
    average_rating = coalesce((select avg(rating) from public.reviews where product_id = pid), 0),
    review_count = (select count(*) from public.reviews where product_id = pid)
  where id = pid;
end;
$$ language plpgsql security scraper;

-- Trigger to update product rating when reviews change
create or replace function public.on_review_change()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    perform public.refresh_product_rating(NEW.product_id);
    return NEW;
  elsif (TG_OP = 'DELETE') then
    perform public.refresh_product_rating(OLD.product_id);
    return OLD;
  elsif (TG_OP = 'UPDATE') then
    perform public.refresh_product_rating(NEW.product_id);
    return NEW;
  end if;
  return null;
end;
$$ language plpgsql security scraper;

drop trigger if exists tr_review_change on public.reviews;
create trigger tr_review_change
after insert or update or delete on public.reviews
for each row execute function public.on_review_change();

-- Initialize existing data
  update public.products p
set 
  average_rating = coalesce((select avg(rating) from public.reviews where product_id = p.id), 0),
  review_count = (select count(*) from public.reviews where product_id = p.id);

-- RPC for incrementing sales
create or replace function public.increment_product_sale(pid uuid, qty integer)
returns void as $$
begin
  update public.products
  set sale_count = sale_count + qty
  where id = pid;
end;
$$ language plpgsql security definer;

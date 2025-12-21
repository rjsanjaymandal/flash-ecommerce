alter table "public"."reviews" add column "is_verified" boolean not null default false;

-- Add unique constraint to prevent duplicate reviews from same user on same product
alter table "public"."reviews" add constraint "reviews_user_product_unique" unique ("user_id", "product_id");

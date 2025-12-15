-- Allow anyone (including guests) to create orders
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON "public"."orders";
DROP POLICY IF EXISTS "Enable insert for everyone" ON "public"."orders";

CREATE POLICY "Enable insert for everyone" 
ON "public"."orders" 
FOR INSERT 
WITH CHECK (true);

-- Allow users to read their own orders (optional but good for history)
DROP POLICY IF EXISTS "Enable read for users based on user_id" ON "public"."orders";
CREATE POLICY "Enable read for users based on user_id"
ON "public"."orders"
FOR SELECT
USING (auth.uid() = user_id);


-- Allow anyone to create order items (linked to the order they just created)
DROP POLICY IF EXISTS "Enable insert for everyone" ON "public"."order_items";

CREATE POLICY "Enable insert for everyone" 
ON "public"."order_items" 
FOR INSERT 
WITH CHECK (true);

-- Allow reading order items if you own the order
DROP POLICY IF EXISTS "Enable read for users based on order owner" ON "public"."order_items";
CREATE POLICY "Enable read for users based on order owner"
ON "public"."order_items"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "public"."orders"
    WHERE "orders"."id" = "order_items"."order_id"
    AND "orders"."user_id" = auth.uid()
  )
);

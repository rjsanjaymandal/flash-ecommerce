-- Create cart_items table
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create wishlist_items table
CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Policies for cart_items
CREATE POLICY "Users can view their own cart items" 
    ON public.cart_items FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all cart items" 
    ON public.cart_items FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can insert their own cart items" 
    ON public.cart_items FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" 
    ON public.cart_items FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" 
    ON public.cart_items FOR DELETE 
    USING (auth.uid() = user_id);

-- Policies for wishlist_items
CREATE POLICY "Users can view their own wishlist items" 
    ON public.wishlist_items FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wishlist items" 
    ON public.wishlist_items FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can insert their own wishlist items" 
    ON public.wishlist_items FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items" 
    ON public.wishlist_items FOR DELETE 
    USING (auth.uid() = user_id);

-- Add unique constraint to prevent duplicates in wishlist
ALTER TABLE public.wishlist_items 
    ADD CONSTRAINT wishlist_items_user_product_key UNIQUE (user_id, product_id);

-- Add unique constraint for cart (same product+size+color)
ALTER TABLE public.cart_items 
    ADD CONSTRAINT cart_items_user_product_variant_key UNIQUE (user_id, product_id, size, color);

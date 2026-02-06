
-- Migration: Create Product Colors Table
-- Description: Adds a master list of colors with hex codes for consistent branding.

CREATE TABLE IF NOT EXISTS public.product_colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    hex_code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.product_colors ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read-only access to colors"
ON public.product_colors FOR SELECT
USING (true);

CREATE POLICY "Allow admins to manage colors"
ON public.product_colors FOR ALL
USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
));

-- Seed Default Colors
INSERT INTO public.product_colors (name, hex_code)
VALUES 
    ('Black', '#000000'),
    ('White', '#FFFFFF'),
    ('Off White', '#F4F1E8'),
    ('Navy', '#000080'),
    ('Beige', '#E6D1B3'),
    ('Red', '#E31837'),
    ('Green', '#008751'),
    ('Blue', '#0056B3'),
    ('Pink', '#FFC0CB'),
    ('Grey', '#808080'),
    ('Silver', '#C0C0C0'),
    ('Gold', '#D4AF37'),
    ('Yellow', '#FFD700'),
    ('Purple', '#6F2DA8'),
    ('Maroon', '#7A1F26'),
    ('Olive', '#808000'),
    ('Lavender', '#C5B6E3'),
    ('Faded Purple', '#7B5C74')
ON CONFLICT (name) DO UPDATE SET hex_code = EXCLUDED.hex_code;

-- Seed existing colors from product_stock if not already present
INSERT INTO public.product_colors (name, hex_code)
SELECT DISTINCT color, '#CCCCCC' -- Default grey for unknown existing colors
FROM public.product_stock
WHERE color IS NOT NULL AND color != ''
ON CONFLICT (name) DO NOTHING;

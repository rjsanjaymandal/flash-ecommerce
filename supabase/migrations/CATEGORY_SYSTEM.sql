-- 1. Modify Categories Table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id),
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Create Storage Bucket for Category Images
-- Note: Buckets often need to be created via Dashboard -> Storage -> New Bucket
-- But we can try inserting if the storage schema is accessible
INSERT INTO storage.buckets (id, name, public) 
VALUES ('category-images', 'category-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies
DROP POLICY IF EXISTS "Public can read category images" ON storage.objects;
CREATE POLICY "Public can read category images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'category-images' );

DROP POLICY IF EXISTS "Admins can upload category images" ON storage.objects;
CREATE POLICY "Admins can upload category images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'category-images' 
  AND (select role from public.profiles where id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Admins can update category images" ON storage.objects;
CREATE POLICY "Admins can update category images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'category-images' 
  AND (select role from public.profiles where id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Admins can delete category images" ON storage.objects;
CREATE POLICY "Admins can delete category images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'category-images' 
  AND (select role from public.profiles where id = auth.uid()) = 'admin'
);

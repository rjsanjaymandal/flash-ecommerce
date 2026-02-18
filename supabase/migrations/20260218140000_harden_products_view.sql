-- Harden Database View Security: products_with_stats
-- Recreate the view with security_invoker = true to ensure it respects RLS

DROP VIEW IF EXISTS public.products_with_stats;

CREATE VIEW public.products_with_stats 
WITH (security_invoker = true)
AS
SELECT 
    p.*,
    COALESCE(r.avg_rating, 0) as average_rating_calculated,
    COALESCE(r.review_count, 0) as review_count_calculated
FROM 
    products p
LEFT JOIN (
    SELECT 
        product_id,
        AVG(rating)::numeric(3,2) as avg_rating,
        COUNT(*) as review_count
    FROM 
        reviews
    GROUP BY 
        product_id
) r ON p.id = r.product_id;

-- Restore permissions
REVOKE ALL ON public.products_with_stats FROM PUBLIC;
GRANT SELECT ON public.products_with_stats TO anon, authenticated, service_role;

-- Document the change
COMMENT ON VIEW public.products_with_stats IS 'Enhanced products view forced to respect RLS via security_invoker = true.';

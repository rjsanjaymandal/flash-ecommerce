
-- Recreate the view explicitly to ensure ALL columns (total_stock, size_options, etc) are included
-- Using p.* but also ensuring it is refreshed if any underlying schema changed recently

DROP VIEW IF EXISTS products_with_stats;

CREATE VIEW products_with_stats AS
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

GRANT SELECT ON products_with_stats TO anon, authenticated, service_role;

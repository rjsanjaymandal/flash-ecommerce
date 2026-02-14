-- Create a performance-optimized view for products with pre-calculated statistics
-- This eliminates the need for expensive JS-side calculations and sub-queries for ratings

CREATE OR REPLACE VIEW products_with_stats AS
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

-- Ensure the view is accessible
GRANT SELECT ON products_with_stats TO anon, authenticated, service_role;

-- Add a comment for documentation
COMMENT ON VIEW products_with_stats IS 'Enhanced products view with pre-calculated average_rating and review_count for scalability.';


-- Function to calculate total stock
CREATE OR REPLACE FUNCTION update_product_total_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET total_stock = (
        SELECT COALESCE(SUM(quantity), 0)
        FROM product_stock
        WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for product_stock updates
DROP TRIGGER IF EXISTS update_total_stock_trigger ON product_stock;

CREATE TRIGGER update_total_stock_trigger
AFTER INSERT OR UPDATE OR DELETE ON product_stock
FOR EACH ROW
EXECUTE FUNCTION update_product_total_stock();

-- Backfill existing data
UPDATE products p
SET total_stock = (
    SELECT COALESCE(SUM(quantity), 0)
    FROM product_stock ps
    WHERE ps.product_id = p.id
);

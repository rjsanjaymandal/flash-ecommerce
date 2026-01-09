
const { Client } = require('pg')

console.log('Initializing Client...')

// Using Object Config to handle special chars in password safely
const client = new Client({
  host: 'db.gyizmixhmrfwywvafdbi.supabase.co',
  port: 5432,
  user: 'postgres',
  password: 'Sam@#2+3#',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
})

const SQL = `
CREATE OR REPLACE FUNCTION reserve_stock(p_order_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_item RECORD;
  v_updated_rows INTEGER;
BEGIN
  FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id LOOP
    
    UPDATE public.product_stock 
    SET quantity = quantity - v_item.quantity
    WHERE product_id = v_item.product_id 
    AND COALESCE(size, '') = COALESCE(v_item.size, '')
    AND COALESCE(color, '') = COALESCE(v_item.color, '')
    AND quantity >= v_item.quantity;

    GET DIAGNOSTICS v_updated_rows = ROW_COUNT;

    IF v_updated_rows = 0 THEN
      RAISE EXCEPTION 'Insufficient stock for Product: %, Size: %, Color: %', 
        v_item.product_id, 
        COALESCE(v_item.size, 'N/A'), 
        COALESCE(v_item.color, 'N/A');
    END IF;

    UPDATE public.products 
    SET sale_count = sale_count + v_item.quantity
    WHERE id = v_item.product_id;
    
  END LOOP;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION reserve_stock(UUID) TO service_role;
`

async function run() {
  try {
    console.log('Connecting...')
    await client.connect()
    console.log('Connected!')

    console.log('Running Test Query...')
    const res = await client.query('SELECT NOW()')
    console.log('Time:', res.rows[0])

    console.log('Applying Migration...')
    await client.query(SQL)
    console.log('SUCCESS: Migration Applied!')

  } catch (err) {
    console.error('FAILURE:', err)
  } finally {
    console.log('Closing connection...')
    await client.end()
  }
}

run()

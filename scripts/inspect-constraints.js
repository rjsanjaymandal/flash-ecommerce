const { Client } = require('pg');

const password = encodeURIComponent('Sam@#2+3#');
const connectionString = `postgresql://postgres:${password}@db.gyizmixhmrfwywvafdbi.supabase.co:5432/postgres`;

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    
    // Query to find FK actions (ON DELETE)
    const query = `
      SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.delete_rule 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.referential_constraints AS rc
          ON tc.constraint_name = rc.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON rc.unique_constraint_name = ccu.constraint_name
          AND rc.unique_constraint_schema = ccu.constraint_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name IN ('cart_items', 'wishlist_items', 'reviews', 'order_items')
      AND ccu.table_name = 'products';
    `;

    const res = await client.query(query);
    console.log(JSON.stringify(res.rows, null, 2));
    
  } catch (err) {
    console.error('Check failed:', err);
  } finally {
    await client.end();
  }
}

run();

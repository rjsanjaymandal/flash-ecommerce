
import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:Sam%40%232%2B3%23@db.gyizmixhmrfwywvafdbi.supabase.co:5432/postgres';

async function checkSchema() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Checking Schema...');

    const tables = ['products', 'product_stock', 'cart_items', 'order_items', 'product_colors'];
    for (const table of tables) {
        console.log(`\nTable: ${table}`);
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = '${table}'
            ORDER BY ordinal_position;
        `);
        res.rows.forEach(row => {
            console.log(`- ${row.column_name}: ${row.data_type}`);
        });
    }

  } catch (e) {
    console.error('Connection error:', e);
  } finally {
    await client.end();
  }
}

checkSchema();

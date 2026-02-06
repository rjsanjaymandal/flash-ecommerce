
import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:Sam%40%232%2B3%23@db.gyizmixhmrfwywvafdbi.supabase.co:5432/postgres';

async function verifyMigrations() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Verifying migrations...');

    // 1. Check for product_colors table
    try {
      const res = await client.query("SELECT to_regclass('public.product_colors')");
      if (res.rows[0].to_regclass) {
        console.log('✅ Table `product_colors` exists.');
      } else {
        console.error('❌ Table `product_colors` MISSING.');
      }
    } catch (e) {
      console.error('❌ Error checking `product_colors`:', e.message);
    }

    // 2. Check for fit column in product_stock
    try {
      const res = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='product_stock' AND column_name='fit'
      `);
      if (res.rows.length > 0) {
        console.log('✅ Column `fit` exists in `product_stock`.');
      } else {
        console.error('❌ Column `fit` MISSING in `product_stock`.');
      }
    } catch (e) {
      console.error('❌ Error checking `fit` column:', e.message);
    }
    
     // 3. Check for fit_options column in products
    try {
      const res = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='products' AND column_name='fit_options'
      `);
      if (res.rows.length > 0) {
        console.log('✅ Column `fit_options` exists in `products`.');
      } else {
        console.error('❌ Column `fit_options` MISSING in `products`.');
      }
    } catch (e) {
      console.error('❌ Error checking `fit_options` column:', e.message);
    }

    // 4. Verify some data in product_colors
    try {
      const res = await client.query("SELECT count(*) FROM public.product_colors");
      console.log(`✅ ` + res.rows[0].count + ` colors found in ` + '`product_colors`.');
    } catch (e) {
      console.error('❌ Error querying `product_colors` data:', e.message);
    }

  } catch (e) {
    console.error('Connection error:', e);
  } finally {
    await client.end();
  }
}

verifyMigrations();

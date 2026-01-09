const { Client } = require('pg');

async function cleanFunctions() {
  const user = 'postgres';
  const pass = 'Sam@#2+3#';
  const host = 'db.gyizmixhmrfwywvafdbi.supabase.co';
  const port = '5432';
  const dbName = 'postgres';
  
  const connectionString = `postgresql://${user}:${encodeURIComponent(pass)}@${host}:${port}/${dbName}`;

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  // Explicitly drop both potential signatures for all 3 functions
  const sql = `
    DROP FUNCTION IF EXISTS get_analytics_summary(TIMESTAMPTZ, TIMESTAMPTZ);
    DROP FUNCTION IF EXISTS get_analytics_summary(TEXT, TEXT);

    DROP FUNCTION IF EXISTS get_sales_over_time(TIMESTAMPTZ, TIMESTAMPTZ, TEXT);
    DROP FUNCTION IF EXISTS get_sales_over_time(TEXT, TEXT, TEXT);

    DROP FUNCTION IF EXISTS get_top_products_by_revenue(TIMESTAMPTZ, TIMESTAMPTZ, INTEGER);
    DROP FUNCTION IF EXISTS get_top_products_by_revenue(TEXT, TEXT, INTEGER);
  `;

  try {
    await client.connect();
    console.log('Cleaning Analytics Functions...');
    await client.query(sql);
    console.log('✅ Functions dropped successfully!');
  } catch (err) {
    console.error('❌ Clean failed:', err);
  } finally {
    await client.end();
  }
}

cleanFunctions();

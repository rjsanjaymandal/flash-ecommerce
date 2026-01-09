const { Client } = require('pg');

async function fixPermissions() {
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

  const sql = `
    GRANT EXECUTE ON FUNCTION get_analytics_summary(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
    GRANT EXECUTE ON FUNCTION get_sales_over_time(TIMESTAMPTZ, TIMESTAMPTZ, TEXT) TO authenticated;
    GRANT EXECUTE ON FUNCTION get_top_products_by_revenue(TIMESTAMPTZ, TIMESTAMPTZ, INTEGER) TO authenticated;
  `;

  try {
    await client.connect();
    console.log('Fixing Analytics Permissions...');
    await client.query(sql);
    console.log('✅ Permissions granted to authenticated role!');
  } catch (err) {
    console.error('❌ Permission fix failed:', err);
  } finally {
    await client.end();
  }
}

fixPermissions();

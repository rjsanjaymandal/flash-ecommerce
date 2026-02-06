
import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:Sam%40%232%2B3%23@db.gyizmixhmrfwywvafdbi.supabase.co:5432/postgres';

async function listTables() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables:', res.rows.map(r => r.table_name));
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await client.end();
  }
}

listTables();

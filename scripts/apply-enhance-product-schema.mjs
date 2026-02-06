
import pg from 'pg';
import fs from 'fs';
const { Client } = pg;

const connectionString = 'postgresql://postgres:Sam%40%232%2B3%23@db.gyizmixhmrfwywvafdbi.supabase.co:5432/postgres';

async function applyMigration() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  const sql = fs.readFileSync('supabase/migrations/20260206160000_enhance_product_schema.sql', 'utf8');

  try {
    await client.connect();
    console.log('Applying migration...');
    await client.query(sql);
    console.log('Migration applied successfully!');
  } catch (e) {
    console.error('Error applying migration:', e);
  } finally {
    await client.end();
  }
}

applyMigration();

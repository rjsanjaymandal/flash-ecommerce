
import pg from 'pg';
import fs from 'fs';
const { Client } = pg;

const connectionString = 'postgresql://postgres:Sam%40%232%2B3%23@db.gyizmixhmrfwywvafdbi.supabase.co:5432/postgres';

async function applyMigration() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  const sql = fs.readFileSync('supabase/migrations/20260206230000_remove_barcode_permanently.sql', 'utf8');

  try {
    await client.connect();
    console.log('Applying barcode removal migration...');
    await client.query(sql);
    console.log('Barcode removal applied successfully!');
  } catch (e) {
    console.error('Error applying migration:', e);
  } finally {
    await client.end();
  }
}

applyMigration();

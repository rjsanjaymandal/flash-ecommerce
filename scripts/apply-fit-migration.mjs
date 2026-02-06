
import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pg;
const connectionString = 'postgresql://postgres:Sam%40%232%2B3%23@db.gyizmixhmrfwywvafdbi.supabase.co:5432/postgres';

async function applyMigration() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const migrationPath = 'g:/flash-ecommerce/supabase/migrations/20260206124855_add_product_fit.sql';
    const sql = fs.readFileSync(migrationPath, 'utf8');

    await client.connect();
    console.log('Connected to database.');
    
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    console.log('Migration applied successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

applyMigration();

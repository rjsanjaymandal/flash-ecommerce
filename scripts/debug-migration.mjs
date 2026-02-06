
import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = 'postgresql://postgres:Sam%40%232%2B3%23@db.gyizmixhmrfwywvafdbi.supabase.co:5432/postgres';

console.log('Client type:', typeof Client);

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  console.log('Instance type:', typeof client);

  try {
    await client.connect();
    console.log('Connected');
    
    const migrationPath = path.resolve(__dirname, '../supabase/migrations/20260205210000_add_price_addon_to_stock.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Executing SQL...');
    await client.query(sql);
    console.log('Success');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await client.end();
  }
}

run();

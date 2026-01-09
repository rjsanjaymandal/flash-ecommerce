require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  const migrationPath = path.join(__dirname, '../supabase/migrations/20260109180000_native_search_v2.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  console.log('Running migration...');
  
  // Note: Standard Supabase JS client doesn't support raw SQL execution easily without pg
  // But we can try to use a postgres client OR since I saw 'pg' in package.json, assume we can use it.
  // Actually, let's use 'pg' directly as it is more reliable for DDL.
}

// Re-writing to use pg directly
const { Client } = require('pg');

async function runPgMigration() {
  // Connection string from .env.local file (line 8 looks like it but has no key, I will hardcode or parse it)
  // The user file had: postgresql://postgres:Sam@#2+3#@db.gyizmixhmrfwywvafdbi.supabase.co:5432/postgres
  // I'll use that directly or try to parse it. 
  // Wait, I can't easily parse line 8 without a key. I'll just copy it here for this temp script.
  
  // Properly encode the password components
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

  try {
    await client.connect();
    const migrationPath = path.join(__dirname, '../supabase/migrations/20260109180000_native_search_v2.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await client.query(sql);
    console.log('✅ Migration applied successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await client.end();
  }
}

runPgMigration();

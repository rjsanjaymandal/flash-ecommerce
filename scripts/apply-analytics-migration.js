const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runPgMigration() {
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
    const migrationPath = path.join(__dirname, '../supabase/migrations/20260108200000_advanced_analytics.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running Analytics Migration...');
    await client.query(sql);
    console.log('✅ Analytics Migration applied successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await client.end();
  }
}

runPgMigration();

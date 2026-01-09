require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAnalytics() {
  console.log('--- START VERIFICATION ---');
  
  // 1. Force Schema Reload
  await reloadSchemaCache();

  // 2. Test via Supabase RPC
  console.log('\nTesting via Supabase RPC...');
  const end = new Date().toISOString();
  const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase.rpc('get_analytics_summary', {
    start_date: start,
    end_date: end
  });

  if (error) {
    console.error('❌ Supabase RPC Failed:', JSON.stringify(error, null, 2));
  } else {
    console.log('✅ Supabase RPC Success:', data);
  }

  // 3. Test via Raw SQL
  console.log('\nTesting via Raw SQL...');
  await testRawSql(start, end);
}

async function reloadSchemaCache() {
  const client = getPgClient();
  try {
    await client.connect();
    await client.query("NOTIFY pgrst, 'reload schema'");
    console.log('🔄 Schema Cache Reload Triggered');
  } catch (err) {
    console.error('⚠️ Could not reload schema cache:', err.message);
  } finally {
    await client.end();
  }
}

async function testRawSql(start, end) {
  const client = getPgClient();
  try {
    await client.connect();
    const res = await client.query(`SELECT * FROM get_analytics_summary($1, $2)`, [start, end]);
    console.log('✅ Raw SQL Success:', res.rows[0]);
  } catch (err) {
    console.error('❌ Raw SQL Failed:', err.message);
  } finally {
    await client.end();
  }
}

function getPgClient() {
  const user = 'postgres';
  const pass = 'Sam@#2+3#';
  const host = 'db.gyizmixhmrfwywvafdbi.supabase.co';
  const port = '5432';
  const dbName = 'postgres';
  const connectionString = `postgresql://${user}:${encodeURIComponent(pass)}@${host}:${port}/${dbName}`;
  
  return new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
}

verifyAnalytics();

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  const migrationPath = 'supabase/migrations/20260207010000_remove_price_addon.sql';
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log(`Applying migration: ${migrationPath}`);
  
  // Using an RPC call if available, or just a direct query if possible via a known helper
  // For this environment, we usually run SQL via a 'pg' helper or similar if available
  // But safest is to use the RPC if the user has provided one for running SQL.
  // Checking if 'execute_sql' RPC exists.
  
  const { error } = await supabase.rpc('execute_sql', { sql_query: sql });

  if (error) {
    if (error.message.includes('execute_sql')) {
        console.error('RPC execute_sql not found. Please apply migration manually in Supabase SQL Editor:');
        console.log('-------------------');
        console.log(sql);
        console.log('-------------------');
    } else {
        console.error('Error applying migration:', error);
    }
  } else {
    console.log('Migration applied successfully!');
  }
}

applyMigration();

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

// Same connection string as before
const CONNECTION_STRING = "postgresql://postgres:Sam%40%232%2B3%23@db.gyizmixhmrfwywvafdbi.supabase.co:5432/postgres";

async function verifySync() {
  const client = new Client({
    connectionString: CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    const resAuth = await client.query('SELECT count(*) FROM auth.users');
    const authCount = parseInt(resAuth.rows[0].count);
    
    const resProfiles = await client.query('SELECT count(*) FROM public.profiles');
    const profileCount = parseInt(resProfiles.rows[0].count);

    console.log(`\n--- SYNC REPORT ---`);
    console.log(`Auth Users: ${authCount}`);
    console.log(`Public Profiles: ${profileCount}`);

    if (authCount !== profileCount) {
        console.error(`❌ Mismatch: Missing ${authCount - profileCount} profiles.`);
        const resMissing = await client.query(`
            SELECT id, email, raw_user_meta_data 
            FROM auth.users 
            WHERE id NOT IN (SELECT id FROM public.profiles)
            LIMIT 5
        `);
        console.log("Missing Examples:", JSON.stringify(resMissing.rows, null, 2));
    } else {
        console.log("✅ Counts match.");
        const recent = await client.query('SELECT id, name, email, role, created_at FROM public.profiles ORDER BY created_at DESC LIMIT 5');
        console.log("Recent Profiles:", JSON.stringify(recent.rows, null, 2));
    }
    console.log(`-------------------\n`);

  } catch (err) {
    console.error("Error verifying:", err);
  } finally {
    await client.end();
  }
}

verifySync();

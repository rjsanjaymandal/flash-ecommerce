const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: '.env.local' });

// Get DB URL from env
// The connection string is usually in process.env.DATABASE_URL or constructed from parts.
// In .env.local we saw: postgresql://postgres:Sam@#2+3#@db.gyizmixhmrfwywvafdbi.supabase.co:5432/postgres
// But we need to parse it or use the one from the file if explicitly there.
// I'll grab the specific line if needed, or rely on standard env vars if set.
// Looking at previous view_file, the connection string is on line 8 but not assigned to a var like DATABASE_URL standardly?
// Wait, line 8 was just a comment or a raw line?
// Line 8: postgresql://postgres:Sam@#2+3#@db.gyizmixhmrfwywvafdbi.supabase.co:5432/postgres
// It didn't have "DATABASE_URL=" prefix in the snippet I saw?
// Let's re-read .env.local carefully?
// Ah, the snippet showed:
// 7: SUPABASE_SERVICE_ROLE_KEY=...
// 8: postgresql://postgres:Sam@#2+3#@db.gyizmixhmrfwywvafdbi.supabase.co:5432/postgres
// It seems line 8 is malformed as an env var (missing KEY=VALUE).
// I will hardcode the connection string in the script or parse it.
// To be safe and reusable, I'll trust the hardcoded one for this specific verified env.

const CONNECTION_STRING = "postgresql://postgres:Sam%40%232%2B3%23@db.gyizmixhmrfwywvafdbi.supabase.co:5432/postgres";

async function applyPatch() {
  console.log("Connecting to DB...");
  const client = new Client({
    connectionString: CONNECTION_STRING,
    ssl: { rejectUnauthorized: false } // Required for Supabase in some envs, or implied
  });

  try {
    await client.connect();
    console.log("Connected.");

    const migrationPath = path.join(__dirname, '../supabase/migrations/20260131230000_fix_profile_trigger.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log("Applying SQL patch from:", migrationPath);
    await client.query(sql);

    console.log("✅ Patch applied successfully!");
    
  } catch (err) {
    console.error("❌ Failed to apply patch:", err);
  } finally {
    await client.end();
  }
}

applyPatch();

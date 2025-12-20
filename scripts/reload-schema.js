import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log("Reloading PostgREST schema cache...");

  // Connection String (Reused)
  const password = encodeURIComponent("Sam@#2+3#");
  const connectionString = `postgresql://postgres:${password}@db.gyizmixhmrfwywvafdbi.supabase.co:5432/postgres`;

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    // Verify column exists first?
    // Just force reload
    await client.query("NOTIFY pgrst, 'reload config';");
    console.log("Schema cache reload triggered! 🔄");
  } catch (err) {
    console.error("Reload failed:", err);
  } finally {
    await client.end();
  }
}

run();

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log("Starting migration...");

  // 1. Construct Safe Connection String (Handling special chars in password)
  // User Password: Sam@#2+3#
  // Host: db.gyizmixhmrfwywvafdbi.supabase.co
  const password = encodeURIComponent("Sam@#2+3#");
  const connectionString = `postgresql://postgres:${password}@db.gyizmixhmrfwywvafdbi.supabase.co:5432/postgres`;

  console.log("Connecting to database...");
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }, // Required for Supabase/Azure usually
  });

  try {
    await client.connect();
    console.log("Connected successfully.");

    // 2. Read SQL File
    const sqlPath = path.join(
      __dirname,
      "../supabase/migrations/20251216202209_add_reviews_and_newsletter.sql"
    );
    const sql = fs.readFileSync(sqlPath, "utf8");

    // 3. Execute SQL
    console.log("Executing SQL...");
    await client.query(sql);
    console.log("Migration executed successfully! ✅");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

run();

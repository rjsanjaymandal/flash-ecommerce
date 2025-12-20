import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log("Starting content_globals migration...");

  // Connection String (Reused from existing scripts)
  const password = encodeURIComponent("Sam@#2+3#");
  const connectionString = `postgresql://postgres:${password}@db.gyizmixhmrfwywvafdbi.supabase.co:5432/postgres`;

  console.log("Connecting to database...");
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected successfully.");

    // Read SQL File
    const sqlPath = path.join(
      __dirname,
      "../database/create_content_globals.sql"
    );
    console.log(`Reading SQL from: ${sqlPath}`);

    if (!fs.existsSync(sqlPath)) {
      throw new Error(`File not found: ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, "utf8");

    // Execute SQL
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

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log("Starting Future Lab migration...");

  // Connection string from .env.local or hardcoded if necessary (using the pattern from run-migration.js)
  // For this project, the password and host seem stable in previous examples.
  const password = encodeURIComponent("Sam@#2+3#");
  const connectionString = `postgresql://postgres:${password}@db.gyizmixhmrfwywvafdbi.supabase.co:5432/postgres`;

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected to database.");

    const migrationFile = "20251224113000_add_future_lab.sql";
    const sqlPath = path.join(
      __dirname,
      "../supabase/migrations",
      migrationFile
    );

    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Migration file not found: ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, "utf8");
    console.log(`Executing ${migrationFile}...`);
    await client.query(sql);
    console.log("Migration 'add_future_lab' executed successfully! ✅");

    const bucketMigrationFile = "20251224113500_create_concepts_bucket.sql";
    const bucketSqlPath = path.join(
      __dirname,
      "../supabase/migrations",
      bucketMigrationFile
    );

    if (fs.existsSync(bucketSqlPath)) {
      const bucketSql = fs.readFileSync(bucketSqlPath, "utf8");
      console.log(`Executing ${bucketMigrationFile}...`);
      await client.query(bucketSql);
      console.log(
        "Migration 'create_concepts_bucket' executed successfully! ✅"
      );
    }
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

runMigration();

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  // URL Encoded password: Sam@#2+3# -> Sam%40%232%2B3%23
  const dbUrl =
    "postgresql://postgres:Sam%40%232%2B3%23@db.gyizmixhmrfwywvafdbi.supabase.co:5432/postgres";

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("Connecting to Database...");
    await client.connect();
    console.log("✅ Connected!");

    const migrationPath = path.join(
      __dirname,
      "..",
      "database",
      "migration_waitlist_v3.sql"
    );
    const sql = fs.readFileSync(migrationPath, "utf8");

    console.log("Running Migration V3...");
    await client.query(sql);
    console.log("✅ Migration V3 Applied Successfully!");
  } catch (err) {
    console.error("❌ Migration Failed:", err);
  } finally {
    await client.end();
  }
}

runMigration();

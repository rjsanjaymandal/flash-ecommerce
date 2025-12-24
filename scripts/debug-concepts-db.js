import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../.env.local");
let supabaseUrl, supabaseKey;

try {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    const value = valueParts.join("=");
    if (key && value) {
      if (key.trim() === "NEXT_PUBLIC_SUPABASE_URL") supabaseUrl = value.trim();
      if (key.trim() === "SUPABASE_SERVICE_ROLE_KEY")
        supabaseKey = value.trim();
    }
  });
} catch (e) {
  console.error("Could not read .env.local", e);
}

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env vars (Supabase URL or Service Role Key)");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConceptTable() {
  console.log("Checking if 'concepts' table exists...");
  const { data, error } = await supabase.from("concepts").select("id").limit(1);

  if (error) {
    console.error("Error accessing concepts table:", error.message);
    if (
      error.code === "P0001" ||
      error.message.includes('relation "public.concepts" does not exist')
    ) {
      console.error(
        "VERDICT: The table 'concepts' DOES NOT exist. Please run the migration."
      );
    }
  } else {
    console.log("✅ SUCCESS: 'concepts' table exists.");
    console.log("Sample ID:", data?.[0]?.id || "None (table is empty)");
  }
}

checkConceptTable();

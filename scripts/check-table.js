const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const envPath = path.resolve(__dirname, "../.env.local");
let supabaseUrl, supabaseKey;

try {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
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
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  const { data, error } = await supabase.from("preorders").select("*").limit(1);

  if (error) {
    console.error("Error accessing preorders:", error.message);
  } else {
    console.log("Preorders table exists. Sample row:", data);
  }
}

checkTable();

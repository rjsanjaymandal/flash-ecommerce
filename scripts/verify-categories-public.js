const { createClient } = require("@supabase/supabase-js");
// Load environment variables if possible, or just expect them to be set
// Actually, in this environment, it's safer to read them from the file or use a simple fetch if possible.
// Let's assume the user has a .env.local file.

const fs = require("fs");
const path = require("path");

async function main() {
  console.log("--- Verifying Category Access ---");

  // Try to read .env.local
  const envPath = path.join(process.cwd(), ".env.local");
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const lines = envContent.split("\n");
    lines.forEach((line) => {
      if (line.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
        url = line.split("=")[1].trim().replace(/"/g, "");
      }
      if (line.startsWith("NEXT_PUBLIC_SUPABASE_ANON_KEY=")) {
        anonKey = line.split("=")[1].trim().replace(/"/g, "");
      }
    });
  }

  if (!url || !anonKey) {
    console.error("Missing Supabase URL or Anon Key");
    return;
  }

  console.log("URL:", url);
  // console.log('Key:', anonKey); // Don't log key fully

  const supabase = createClient(url, anonKey);

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, is_active, parent_id")
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching categories:", error);
  } else {
    console.log(`Success! Found ${data.length} active categories:`);
    data.forEach((c) => console.log(`- ${c.name} (Parent: ${c.parent_id})`));

    // Check root categories specifically (which navbar uses)
    const roots = data.filter((c) => c.parent_id === null);
    console.log(`\nRoot Categories (Navbar uses these): ${roots.length}`);
    roots.forEach((c) => console.log(`- ${c.name}`));

    if (roots.length === 0) {
      console.warn(
        "\nWARNING: No active ROOT categories found. Navbar will be empty."
      );
    }
  }
}

main().catch(console.error);

const { createClient } = require("@supabase/supabase-js");

const serviceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5aXptaXhobXJmd3l3dmFmZGJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUyNDU5NywiZXhwIjoyMDgxMTAwNTk3fQ.0yGPlIhXnZi2RYSH36fmVDgK_hxVKd_5l5RaX1RDjrM";
const supabaseUrl = "https://gyizmixhmrfwywvafdbi.supabase.co";

const supabase = createClient(supabaseUrl, serviceKey);

async function check() {
  console.log("Checking profiles table...");
  const { data, error } = await supabase.from("profiles").select("id").limit(1);

  if (error) {
    console.log("Error: " + error.message);
    console.log("Code: " + error.code);
  } else {
    console.log("Success: Profiles table found.");
  }
}

check();

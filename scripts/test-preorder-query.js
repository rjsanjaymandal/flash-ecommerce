import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gyizmixhmrfwywvafdbi.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5aXptaXhobXJmd3l3dmFmZGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjQ1OTcsImV4cCI6MjA4MTEwMDU5N30.mIyQiICrrY4gjoySjE596EP46toq71GMI1lDpmB6rfM";

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing preorder count query...");

  const { data, error } = await supabase
    .from("products")
    .select("id, name, preorders(count)")
    .limit(5);

  if (error) {
    console.error("Query failed:", error);
  } else {
    console.log("Query successful. Sample data:");
    console.log(JSON.stringify(data, null, 2));
  }
}

test();

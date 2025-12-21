const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testSearchIndex() {
  console.log("Testing getSearchIndex logic...");

  // Mimic the getSearchIndex query (FIXED: removed 'images' column)
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, main_image_url, category:categories(name)")
    .eq("is_active", true)
    .limit(5);

  if (error) {
    console.error("Supabase Error:", error);
    return;
  }

  if (!data || data.length === 0) {
    console.warn("No products found!");
    return;
  }

  console.log("Raw Data Sample (1st item):", JSON.stringify(data[0], null, 2));

  // Mimic the mapping logic
  const mapped = data.map((p) => {
    const cat = Array.isArray(p.category) ? p.category[0] : p.category;
    return {
      ...p,
      name: p.name || "",
      // Fallback for images
      images: p.main_image_url ? [p.main_image_url] : [],
      category_name: cat?.name || "",
      display_image: p.main_image_url || null,
    };
  });

  console.log(
    "Mapped Data Sample (1st item):",
    JSON.stringify(mapped[0], null, 2)
  );
  console.log("Total Items Found:", data.length);
}

testSearchIndex();

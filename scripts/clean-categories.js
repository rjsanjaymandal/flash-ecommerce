
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanSubcategories() {
    console.log("Cleaning seeded subcategories...");
    
    // The names we added
    const names = [
        "Graphic Tees", "Oversized Tees", "Vintage Wash",
        "Zip-Ups", "Pullovers", "Tech Fleece",
        "Crewnecks", "Heavyweight"
    ]; // Add others if I missed any from previous steps

    const { data, error } = await supabase
        .from('categories')
        .delete()
        .in('name', names)
        .not('parent_id', 'is', null) // Ensure we don't delete roots if names match
        .select();

    if (error) console.error(error);
    else console.log(`Deleted ${data.length} seeded subcategories.`);
}

cleanSubcategories();

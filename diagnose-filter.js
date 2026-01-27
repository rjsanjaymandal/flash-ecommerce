const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
  const { data: stock, error: stockError } = await supabase
    .from('product_stock')
    .select('size, color, quantity, product_id')
    .limit(20);
  
  if (stockError) {
    console.error('Error fetching stock:', stockError);
  } else {
    console.log(JSON.stringify(stock, null, 2));
  }
}

diagnose();


import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkColumns() {
  console.log('Checking database schema columns...');

  // Check products table
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('status, seo_title, seo_description, sku, barcode, cost_price')
    .limit(1);

  if (productsError) {
    if (productsError.code === 'PGRST100') {
       console.error('❌ Missing columns in products table!');
       console.error(productsError.message);
    } else {
       console.error('Error querying products:', productsError.message);
    }
  } else {
    console.log('✅ `products` table has new columns: status, seo_title, seo_description, sku, barcode, cost_price');
  }

  // Check product_stock table
  const { data: stockData, error: stockError } = await supabase
    .from('product_stock')
    .select('sku, barcode, cost_price')
    .limit(1);

  if (stockError) {
      if (stockError.code === 'PGRST100') {
         console.error('❌ Missing columns in product_stock table!');
         console.error(stockError.message);
      } else {
         console.error('Error querying product_stock:', stockError.message);
      }
  } else {
    console.log('✅ `product_stock` table has new columns: sku, barcode, cost_price');
  }
}

checkColumns();

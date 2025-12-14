
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gyizmixhmrfwywvafdbi.supabase.co'
const supabaseAnonKey = 'sb_publishable_J7XVC8I7VhmAvUhKH-Qu3A_uBeLMkt8'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkStockAnon() {
  console.log('--- Checking with ANON KEY ---')
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, name, slug, product_stock(*)')
    .ilike('slug', '%cream-hoodie%')
  
  if (prodError) {
    console.error('Error fetching product:', prodError)
    return
  }

  if (!products || products.length === 0) {
    console.log('Product "cream-hoodie" not found.')
    return
  }

  const product = products[0]
  console.log(`Found Product: ${product.name}`)
  console.log('Stock Data:', product.product_stock)

  if (!product.product_stock || product.product_stock.length === 0) {
      console.log('❌ Stock is EMPTY (Blocked by RLS?)')
  } else {
      console.log('✅ Stock is VISIBLE')
  }
}

checkStockAnon()

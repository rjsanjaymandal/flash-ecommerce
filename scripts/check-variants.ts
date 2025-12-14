
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gyizmixhmrfwywvafdbi.supabase.co'
const supabaseAnonKey = 'sb_publishable_J7XVC8I7VhmAvUhKH-Qu3A_uBeLMkt8'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkProductVariants() {
  console.log('--- Checking Product Variants ---')
  const { data: products, error } = await supabase
    .from('products')
    .select('name, size_options, color_options, product_stock(*)')
    .ilike('slug', '%cream-hoodie%')
  
  if (error) {
      console.error(error)
      return
  }

  if (products && products.length > 0) {
      console.log('Product Data:', JSON.stringify(products[0], null, 2))
  } else {
      console.log('Product not found')
  }
}

checkProductVariants()


import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
const supabaseUrl = 'https://gyizmixhmrfwywvafdbi.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5aXptaXhobXJmd3l3dmFmZGJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUyNDU5NywiZXhwIjoyMDgxMTAwNTk3fQ.0yGPlIhXnZi2RYSH36fmVDgK_hxVKd_5l5RaX1RDjrM'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkStock() {
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, name, slug')
    .ilike('slug', '%cream-hoodie%')
  
  if (prodError) {
    console.error('Error fetching product:', prodError)
    return
  }

  if (!products || products.length === 0) {
    console.log('Product "cream-hoodie" not found in DB.')
    return
  }

  const product = products[0]
  console.log(`Found Product: ${product.name} (ID: ${product.id})`)

  const { data: stock, error: stockError } = await supabase
    .from('product_stock')
    .select('*')
    .eq('product_id', product.id)

  if (stockError) {
    console.error('Error fetching stock:', stockError)
    return
  }

  console.log('Stock Entries:', stock)
}

checkStock()

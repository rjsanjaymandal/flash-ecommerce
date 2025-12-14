
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gyizmixhmrfwywvafdbi.supabase.co'
const supabaseAnonKey = 'sb_publishable_J7XVC8I7VhmAvUhKH-Qu3A_uBeLMkt8'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkVisibility() {
  console.log('--- Checking Public Visibility (Anon Key) ---')

  // 1. Categories
  const { data: cats, error: catError } = await supabase.from('categories').select('id, name').limit(5)
  if (catError) console.error('❌ Categories Error:', catError.code, catError.message)
  else console.log(`✅ Categories Visible: ${cats?.length || 0} rows found.`, cats ? cats.map(c => c.name) : '')

  // 2. Products
  const { data: prods, error: prodError } = await supabase.from('products').select('id, name').limit(5)
  if (prodError) console.error('❌ Products Error:', prodError.code, prodError.message)
  else console.log(`✅ Products Visible: ${prods?.length || 0} rows found.`, prods ? prods.map(p => p.name) : '')

  // 3. Product Stock
  const { data: stock, error: stockError } = await supabase.from('product_stock').select('id, size, quantity').limit(5)
  if (stockError) console.error('❌ Stock Error:', stockError.code, stockError.message)
  else console.log(`✅ Stock Visible: ${stock?.length || 0} rows found.`)
  
  // 4. Products + Stock (Join)
  if (prods && prods.length > 0) {
      const p = prods[0]
      const { data: joined, error: joinError } = await supabase
        .from('products')
        .select('name, product_stock(*)')
        .eq('id', p.id)
        .single()
      
      if (joinError) console.error('❌ Product+Stock Join Error:', joinError.code, joinError.message)
      else console.log(`✅ Product Link Visible: ${joined?.name} has ${joined?.product_stock?.length} stock entries.`)
  }
}

checkVisibility()

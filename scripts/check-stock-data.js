
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkStock() {
  console.log('Checking product_stock...')
  // Select items where size might be empty
  const { data, error } = await supabase
    .from('product_stock')
    .select('*')
    .limit(100)
  
  if (error) {
    console.error('Error:', error)
    return
  }

  let foundEmpty = false
  let foundNull = false

  data.forEach(item => {
    const sizeType = item.size === null ? 'NULL' : (item.size === '' ? 'EMPTY_STRING' : `"${item.size}"`)
    const colorType = item.color === null ? 'NULL' : (item.color === '' ? 'EMPTY_STRING' : `"${item.color}"`)
    
    if (item.size === '' || item.size === null) {
      console.log(`Product: ${item.product_id}, Size: ${sizeType}, Color: ${colorType}`)
      if (item.size === '') foundEmpty = true
      if (item.size === null) foundNull = true
    }
  })

  console.log('--- Summary ---')
  console.log('Found Empty Strings:', foundEmpty)
  console.log('Found NULLs:', foundNull)
}

checkStock()
